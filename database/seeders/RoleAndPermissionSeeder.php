<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $resources = ['contacts', 'deals', 'tasks', 'activities'];

        $permissions = [];

        foreach ($resources as $resource) {
            foreach (['view', 'create', 'update', 'delete'] as $action) {
                $permissions[] = "{$action} {$resource}";
                Permission::findOrCreate("{$action} {$resource}", 'web');
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = Role::findOrCreate('admin', 'web');
        $admin->syncPermissions($permissions);

        $sales = Role::findOrCreate('sales', 'web');
        $sales->syncPermissions($permissions);

        $support = Role::findOrCreate('support', 'web');
        $support->syncPermissions([
            'view contacts',
            'view deals',
            'view tasks',
            'create tasks',
            'update tasks',
            'view activities',
            'create activities',
        ]);
    }
}
