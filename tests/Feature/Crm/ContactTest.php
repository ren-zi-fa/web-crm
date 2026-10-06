<?php

use App\Enums\LifecycleStage;
use App\Models\Contact;
use App\Models\User;
use Database\Seeders\DealStageSeeder;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed([RoleAndPermissionSeeder::class, DealStageSeeder::class]);
});

test('guests are redirected to the login page when viewing contacts', function () {
    $this->get(route('contacts.index'))->assertRedirect(route('login'));
});

test('a user without permission cannot view contacts', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('contacts.index'))
        ->assertForbidden();
});

test('an admin can view the contact list', function () {
    Contact::factory()->count(3)->create();

    $this->actingAs(crmAdmin())
        ->get(route('contacts.index'))
        ->assertOk();
});

test('an admin can create a contact', function () {
    $this->actingAs(crmAdmin())
        ->post(route('contacts.store'), [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'phone' => '081230000001',
            'lifecycle_stage' => LifecycleStage::Lead->value,
        ])
        ->assertRedirect();

    expect(Contact::query()->where('email', 'budi@example.com')->exists())->toBeTrue();
});

test('creating a contact requires a name and lifecycle stage', function () {
    $this->actingAs(crmAdmin())
        ->post(route('contacts.store'), [])
        ->assertSessionHasErrors(['name', 'lifecycle_stage']);
});

test('creating a contact rejects a malformed email', function () {
    $this->actingAs(crmAdmin())
        ->post(route('contacts.store'), [
            'name' => 'Budi',
            'email' => 'not-an-email',
            'lifecycle_stage' => LifecycleStage::Lead->value,
        ])
        ->assertSessionHasErrors('email');
});

test('an admin can update a contact', function () {
    $contact = Contact::factory()->create();

    $this->actingAs(crmAdmin())
        ->put(route('contacts.update', $contact), [
            'name' => 'Nama Baru',
            'lifecycle_stage' => LifecycleStage::Customer->value,
        ])
        ->assertRedirect(route('contacts.show', $contact));

    expect($contact->fresh()->lifecycle_stage)->toBe(LifecycleStage::Customer);
});

test('an admin can delete a contact', function () {
    $contact = Contact::factory()->create();

    $this->actingAs(crmAdmin())
        ->delete(route('contacts.destroy', $contact))
        ->assertRedirect(route('contacts.index'));

    $this->assertSoftDeleted($contact);
});
