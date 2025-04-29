@extends('layouts.app')

@section('title', 'Game | クイズ 日本語')

@section('content')
    <section id="game-page" class="page active">
        <div class="content-wrapper game-layout">
            <div class="game-header">
                <span id="question-counter">Soal 1/10</span>
                <span id="current-score">Skor: 0</span>
            </div>
            <div id="question-display" class="question-card"></div>
            <div id="feedback-area" class="feedback-placeholder"></div>
            <div id="options-container" class="options-grid"></div>
            <div class="button-group">
                <button id="quit-game-button" class="btn btn-danger">
                    <i class="fas fa-times-circle"></i> Keluar
                </button>
            </div>
            <canvas id="confetti-canvas"></canvas>
        </div>
    </section>
@endsection

