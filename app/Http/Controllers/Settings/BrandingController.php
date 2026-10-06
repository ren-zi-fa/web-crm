<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\BrandingUpdateRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandingController extends Controller
{
    /**
     * Show the branding configuration page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/branding', [
            'appName' => Setting::get('app_name', config('app.name')),
            'logoUrl' => Setting::logoUrl(),
            'themePrimary' => Setting::get('theme_primary'),
            'themeIntensity' => (int) Setting::get('theme_intensity', '50'),
            'themeSidebarTinted' => Setting::get('theme_sidebar_tinted', '1') === '1',
        ]);
    }

    /**
     * Update the application branding.
     */
    public function update(BrandingUpdateRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Setting::set('app_name', $data['app_name']);
        Setting::set('theme_primary', $data['theme_primary'] ?? null);
        Setting::set('theme_intensity', (string) ($data['theme_intensity'] ?? 50));
        Setting::set('theme_sidebar_tinted', $request->boolean('theme_sidebar_tinted') ? '1' : '0');

        if ($request->hasFile('logo')) {
            $this->deleteLogo();

            $path = $request->file('logo')->store('branding', 'public');

            if ($path !== false) {
                Setting::set('logo_path', $path);
            }
        } elseif ($request->boolean('remove_logo')) {
            $this->deleteLogo();
            Setting::set('logo_path', null);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Branding berhasil diperbarui.']);

        return to_route('branding.edit');
    }

    private function deleteLogo(): void
    {
        $path = Setting::get('logo_path');

        if (filled($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
