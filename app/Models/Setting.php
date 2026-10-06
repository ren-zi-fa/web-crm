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
     * Dark mode surface base used when tinting brand colors.
     */
    private const DARK_BASE = '#0b0b0f';

    /**
     * Maximum tint strength (in percentage points) at intensity 100.
     */
    private const MAX_TINT = 8.0;

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

        self::flushCache();
    }

    /**
     * Forget the cached settings so the next read hits the database.
     */
    public static function flushCache(): void
    {
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
     * Build the light and dark CSS variable overrides for the active theme.
     *
     * @return array{light: array<string, string>, dark: array<string, string>}
     */
    public static function themePalette(): array
    {
        $primary = self::get('theme_primary');
        $intensity = (int) self::get('theme_intensity', '50');

        if (blank($primary) || $intensity <= 0) {
            return ['light' => [], 'dark' => []];
        }

        $primary = self::normalizeHex($primary);
        $tint = ($intensity / 100) * self::MAX_TINT;
        $sidebarTinted = self::get('theme_sidebar_tinted', '1') === '1';

        $darkPrimary = self::luminance($primary) < 0.45
            ? self::mix($primary, '#ffffff', 20)
            : $primary;

        $light = [
            '--primary' => $primary,
            '--primary-foreground' => self::contrastForeground($primary),
            '--ring' => $primary,
            '--background' => self::mix($primary, '#ffffff', $tint),
            '--card' => self::mix($primary, '#ffffff', $tint * 0.5),
            '--popover' => self::mix($primary, '#ffffff', $tint * 0.5),
            '--accent' => self::mix($primary, '#ffffff', $tint * 1.2),
            '--secondary' => self::mix($primary, '#ffffff', $tint * 1.2),
            '--muted' => self::mix($primary, '#ffffff', $tint),
        ];

        $dark = [
            '--primary' => $darkPrimary,
            '--primary-foreground' => self::contrastForeground($darkPrimary),
            '--ring' => $darkPrimary,
            '--background' => self::mix($primary, self::DARK_BASE, $tint),
            '--card' => self::mix($primary, self::DARK_BASE, $tint * 0.7),
            '--popover' => self::mix($primary, self::DARK_BASE, $tint * 0.7),
            '--accent' => self::mix($primary, self::DARK_BASE, $tint * 1.2),
            '--secondary' => self::mix($primary, self::DARK_BASE, $tint * 1.2),
            '--muted' => self::mix($primary, self::DARK_BASE, $tint),
        ];

        if ($sidebarTinted) {
            $light['--sidebar'] = self::mix($primary, '#ffffff', $tint * 0.8);
            $light['--sidebar-accent'] = self::mix($primary, '#ffffff', $tint * 1.2);
            $dark['--sidebar'] = self::mix($primary, self::DARK_BASE, $tint * 0.8);
            $dark['--sidebar-accent'] = self::mix($primary, self::DARK_BASE, $tint * 1.2);
        }

        $light['--sidebar-primary'] = $primary;
        $light['--sidebar-primary-foreground'] = self::contrastForeground($primary);
        $light['--sidebar-ring'] = $primary;
        $dark['--sidebar-primary'] = $darkPrimary;
        $dark['--sidebar-primary-foreground'] = self::contrastForeground($darkPrimary);
        $dark['--sidebar-ring'] = $darkPrimary;

        return ['light' => $light, 'dark' => $dark];
    }

    /**
     * Pick a readable text color for the given hex background.
     */
    public static function contrastForeground(string $hex): string
    {
        return self::luminance($hex) > 0.6
            ? 'oklch(0.145 0 0)'
            : 'oklch(0.985 0 0)';
    }

    /**
     * Mix a color into a base color by the given weight percentage.
     */
    public static function mix(string $color, string $base, float $percent): string
    {
        $ratio = max(0.0, min(100.0, $percent)) / 100;

        [$redA, $greenA, $blueA] = self::rgb($color);
        [$redB, $greenB, $blueB] = self::rgb($base);

        $red = (int) round($redA * $ratio + $redB * (1 - $ratio));
        $green = (int) round($greenA * $ratio + $greenB * (1 - $ratio));
        $blue = (int) round($blueA * $ratio + $blueB * (1 - $ratio));

        return sprintf('#%02x%02x%02x', $red, $green, $blue);
    }

    /**
     * Relative luminance (0 dark - 1 light) of the given hex color.
     */
    public static function luminance(string $hex): float
    {
        [$red, $green, $blue] = self::rgb($hex);

        return (0.2126 * $red + 0.7152 * $green + 0.0722 * $blue) / 255;
    }

    /**
     * Normalize a hex color into the #rrggbb format.
     */
    public static function normalizeHex(string $hex): string
    {
        $value = ltrim(trim($hex), '#');

        if (strlen($value) === 3) {
            $value = $value[0].$value[0].$value[1].$value[1].$value[2].$value[2];
        }

        if (strlen($value) !== 6 || preg_match('/^[0-9a-fA-F]{6}$/', $value) !== 1) {
            return '#000000';
        }

        return '#'.strtolower($value);
    }

    /**
     * Split a hex color into its red, green and blue channels.
     *
     * @return array{int, int, int}
     */
    private static function rgb(string $hex): array
    {
        $value = ltrim(self::normalizeHex($hex), '#');

        return [
            (int) hexdec(substr($value, 0, 2)),
            (int) hexdec(substr($value, 2, 2)),
            (int) hexdec(substr($value, 4, 2)),
        ];
    }
}
