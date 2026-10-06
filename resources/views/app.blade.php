<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php($branding = $page['props']['settings'] ?? [])
        @php($palette = $branding['theme_palette']['light'] ?? [])

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }
        </style>

        <script>
            window.__APP_NAME__ = @json($branding['app_name'] ?? config('app.name'));
        </script>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        @if(!empty($branding['logo_url']))
            <link rel="icon" href="{{ $branding['logo_url'] }}">
        @endif

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $branding['app_name'] ?? config('app.name', 'Laravel') }}</title>
        </x-inertia::head>

        {{-- Brand palette stored in the database, mapped to shadcn variables. Placed after the
             compiled CSS so it always takes precedence over the default variables. --}}
        <style id="branding-theme">
            :root {
                @foreach($palette as $token => $value)
                    {{ $token }}: {{ $value }};
                @endforeach
            }
        </style>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
