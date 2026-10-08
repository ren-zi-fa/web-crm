<?php

use App\Models\User;

test('redirects guests from home to login', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});

test('redirects authenticated users from home to dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertRedirect(route('dashboard'));
});
