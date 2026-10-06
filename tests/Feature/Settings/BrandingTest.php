<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests are redirected to the login page when viewing branding', function () {
    $this->get(route('branding.edit'))->assertRedirect(route('login'));
});

test('an authenticated user can view the branding page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('branding.edit'))
        ->assertOk();
});

test('updating branding persists the application name', function () {
    $this->actingAs(User::factory()->create())
        ->patch(route('branding.update'), ['app_name' => 'CRM Saya'])
        ->assertRedirect(route('branding.edit'));

    expect(Setting::get('app_name'))->toBe('CRM Saya');
});

test('updating branding persists the theme color', function () {
    $this->actingAs(User::factory()->create())
        ->patch(route('branding.update'), [
            'app_name' => 'CRM Saya',
            'theme_primary' => '#16a34a',
        ])
        ->assertRedirect(route('branding.edit'));

    expect(Setting::get('theme_primary'))->toBe('#16a34a');
});

test('updating branding persists the theme intensity and sidebar option', function () {
    $this->actingAs(User::factory()->create())
        ->patch(route('branding.update'), [
            'app_name' => 'CRM Saya',
            'theme_intensity' => 80,
            'theme_sidebar_tinted' => false,
        ])
        ->assertRedirect(route('branding.edit'));

    expect(Setting::get('theme_intensity'))->toBe('80')
        ->and(Setting::get('theme_sidebar_tinted'))->toBe('0');
});

test('the theme palette is derived from the primary color', function () {
    Setting::set('theme_primary', '#4f46e5');
    Setting::set('theme_intensity', '50');
    Setting::set('theme_sidebar_tinted', '1');

    $palette = Setting::themePalette();

    expect($palette['light']['--primary'])->toBe('#4f46e5')
        ->and($palette['light']['--background'])->not->toBe('#ffffff')
        ->and($palette['light'])->toHaveKey('--sidebar')
        ->and($palette['dark']['--background'])->not->toBe('#0b0b0f');
});

test('no palette overrides are produced without a primary color', function () {
    expect(Setting::themePalette())->toBe(['light' => [], 'dark' => []]);
});

test('the palette omits the sidebar when sidebar tinting is disabled', function () {
    Setting::set('theme_primary', '#4f46e5');
    Setting::set('theme_sidebar_tinted', '0');

    $palette = Setting::themePalette();

    expect($palette['light'])->not->toHaveKey('--sidebar')
        ->and($palette['light'])->not->toHaveKey('--sidebar-accent');
});

test('the application name is required', function () {
    $this->actingAs(User::factory()->create())
        ->patch(route('branding.update'), ['app_name' => ''])
        ->assertSessionHasErrors('app_name');
});

test('the theme color must be a valid hex value', function () {
    $this->actingAs(User::factory()->create())
        ->patch(route('branding.update'), [
            'app_name' => 'CRM Saya',
            'theme_primary' => 'green',
        ])
        ->assertSessionHasErrors('theme_primary');
});

test('updating branding stores an uploaded logo', function () {
    Storage::fake('public');

    $this->actingAs(User::factory()->create())
        ->post(route('branding.update'), [
            'app_name' => 'CRM Saya',
            'logo' => UploadedFile::fake()->create('logo.png', 100, 'image/png'),
        ])
        ->assertRedirect(route('branding.edit'));

    $path = Setting::get('logo_path');

    expect($path)->not->toBeNull();
    Storage::disk('public')->assertExists($path);
});

test('updating branding can remove the existing logo', function () {
    Storage::fake('public');
    Storage::disk('public')->put('branding/old.png', 'content');
    Setting::set('logo_path', 'branding/old.png');

    $this->actingAs(User::factory()->create())
        ->patch(route('branding.update'), [
            'app_name' => 'CRM Saya',
            'remove_logo' => true,
        ])
        ->assertRedirect(route('branding.edit'));

    expect(Setting::get('logo_path'))->toBeNull();
    Storage::disk('public')->assertMissing('branding/old.png');
});

test('the stored theme color is rendered into the page head', function () {
    Setting::set('theme_primary', '#16a34a');
    Setting::set('theme_intensity', '50');

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertSee('--primary: #16a34a', false)
        ->assertSee('--background:', false);
});

test('the stored application name is rendered into the page title', function () {
    Setting::set('app_name', 'CRM Keren');

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertSee('CRM Keren', false);
});
