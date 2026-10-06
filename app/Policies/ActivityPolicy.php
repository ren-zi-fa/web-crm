<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view activities');
    }

    public function view(User $user, Activity $activity): bool
    {
        return $user->can('view activities');
    }

    public function create(User $user): bool
    {
        return $user->can('create activities');
    }

    public function update(User $user, Activity $activity): bool
    {
        return $user->can('update activities');
    }

    public function delete(User $user, Activity $activity): bool
    {
        return $user->can('delete activities');
    }
}
