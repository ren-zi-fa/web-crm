<?php

namespace App\Http\Controllers;

use App\Enums\ActivityType;
use App\Enums\LifecycleStage;
use App\Enums\TaskPriority;
use App\Http\Requests\Crm\StoreContactRequest;
use App\Http\Requests\Crm\UpdateContactRequest;
use App\Models\Activity;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display a listing of contacts.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Contact::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'stage' => $request->string('stage')->toString(),
        ];

        $contacts = Contact::query()
            ->with('assignedUser:id,name')
            ->withCount('deals')
            ->search($filters['search'])
            ->lifecycle($filters['stage'])
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Contact $contact): array => [
                'id' => $contact->id,
                'name' => $contact->name,
                'email' => $contact->email,
                'phone' => $contact->phone,
                'whatsapp' => $contact->whatsapp,
                'city' => $contact->city,
                'source' => $contact->source,
                'lifecycle_stage' => $contact->lifecycle_stage->value,
                'lifecycle_label' => $contact->lifecycle_stage->label(),
                'deals_count' => $contact->deals_count,
                'assigned_to' => $contact->assignedUser?->only(['id', 'name']),
            ]);

        return Inertia::render('contacts/index', [
            'contacts' => $contacts,
            'filters' => $filters,
            'stageOptions' => LifecycleStage::options(),
        ]);
    }

    /**
     * Show the form for creating a contact.
     */
    public function create(): Response
    {
        $this->authorize('create', Contact::class);

        return Inertia::render('contacts/create', [
            'stageOptions' => LifecycleStage::options(),
            'users' => User::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created contact.
     */
    public function store(StoreContactRequest $request): RedirectResponse
    {
        $this->authorize('create', Contact::class);

        $contact = Contact::query()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kontak berhasil dibuat.']);

        return to_route('contacts.show', $contact);
    }

    /**
     * Display the given contact.
     */
    public function show(Contact $contact): Response
    {
        $this->authorize('view', $contact);

        $contact->load('assignedUser:id,name');

        return Inertia::render('contacts/show', [
            'contact' => [
                'id' => $contact->id,
                'name' => $contact->name,
                'email' => $contact->email,
                'phone' => $contact->phone,
                'whatsapp' => $contact->whatsapp,
                'address' => $contact->address,
                'city' => $contact->city,
                'province' => $contact->province,
                'source' => $contact->source,
                'notes' => $contact->notes,
                'lifecycle_stage' => $contact->lifecycle_stage->value,
                'lifecycle_label' => $contact->lifecycle_stage->label(),
                'assigned_to' => $contact->assignedUser?->only(['id', 'name']),
                'created_at' => $contact->created_at?->toDateString(),
            ],
            'deals' => $contact->deals()
                ->with('stage:id,name,color,is_won,is_lost')
                ->latest()
                ->get()
                ->map(fn (Deal $deal): array => $this->serializeDeal($deal)),
            'activities' => $contact->activities()
                ->with('user:id,name')
                ->latest('occurred_at')
                ->get()
                ->map(fn (Activity $activity): array => $this->serializeActivity($activity)),
            'tasks' => $contact->tasks()
                ->with('assignedUser:id,name')
                ->latest('due_at')
                ->get()
                ->map(fn (Task $task): array => $this->serializeTask($task)),
            'activityTypes' => ActivityType::options(),
            'taskPriorities' => TaskPriority::options(),
        ]);
    }

    /**
     * Show the form for editing the given contact.
     */
    public function edit(Contact $contact): Response
    {
        $this->authorize('update', $contact);

        return Inertia::render('contacts/edit', [
            'contact' => $contact->only([
                'id',
                'name',
                'email',
                'phone',
                'whatsapp',
                'address',
                'city',
                'province',
                'source',
                'lifecycle_stage',
                'assigned_to',
                'notes',
            ]),
            'stageOptions' => LifecycleStage::options(),
            'users' => User::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the given contact.
     */
    public function update(UpdateContactRequest $request, Contact $contact): RedirectResponse
    {
        $this->authorize('update', $contact);

        $contact->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kontak berhasil diperbarui.']);

        return to_route('contacts.show', $contact);
    }

    /**
     * Delete the given contact.
     */
    public function destroy(Contact $contact): RedirectResponse
    {
        $this->authorize('delete', $contact);

        $contact->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kontak berhasil dihapus.']);

        return to_route('contacts.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeDeal(Deal $deal): array
    {
        return [
            'id' => $deal->id,
            'title' => $deal->title,
            'value' => $deal->value,
            'expected_close_date' => $deal->expected_close_date?->toDateString(),
            'stage' => $deal->stage?->only(['id', 'name', 'color', 'is_won', 'is_lost']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeActivity(Activity $activity): array
    {
        return [
            'id' => $activity->id,
            'type' => $activity->type->value,
            'type_label' => $activity->type->label(),
            'subject' => $activity->subject,
            'body' => $activity->body,
            'occurred_at' => $activity->occurred_at->toIso8601String(),
            'user' => $activity->user?->only(['id', 'name']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeTask(Task $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'due_at' => $task->due_at?->toIso8601String(),
            'status' => $task->status->value,
            'status_label' => $task->status->label(),
            'priority' => $task->priority->value,
            'priority_label' => $task->priority->label(),
            'assigned_to' => $task->assignedUser?->only(['id', 'name']),
        ];
    }
}
