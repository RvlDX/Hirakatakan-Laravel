<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Script;

class QuizController extends Controller
{
    public function index()
    {
        $scripts = Script::with('categories.subCategories.questions')->get();
        return view('quiz.index', compact('scripts'));
    }

    public function getQuizData()
    {
        $scripts = Script::with('categories.subCategories.questions')->get();
        return response()->json($scripts);
    }
}
