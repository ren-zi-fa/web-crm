<?php

namespace Database\Factories;

use App\Models\DealStage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<DealStage>
 */
class DealStageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->word();

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'sort_order' => 0,
            'color' => $this->faker->randomElement(['#64748b', '#0ea5e9', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444']),
            'is_won' => false,
            'is_lost' => false,
        ];
    }

    public function won(): static
    {
        return $this->state(fn (): array => ['is_won' => true]);
    }

    public function lost(): static
    {
        return $this->state(fn (): array => ['is_lost' => true]);
    }
}
