<?php

use App\Enums\LifecycleStage;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStage;
use App\Models\User;
use Database\Seeders\DealStageSeeder;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed([RoleAndPermissionSeeder::class, DealStageSeeder::class]);
});

test('guests are redirected to the login page when viewing the pipeline', function () {
    $this->get(route('pipeline.index'))->assertRedirect(route('login'));
});

test('a user without permission cannot view the pipeline', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('pipeline.index'))
        ->assertForbidden();
});

test('an admin can view the pipeline', function () {
    $this->actingAs(crmAdmin())
        ->get(route('pipeline.index'))
        ->assertOk();
});

test('moving a deal changes its stage', function () {
    $deal = Deal::factory()->create();
    $target = DealStage::query()->where('slug', 'qualified')->firstOrFail();

    $this->actingAs(crmAdmin())
        ->patch(route('deals.stage.update', $deal), [
            'deal_stage_id' => $target->id,
        ])
        ->assertRedirect();

    expect($deal->fresh()->deal_stage_id)->toBe($target->id);
});

test('moving a deal to a won stage promotes the contact to a customer', function () {
    $contact = Contact::factory()->create(['lifecycle_stage' => LifecycleStage::Lead]);
    $deal = Deal::factory()->for($contact)->create();
    $won = DealStage::query()->where('slug', 'won')->firstOrFail();

    $this->actingAs(crmAdmin())
        ->patch(route('deals.stage.update', $deal), [
            'deal_stage_id' => $won->id,
        ])
        ->assertRedirect();

    expect($contact->fresh()->lifecycle_stage)->toBe(LifecycleStage::Customer)
        ->and($deal->fresh()->won_at)->not->toBeNull();
});

test('moving a deal to a lost stage requires a reason', function () {
    $deal = Deal::factory()->create();
    $lost = DealStage::query()->where('slug', 'lost')->firstOrFail();

    $this->actingAs(crmAdmin())
        ->patch(route('deals.stage.update', $deal), [
            'deal_stage_id' => $lost->id,
        ])
        ->assertSessionHasErrors('lost_reason');

    expect($deal->fresh()->deal_stage_id)->not->toBe($lost->id);
});

test('moving a deal to a lost stage stores the reason', function () {
    $deal = Deal::factory()->create();
    $lost = DealStage::query()->where('slug', 'lost')->firstOrFail();

    $this->actingAs(crmAdmin())
        ->patch(route('deals.stage.update', $deal), [
            'deal_stage_id' => $lost->id,
            'lost_reason' => 'Harga terlalu tinggi',
        ])
        ->assertRedirect();

    expect($deal->fresh()->lost_reason)->toBe('Harga terlalu tinggi');
});
