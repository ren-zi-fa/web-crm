<?php

namespace Database\Seeders;

use App\Models\DealStage;
use Illuminate\Database\Seeder;

class DealStageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stages = [
            ['name' => 'Lead', 'slug' => 'lead', 'color' => '#64748b'],
            ['name' => 'Contacted', 'slug' => 'contacted', 'color' => '#0ea5e9'],
            ['name' => 'Qualified', 'slug' => 'qualified', 'color' => '#8b5cf6'],
            ['name' => 'Proposal', 'slug' => 'proposal', 'color' => '#f59e0b'],
            ['name' => 'Negotiation', 'slug' => 'negotiation', 'color' => '#f97316'],
            ['name' => 'Won', 'slug' => 'won', 'color' => '#22c55e', 'is_won' => true],
            ['name' => 'Lost', 'slug' => 'lost', 'color' => '#ef4444', 'is_lost' => true],
        ];

        foreach ($stages as $index => $stage) {
            DealStage::query()->updateOrCreate(
                ['slug' => $stage['slug']],
                [
                    'name' => $stage['name'],
                    'sort_order' => $index + 1,
                    'color' => $stage['color'],
                    'is_won' => $stage['is_won'] ?? false,
                    'is_lost' => $stage['is_lost'] ?? false,
                ],
            );
        }
    }
}
