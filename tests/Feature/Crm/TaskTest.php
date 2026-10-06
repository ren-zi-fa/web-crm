<?php

use App\Enums\TaskStatus;
use App\Models\Contact;
use App\Models\Task;
use App\Models\User;
use Database\Seeders\DealStageSeeder;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed([RoleAndPermissionSeeder::class, DealStageSeeder::class]);
});

test('guests are redirected to the login page when viewing tasks', function () {
    $this->get(route('tasks.index'))->assertRedirect(route('login'));
});

test('a user without permission cannot view tasks', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('tasks.index'))
        ->assertForbidden();
});

test('an admin can list tasks', function () {
    Task::factory()->count(2)->create();

    $this->actingAs(crmAdmin())
        ->get(route('tasks.index'))
        ->assertOk();
});

test('an admin can create a task linked to a contact', function () {
    $contact = Contact::factory()->create();

    $this->actingAs(crmAdmin())
        ->post(route('tasks.store'), [
            'title' => 'Follow up penawaran',
            'taskable_type' => 'contact',
            'taskable_id' => $contact->id,
            'priority' => 'high',
        ])
        ->assertRedirect();

    expect($contact->tasks()->count())->toBe(1);
});

test('creating a task requires a title', function () {
    $this->actingAs(crmAdmin())
        ->post(route('tasks.store'), [])
        ->assertSessionHasErrors('title');
});

test('an admin can toggle task completion', function () {
    $task = Task::factory()->create();

    $this->actingAs(crmAdmin())
        ->patch(route('tasks.complete', $task))
        ->assertRedirect();

    expect($task->fresh()->status)->toBe(TaskStatus::Completed);

    $this->actingAs(crmAdmin())
        ->patch(route('tasks.complete', $task))
        ->assertRedirect();

    expect($task->fresh()->status)->toBe(TaskStatus::Pending);
});

test('an admin can delete a task', function () {
    $task = Task::factory()->create();

    $this->actingAs(crmAdmin())
        ->delete(route('tasks.destroy', $task))
        ->assertRedirect();

    expect(Task::query()->whereKey($task->id)->exists())->toBeFalse();
});
