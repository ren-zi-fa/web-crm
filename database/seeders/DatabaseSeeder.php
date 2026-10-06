<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            DealStageSeeder::class,
        ]);

        $admin = User::factory()->create([
            'name' => 'Admin CRM',
            'email' => 'admin@example.com',
        ]);

        $admin->assignRole('admin');

        $this->call(DemoDataSeeder::class);
    }
}
