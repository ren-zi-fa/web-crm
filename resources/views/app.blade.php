<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php($branding = $page['props']['settings'] ?? [])

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        @if(!empty($branding['theme_primary']))
            {{-- Brand primary color stored in the database, mapped to shadcn variables --}}
            <style>
                :root {
                    --primary: {{ $branding['theme_primary'] }};
                    --primary-foreground: {{ $branding['theme_primary_foreground'] ?? 'oklch(0.985 0 0)' }};
                    --ring: {{ $branding['theme_primary'] }};
                    --sidebar-primary: {{ $branding['theme_primary'] }};
                    --sidebar-primary-foreground: {{ $branding['theme_primary_foreground'] ?? 'oklch(0.985 0 0)' }};
                    --sidebar-ring: {{ $branding['theme_primary'] }};
                }
            </style>
        @endif

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
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
