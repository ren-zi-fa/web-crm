<?php

use App\Models\Setting;

test('contrast foreground is dark for light backgrounds', function () {
    expect(Setting::contrastForeground('#ffffff'))->toBe('oklch(0.145 0 0)');
});

test('contrast foreground is light for dark backgrounds', function () {
    expect(Setting::contrastForeground('#111111'))->toBe('oklch(0.985 0 0)');
});

test('contrast foreground falls back for an invalid color', function () {
    expect(Setting::contrastForeground('not-a-color'))->toBe('oklch(0.985 0 0)');
});

test('mixing at zero percent returns the base color', function () {
    expect(Setting::mix('#4f46e5', '#ffffff', 0))->toBe('#ffffff');
});

test('mixing at one hundred percent returns the source color', function () {
    expect(Setting::mix('#4f46e5', '#ffffff', 100))->toBe('#4f46e5');
});

test('mixing blends both colors evenly', function () {
    expect(Setting::mix('#000000', '#ffffff', 50))->toBe('#808080');
});

test('luminance is higher for light colors', function () {
    expect(Setting::luminance('#ffffff'))->toBeGreaterThan(Setting::luminance('#000000'));
});
