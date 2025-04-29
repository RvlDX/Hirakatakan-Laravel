@extends('layouts.app')

@section('title', 'Result | クイズ 日本語')

@section('content')
    <section id="result-page" class="page active">
        <div class="content-wrapper">
            <h2>Hasil Quiz</h2>
            <div class="result-summary card">
                <div class="result-item">
                    <i class="fas fa-list-ol result-icon"></i>
                    <span>Total Soal:</span>
                    <strong id="result-total">0</strong>
                </div>
                <div class="result-item correct">
                    <i class="fas fa-check-circle result-icon"></i>
                    <span>Jawaban Benar:</span>
                    <strong id="result-correct">0</strong>
                </div>
                <div class="result-item incorrect">
                    <i class="fas fa-times-circle result-icon"></i>
                    <span>Jawaban Salah:</span>
                    <strong id="result-wrong">0</strong>
                </div>
                <div class="result-item percentage">
                    <i class="fas fa-percentage result-icon"></i>
                    <span>Persentase Benar:</span>
                    <strong id="result-percentage">0%</strong>
                </div>
                <div class="progress-bar-container">
                    <div id="result-progress-bar" class="progress-bar"></div>
                </div>
            </div>
            <div class="button-group vertical">
                <button id="try-again-button" class="btn btn-primary"><i class="fas fa-redo"></i> Coba Lagi (Soal
                    Sama)</button>
                <button id="new-categories-button" class="btn btn-secondary"><i class="fas fa-layer-group"></i>
                    Pilih Kategori Lain</button>
                <button id="home-button" class="btn btn-secondary"><i class="fas fa-home"></i> Kembali ke
                    Home</button>
            </div>
        </div>
    </section>
@endsection
