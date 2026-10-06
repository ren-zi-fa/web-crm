<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaults = [
            'app_name' => config('app.name', 'Laravel'),
            'logo_path' => null,
            'theme_primary' => null,
            'theme_intensity' => '50',
            'theme_sidebar_tinted' => '1',
        ];

        foreach ($defaults as $key => $value) {
            Setting::query()->firstOrCreate(['key' => $key], ['value' => $value]);
        }

        Setting::flushCache();
    }
}
