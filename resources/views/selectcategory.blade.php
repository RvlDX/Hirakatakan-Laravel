@extends('layouts.app')

@section('title', 'Select Category | クイズ 日本語')

@section('content')
    <section id="category-selection-page" class="page active">
        <div class="content-wrapper">
            <h2><span class="jp-char">②</span> Pilih Kategori <span id="selected-script-title"></span></h2>
            <p class="selection-hint">Klik kategori utama, lalu pilih minimal satu subkategori.</p>
            <div id="main-category-container" class="category-accordion">
                <!-- Kategori akan dimuat lewat JavaScript -->
                </div>
            <div class="button-group start-game-group">
                <button id="start-game-button" class="btn btn-primary" disabled>
                    <i class="fas fa-flag-checkered"></i> Mulai Game
                    </button>
                <a href="{{ url('/selectscript') }}" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Kembali ke Skrip
                    </a>
                </div>
            </div>
    </section>
@endsection
