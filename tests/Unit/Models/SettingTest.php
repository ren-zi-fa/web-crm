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
