<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Deal>
 */
class DealFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'contact_id' => Contact::factory(),
            'deal_stage_id' => DealStage::factory(),
            'title' => $this->faker->randomElement([
                'Pembuatan Website Company Profile',
                'Pembuatan Aplikasi Kasir',
                'Paket Maintenance Tahunan',
                'Perbaikan Website',
                'Redesign Landing Page',
            ]),
            'value' => $this->faker->numberBetween(2, 60) * 1_000_000,
            'expected_close_date' => $this->faker->dateTimeBetween('now', '+3 months')->format('Y-m-d'),
            'assigned_to' => null,
            'source' => $this->faker->randomElement(['Website', 'Instagram', 'Referral', 'WhatsApp']),
            'lost_reason' => null,
            'won_at' => null,
        ];
    }

    public function won(): static
    {
        return $this->state(fn (): array => [
            'won_at' => now(),
            'lost_reason' => null,
        ]);
    }
}
