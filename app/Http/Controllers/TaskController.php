<?php

namespace App\Http\Controllers;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Requests\Crm\StoreTaskRequest;
use App\Http\Requests\Crm\UpdateTaskRequest;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Task::class);

        $filters = [
            'status' => $request->string('status')->toString(),
        ];

        $tasks = Task::query()
            ->with(['assignedUser:id,name', 'taskable'])
            ->when($filters['status'] === 'overdue', fn ($query) => $query->overdue())
            ->when($filters['status'] !== '' && $filters['status'] !== 'overdue', fn ($query) => $query->where('status', $filters['status']))
            ->orderByRaw('due_at is null')
            ->orderBy('due_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Task $task): array => $this->serializeTask($task));

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'filters' => $filters,
            'statusOptions' => TaskStatus::options(),
            'priorityOptions' => TaskPriority::options(),
            'users' => User::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created task.
     */
    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $this->authorize('create', Task::class);

        $task = Task::query()->create([
            'title' => $request->string('title')->toString(),
            'description' => $request->input('description'),
            'due_at' => $request->date('due_at'),
            'remind_at' => $request->date('remind_at'),
            'status' => $request->enum('status', TaskStatus::class) ?? TaskStatus::Pending,
            'priority' => $request->enum('priority', TaskPriority::class) ?? TaskPriority::Medium,
            'assigned_to' => $request->input('assigned_to'),
        ]);

        $taskable = $this->resolveTaskable($request);

        if ($taskable !== null) {
            $taskable->tasks()->save($task);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tugas berhasil dibuat.']);

        return back();
    }

    /**
     * Update the given task.
     */
    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $task->update([
            'title' => $request->string('title')->toString(),
            'description' => $request->input('description'),
            'due_at' => $request->date('due_at'),
            'remind_at' => $request->date('remind_at'),
            'status' => $request->enum('status', TaskStatus::class),
            'priority' => $request->enum('priority', TaskPriority::class),
            'assigned_to' => $request->input('assigned_to'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tugas berhasil diperbarui.']);

        return back();
    }

    /**
     * Toggle the completion state of the given task.
     */
    public function complete(Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $isCompleted = $task->status === TaskStatus::Completed;

        $task->update([
            'status' => $isCompleted ? TaskStatus::Pending : TaskStatus::Completed,
            'completed_at' => $isCompleted ? null : now(),
        ]);

        return back();
    }

    /**
     * Delete the given task.
     */
    public function destroy(Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tugas berhasil dihapus.']);

        return back();
    }

    private function resolveTaskable(Request $request): Contact|Deal|null
    {
        return match ($request->input('taskable_type')) {
            'contact' => Contact::query()->findOrFail($request->integer('taskable_id')),
            'deal' => Deal::query()->findOrFail($request->integer('taskable_id')),
            default => null,
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeTask(Task $task): array
    {
        $taskable = $task->taskable;

        $related = null;

        if ($taskable instanceof Contact) {
            $related = ['type' => 'Contact', 'id' => $taskable->id, 'name' => $taskable->name];
        }

        if ($taskable instanceof Deal) {
            $related = ['type' => 'Deal', 'id' => $taskable->id, 'name' => $taskable->title];
        }

        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'due_at' => $task->due_at?->toIso8601String(),
            'status' => $task->status->value,
            'status_label' => $task->status->label(),
            'priority' => $task->priority->value,
            'priority_label' => $task->priority->label(),
            'assigned_to' => $task->assignedUser?->only(['id', 'name']),
            'related' => $related,
        ];
    }
}
