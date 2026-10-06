<?php

namespace Database\Seeders;

use App\Enums\LifecycleStage;
use App\Models\Activity;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStage;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $owner = User::query()->first();
        $stages = DealStage::query()->ordered()->get();

        Contact::factory()
            ->count(24)
            ->create(['assigned_to' => $owner?->id])
            ->each(function (Contact $contact) use ($stages, $owner): void {
                $stage = $stages->random();

                $deal = Deal::factory()->create([
                    'contact_id' => $contact->id,
                    'deal_stage_id' => $stage->id,
                    'assigned_to' => $owner?->id,
                    'won_at' => $stage->is_won ? now() : null,
                ]);

                if ($stage->is_won) {
                    $contact->update(['lifecycle_stage' => LifecycleStage::Customer]);
                }

                Activity::factory()
                    ->count(2)
                    ->for($contact, 'activitable')
                    ->create(['user_id' => $owner?->id]);

                Task::factory()
                    ->count(2)
                    ->for($deal, 'taskable')
                    ->create(['assigned_to' => $owner?->id]);
            });
    }
}
