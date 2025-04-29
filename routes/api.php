<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ScriptController;
use App\Http\Controllers\QuizController;

// API routes dengan prefix /api
Route::get('/scripts', [ScriptController::class, 'database']);
Route::get('/web/database', [ScriptController::class, 'database']);
Route::get('/quiz-data', [QuizController::class, 'getQuizData']);
