<?php

use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStage;
use App\Models\User;
use Database\Seeders\DealStageSeeder;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed([RoleAndPermissionSeeder::class, DealStageSeeder::class]);
});

test('guests are redirected to the login page when viewing deals', function () {
    $this->get(route('deals.index'))->assertRedirect(route('login'));
});

test('a user without permission cannot view deals', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('deals.index'))
        ->assertForbidden();
});

test('an admin can view the deal list', function () {
    Deal::factory()->count(3)->create();

    $this->actingAs(crmAdmin())
        ->get(route('deals.index'))
        ->assertOk();
});

test('an admin can create a deal', function () {
    $contact = Contact::factory()->create();
    $stage = DealStage::query()->ordered()->firstOrFail();

    $this->actingAs(crmAdmin())
        ->post(route('deals.store'), [
            'contact_id' => $contact->id,
            'deal_stage_id' => $stage->id,
            'title' => 'Pembuatan Website',
            'value' => 15000000,
        ])
        ->assertRedirect();

    expect(Deal::query()->where('title', 'Pembuatan Website')->exists())->toBeTrue();
});

test('creating a deal requires a contact, stage and title', function () {
    $this->actingAs(crmAdmin())
        ->post(route('deals.store'), [])
        ->assertSessionHasErrors(['contact_id', 'deal_stage_id', 'title', 'value']);
});

test('an admin can update a deal', function () {
    $deal = Deal::factory()->create(['title' => 'Judul Lama']);

    $this->actingAs(crmAdmin())
        ->put(route('deals.update', $deal), [
            'contact_id' => $deal->contact_id,
            'deal_stage_id' => $deal->deal_stage_id,
            'title' => 'Judul Baru',
            'value' => 20000000,
        ])
        ->assertRedirect(route('deals.show', $deal));

    expect($deal->fresh()->title)->toBe('Judul Baru');
});

test('an admin can delete a deal', function () {
    $deal = Deal::factory()->create();

    $this->actingAs(crmAdmin())
        ->delete(route('deals.destroy', $deal))
        ->assertRedirect(route('deals.index'));

    $this->assertSoftDeleted($deal);
});
