@extends('layouts.app')

@section('title', 'Beranda | クイズ 日本語')

@section('content')
    <section id="home-page" class="page active">
        <div class="content-wrapper">
            <img
                src="{{ asset('img/icon.jpg') }}"
                alt="Icon" class="home-icon">
            <h2>Irasshaimase!</h2>
            <p class="tagline">Uji pengetahuan Hiragana, Katakana, dan Kanji Anda!</p>

            <div class="explanation card">
                <h3>Pengenalan Singkat</h3>
                <p><strong>Hiragana (ひらがな)</strong><br>Silabari dasar untuk kata-kata asli, partikel, dll.
                </p>
                <p><strong>Katakana (カタカナ)</strong><br>Untuk kata serapan, onomatopoeia, penekanan.</p>
                <p><strong>Kanji (漢字)</strong><br>Karakter logografis dari Tiongkok.</p>
                </div>

            <div class="button-group">
                <button id="start-quiz-button" class="btn btn-primary">
                    <i class="fas fa-play"></i> Mulai Quiz
                    </button>
                <button id="start-learning-button" class="btn btn-secondary">
                    <i class="fas fa-book-open"></i> Sumber Belajar
                    </button>
                </div>
            </div>
        </section>
@endsection
