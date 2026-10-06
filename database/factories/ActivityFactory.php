<?php

namespace Database\Factories;

use App\Enums\ActivityType;
use App\Models\Activity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement(ActivityType::cases()),
            'subject' => $this->faker->sentence(4),
            'body' => $this->faker->paragraph(),
            'occurred_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'user_id' => null,
        ];
    }
}
