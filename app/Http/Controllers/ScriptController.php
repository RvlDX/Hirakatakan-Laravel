<?php

namespace App\Http\Controllers;

use App\Models\Script;
use App\Models\Category;     // Pastikan di-import
use App\Models\SubCategory; // Pastikan di-import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ScriptController extends Controller
{
    /**
     * Menampilkan semua data script dengan format sesuai struktur seeder.
     */
    public function database()
    {
        try {
            // Eager load relasi: scripts -> categories -> subCategories -> questions
            // Pastikan relasi di model Eloquent sudah benar (hasMany, belongsTo)
            $scripts = Script::with(['categories.subCategories.questions'])->get();

            $formattedScripts = [];

            foreach ($scripts as $script) {
                $scriptData = [
                    // Tidak ada key script di level ini dalam format output akhir,
                    // tapi kita buat array of scripts. Key script ada di DB.
                    // Jika ingin output persis seperti $quizData (object dengan script key),
                    // perlu penyesuaian lagi di akhir. Format array lebih umum untuk API list.
                    'key' => $script->key, // Memasukkan key script untuk identifikasi
                    'title' => $script->title,
                    'categories' => []
                ];

                foreach ($script->categories as $category) {
                    $categoryData = [
                        'name' => $category->name, // Nama kategori (e.g., 'Basic (Gojūon)')
                        'subCategories' => []
                    ];

                    foreach ($category->subCategories as $subCategory) {
                        $questionsData = [];
                        if ($subCategory->questions) {
                            foreach ($subCategory->questions as $question) {
                                if ($question->character !== null && $question->reading !== null) {
                                    // Key: character, Value: reading
                                    $questionsData[$question->character] = $question->reading;
                                }
                            }
                        }

                        // Key: subCategory->key (e.g., 'Vowels', 'K-')
                        // Value: objek questions
                        // Pastikan subCategory memiliki kolom 'key' di DB
                        $subCategoryKey = $subCategory->key ?? 'unknown_sub_key_' . $subCategory->id;
                        $categoryData['subCategories'][$subCategoryKey] = $questionsData;
                    }

                    // Key: category->key (e.g., 'basic', 'dakuten')
                    // Value: objek categoryData (name & subCategories)
                    // Pastikan category memiliki kolom 'key' di DB
                    $categoryKey = $category->key ?? 'unknown_cat_key_' . $category->id;
                    $scriptData['categories'][$categoryKey] = $categoryData;
                }
                $formattedScripts[] = $scriptData; // Menambahkan script ke array hasil
            }

            return response()->json($formattedScripts, 200, [
                'Content-Type' => 'application/json',
                'Cache-Control' => 'no-cache, private'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching database: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menyimpan data satu script baru beserta relasinya dari request
     * dengan format yang mirip struktur dalam seeder.
     */
    public function store(Request $request)
    {
        // Validasi untuk satu script per request
        $validatedData = $request->validate([
            'key' => 'required|string|unique:scripts,key', // Key script utama
            'title' => 'required|string',                 // Title script utama
            'categories' => 'required|array',             // Object categories
            'categories.*.name' => 'required|string',     // Nama untuk setiap kategori
            'categories.*.subCategories' => 'required|array', // Object subCategories
            'categories.*.subCategories.*' => 'required|array', // Object questions (char => reading)
        ]);

        DB::beginTransaction();

        try {
            // 1. Buat atau update Script (menggunakan updateOrCreate agar bisa dipakai untuk update juga)
             $script = Script::updateOrCreate(
                ['key' => $validatedData['key']], // Kondisi pencarian
                ['title' => $validatedData['title']] // Data untuk create/update
             );

             // Opsi: Hapus relasi lama jika ini adalah operasi update untuk menghindari duplikat
             // $script->categories()->delete(); // Hati-hati: Ini menghapus semua kategori terkait!

            // 2. Iterasi melalui categories (key = categoryKey, value = categoryData)
            foreach ($validatedData['categories'] as $categoryKey => $categoryData) {

                // Validasi tambahan dalam loop jika diperlukan
                if (!isset($categoryData['name']) || !isset($categoryData['subCategories']) || !is_array($categoryData['subCategories'])) {
                    throw new \InvalidArgumentException("Struktur data tidak valid untuk kategori key: {$categoryKey}");
                }

                // Buat record Category
                $category = $script->categories()->create([
                    'key' => $categoryKey,          // Simpan categoryKey dari input
                    'name' => $categoryData['name'], // Simpan categoryName dari input
                ]);

                // 3. Iterasi melalui subCategories (key = subCategoryKey, value = questionsData)
                foreach ($categoryData['subCategories'] as $subCategoryKey => $questionsData) {

                    if (!is_array($questionsData)) {
                        throw new \InvalidArgumentException("Struktur questions tidak valid untuk subkategori key: {$subCategoryKey} dalam kategori key: {$categoryKey}");
                    }

                    // Buat record SubCategory
                    // Hanya menyimpan 'key', sesuai dengan seeder
                    $subCategory = $category->subCategories()->create([
                        'key' => $subCategoryKey, // Simpan subCategoryKey dari input
                        // 'name' => $subCategoryKey // TIDAK ADA 'name' di seeder/schema ini
                    ]);

                    // 4. Iterasi melalui questions (key = character, value = reading)
                    foreach ($questionsData as $character => $reading) {
                        if (is_string($character) && is_string($reading)) { // Lebih spesifik
                            // Buat record Question
                            $subCategory->questions()->create([
                                'character' => $character,
                                'reading' => $reading,
                            ]);
                        } else {
                            Log::warning("Skipping invalid question data for subcategory key {$subCategoryKey}: ", ['char' => $character, 'read' => $reading]);
                        }
                    }
                }
            }

            DB::commit();

            // Load relasi untuk data respons
            $script->load('categories.subCategories.questions');

            // Format data respons agar mirip output database()
            $responseData = [
                'key' => $script->key,
                'title' => $script->title,
                'categories' => []
            ];
            foreach ($script->categories as $cat) {
                $catData = ['name' => $cat->name, 'subCategories' => []];
                foreach ($cat->subCategories as $subCat) {
                    $qData = [];
                    if ($subCat->questions) { // Check if questions relation is loaded and not null
                       foreach ($subCat->questions as $q) {
                            $qData[$q->character] = $q->reading;
                       }
                    }
                    // Gunakan subCat->key sebagai kunci
                    $catData['subCategories'][$subCat->key ?? 'nokey'] = $qData;
                }
                 // Gunakan cat->key sebagai kunci
                $responseData['categories'][$cat->key ?? 'nokey'] = $catData;
            }


            return response()->json([
                'status' => 'success',
                'message' => 'Script dan relasi berhasil disimpan/diupdate.',
                'data' => $responseData
            ], 201); // 201 Created (atau 200 OK jika update)

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid.',
                'errors' => $e->errors()
            ], 422);
        } catch (\InvalidArgumentException $e) {
            DB::rollBack();
            Log::error('Invalid argument during store: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Struktur data input tidak valid: ' . $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing script: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }
}