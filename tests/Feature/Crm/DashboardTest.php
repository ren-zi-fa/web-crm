<?php

use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStage;
use App\Models\Task;
use Database\Seeders\DealStageSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([RoleAndPermissionSeeder::class, DealStageSeeder::class]);
});

test('the dashboard reports won deals from the current month only', function () {
    $won = DealStage::query()->where('slug', 'won')->firstOrFail();

    Deal::factory()->create([
        'deal_stage_id' => $won->id,
        'won_at' => now(),
        'value' => 5_000_000,
    ]);

    Deal::factory()->create([
        'deal_stage_id' => $won->id,
        'won_at' => now()->subMonthsNoOverflow(1),
        'value' => 9_000_000,
    ]);

    $this->actingAs(crmAdmin())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('kpi.wonDealsThisMonth', 1)
            ->where('kpi.wonValueThisMonth', fn ($value) => (float) $value === 5_000_000.0)
        );
});

test('the dashboard excludes won and lost deals from the open pipeline value', function () {
    $qualified = DealStage::query()->where('slug', 'qualified')->firstOrFail();
    $won = DealStage::query()->where('slug', 'won')->firstOrFail();
    $lost = DealStage::query()->where('slug', 'lost')->firstOrFail();

    Deal::factory()->create(['deal_stage_id' => $qualified->id, 'value' => 3_000_000]);
    Deal::factory()->create(['deal_stage_id' => $won->id, 'won_at' => now(), 'value' => 5_000_000]);
    Deal::factory()->create(['deal_stage_id' => $lost->id, 'value' => 7_000_000]);

    $this->actingAs(crmAdmin())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('kpi.openDeals', 1)
            ->where('kpi.openPipelineValue', fn ($value) => (float) $value === 3_000_000.0)
        );
});

test('the dashboard counts overdue tasks', function () {
    Task::factory()->create(['due_at' => now()->subDay()]);
    Task::factory()->create(['due_at' => now()->addWeek()]);
    Task::factory()->completed()->create(['due_at' => now()->subDay()]);

    $this->actingAs(crmAdmin())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('kpi.overdueTasks', 1)
        );
});

test('the dashboard lists deals that need attention within two weeks', function () {
    $stage = DealStage::query()->where('slug', 'proposal')->firstOrFail();
    $contact = Contact::factory()->create();

    Deal::factory()->for($contact)->create([
        'deal_stage_id' => $stage->id,
        'title' => 'Butuh perhatian',
        'expected_close_date' => now()->addDays(5)->toDateString(),
    ]);

    Deal::factory()->create([
        'deal_stage_id' => $stage->id,
        'title' => 'Masih lama',
        'expected_close_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs(crmAdmin())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('attentionDeals', 1)
            ->where('attentionDeals.0.title', 'Butuh perhatian')
        );
});

test('the dashboard reports revenue grouped by stage', function () {
    $qualified = DealStage::query()->where('slug', 'qualified')->firstOrFail();

    Deal::factory()->count(2)->create(['deal_stage_id' => $qualified->id]);

    $this->actingAs(crmAdmin())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('pipelineByStage')
            ->where('pipelineByStage', function ($stages) {
                return collect($stages)->firstWhere('name', 'Qualified')['count'] === 2;
            })
        );
});
