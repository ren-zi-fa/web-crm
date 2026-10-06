<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * @property int $id
 * @property string $key
 * @property string|null $value
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    /**
     * The cache key that stores every setting.
     */
    private const CACHE_KEY = 'settings.values';

    /**
     * Get every setting as a key/value array.
     *
     * @return array<string, string|null>
     */
    public static function values(): array
    {
        return Cache::rememberForever(
            self::CACHE_KEY,
            fn (): array => self::query()->pluck('value', 'key')->all(),
        );
    }

    /**
     * Get a single setting value.
     */
    public static function get(string $key, ?string $default = null): ?string
    {
        $value = self::values()[$key] ?? null;

        return $value ?? $default;
    }

    /**
     * Persist a single setting value.
     */
    public static function set(string $key, ?string $value): void
    {
        self::query()->updateOrCreate(['key' => $key], ['value' => $value]);

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Get the public URL of the uploaded logo, if any.
     */
    public static function logoUrl(): ?string
    {
        $path = self::get('logo_path');

        if (blank($path)) {
            return null;
        }

        $base = rtrim((string) config('filesystems.disks.public.url'), '/');

        return $base.'/'.ltrim($path, '/');
    }

    /**
     * Pick a readable text color for the given hex background.
     */
    public static function contrastForeground(string $hex): string
    {
        $hex = ltrim($hex, '#');

        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        if (strlen($hex) !== 6 || preg_match('/^[0-9a-fA-F]{6}$/', $hex) !== 1) {
            return 'oklch(0.985 0 0)';
        }

        $red = hexdec(substr($hex, 0, 2)) / 255;
        $green = hexdec(substr($hex, 2, 2)) / 255;
        $blue = hexdec(substr($hex, 4, 2)) / 255;

        $luminance = 0.2126 * $red + 0.7152 * $green + 0.0722 * $blue;

        return $luminance > 0.6 ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)';
    }
}
