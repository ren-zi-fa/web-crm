<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => Setting::get('app_name') ?: config('app.name'),
            'settings' => fn (): array => $this->sharedSettings(),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Share the application branding configuration with every response.
     *
     * @return array<string, mixed>
     */
    protected function sharedSettings(): array
    {
        $primary = Setting::get('theme_primary');

        return [
            'app_name' => Setting::get('app_name') ?: config('app.name'),
            'logo_url' => Setting::logoUrl(),
            'theme_primary' => $primary,
            'theme_primary_foreground' => filled($primary) ? Setting::contrastForeground($primary) : null,
            'theme_intensity' => (int) Setting::get('theme_intensity', '50'),
            'theme_sidebar_tinted' => Setting::get('theme_sidebar_tinted', '1') === '1',
            'theme_palette' => Setting::themePalette(),
        ];
    }
}
