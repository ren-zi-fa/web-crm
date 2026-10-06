<?php

namespace App\Policies;

use App\Models\Deal;
use App\Models\User;

class DealPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view deals');
    }

    public function view(User $user, Deal $deal): bool
    {
        return $user->can('view deals');
    }

    public function create(User $user): bool
    {
        return $user->can('create deals');
    }

    public function update(User $user, Deal $deal): bool
    {
        return $user->can('update deals');
    }

    public function delete(User $user, Deal $deal): bool
    {
        return $user->can('delete deals');
    }
}
