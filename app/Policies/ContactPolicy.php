<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;

class ContactPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view contacts');
    }

    public function view(User $user, Contact $contact): bool
    {
        return $user->can('view contacts');
    }

    public function create(User $user): bool
    {
        return $user->can('create contacts');
    }

    public function update(User $user, Contact $contact): bool
    {
        return $user->can('update contacts');
    }

    public function delete(User $user, Contact $contact): bool
    {
        return $user->can('delete contacts');
    }
}
