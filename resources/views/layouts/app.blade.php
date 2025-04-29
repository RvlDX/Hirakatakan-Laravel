<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'クイズ 日本語 | Quiz Hirakatakan')</title>
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700&family=Poppins:wght@400;600&display=swap"
        rel="stylesheet">
</head>

<body class="light-theme">
    <div class="background-accent"></div>

    @include('partials.header')

    <main class="main-container">
        @yield('content')
    </main>

    <div id="notification-area" class="notification"></div>

    @include('partials.footer')

    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script src="{{ asset('js/script.js') }}"></script>
</body>

</html>
