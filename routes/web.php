<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\SelectScriptController;
use App\Http\Controllers\SelectCategoryController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\ScriptController;

// Home route
Route::get('/', [IndexController::class, 'index']);

// Quiz route
Route::get('/index', [IndexController::class, 'index'])->name('index');
Route::get('/selectscript', [SelectScriptController::class, 'index'])->name('selectscript');
Route::get('/selectcategory', [SelectCategoryController::class, 'index'])->name('selectcategory');
Route::get('/game', [GameController::class, 'index'])->name('game');
Route::get('/result', [ResultController::class, 'index'])->name('result');

//Learning route
Route::get('/learning', [LearningController::class, 'index'])->name('learning');

// Quiz data route - pastikan ini sesuai dengan URL yang digunakan di JavaScript
Route::get('/web/database', [ScriptController::class, 'database'])->name('web.database');
