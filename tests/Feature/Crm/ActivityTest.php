<?php

use App\Models\Activity;
use App\Models\Contact;
use App\Models\User;
use Database\Seeders\DealStageSeeder;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed([RoleAndPermissionSeeder::class, DealStageSeeder::class]);
});

test('guests are redirected to the login page when viewing activities', function () {
    $this->get(route('activities.index'))->assertRedirect(route('login'));
});

test('a user without permission cannot view activities', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('activities.index'))
        ->assertForbidden();
});

test('an admin can log an activity and it updates the contact last contacted time', function () {
    $contact = Contact::factory()->create(['last_contacted_at' => null]);

    $this->actingAs(crmAdmin())
        ->post(route('activities.store'), [
            'type' => 'call',
            'subject' => 'Telepon penawaran',
            'occurred_at' => now()->subHour()->toDateTimeString(),
            'activitable_type' => 'contact',
            'activitable_id' => $contact->id,
        ])
        ->assertRedirect();

    expect($contact->activities()->count())->toBe(1)
        ->and($contact->fresh()->last_contacted_at)->not->toBeNull();
});

test('logging an activity requires a type and time', function () {
    $this->actingAs(crmAdmin())
        ->post(route('activities.store'), [])
        ->assertSessionHasErrors(['type', 'occurred_at']);
});

test('an admin can delete an activity', function () {
    $activity = Activity::factory()->create();

    $this->actingAs(crmAdmin())
        ->delete(route('activities.destroy', $activity))
        ->assertRedirect();

    expect(Activity::query()->whereKey($activity->id)->exists())->toBeFalse();
});
