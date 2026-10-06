<?php

namespace Database\Factories;

use App\Enums\LifecycleStage;
use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Contact>
 */
class ContactFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->numerify('08##########'),
            'whatsapp' => $this->faker->numerify('08##########'),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'province' => $this->faker->randomElement(['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten', 'Bali', 'Sumatera Utara', 'Sulawesi Selatan']),
            'source' => $this->faker->randomElement(['Website', 'Instagram', 'Referral', 'WhatsApp', 'Marketplace']),
            'lifecycle_stage' => LifecycleStage::Lead,
            'assigned_to' => null,
            'notes' => null,
            'last_contacted_at' => null,
        ];
    }

    public function prospect(): static
    {
        return $this->state(fn (): array => ['lifecycle_stage' => LifecycleStage::Prospect]);
    }

    public function customer(): static
    {
        return $this->state(fn (): array => ['lifecycle_stage' => LifecycleStage::Customer]);
    }
}
