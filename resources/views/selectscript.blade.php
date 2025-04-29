@extends('layouts.app')

@section('title', 'Select Script | クイズ 日本語')

@section('content')
    <section id="script-selection-page" class="page active">
        <div class="content-wrapper">
            <h2><span class="jp-char">①</span> Pilih Skrip</h2>
            <div class="button-group vertical">
                <button class="btn btn-script" data-script="hiragana">Hiragana (ひらがな)</button>
                <button class="btn btn-script" data-script="katakana">Katakana (カタカナ)</button>
                <button class="btn btn-script" data-script="kanji">Kanji (漢字)</button>
                <a href="{{ url('/index') }}" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</a>
            </div>
        </div>
    </section>
@endsection
