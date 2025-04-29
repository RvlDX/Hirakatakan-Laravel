@extends('layouts.app')

@section('title', 'Learning | クイズ 日本語')

@section('content')
    <section id="learning-page" class="page active">
        <div class="content-wrapper">
            <div class="learning-header">
                <h2><span class="jp-char">学</span> Sumber Belajar</h2>
                <div class="script-tabs">
                    <button class="btn btn-script active" data-script="hiragana">Hiragana</button>
                    <button class="btn btn-script" data-script="katakana">Katakana</button>
                    <button class="btn btn-script" data-script="kanji">Kanji</button>
                    </div>
                </div>
            <div id="learning-content" class="learning-content">
                <p>Memuat data...</p>
                </div>
            <div class="button-group">
                <a href="{{ url('/index') }}" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Kembali ke Home
                    </a>
                </div>
            </div>
    </section>
@endsection
