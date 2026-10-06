<?php

namespace App\Http\Controllers;

use App\Actions\Crm\MoveDealToStage;
use App\Enums\ActivityType;
use App\Enums\TaskPriority;
use App\Http\Requests\Crm\StoreDealRequest;
use App\Http\Requests\Crm\UpdateDealRequest;
use App\Models\Activity;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\DealStage;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DealController extends Controller
{
    /**
     * Display a listing of deals.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Deal::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'stage' => $request->string('stage')->toString(),
        ];

        $deals = Deal::query()
            ->with(['contact:id,name', 'stage:id,name,color,is_won,is_lost', 'assignedUser:id,name'])
            ->when($filters['search'] !== '', fn ($query) => $query->where('title', 'like', "%{$filters['search']}%"))
            ->when($filters['stage'] !== '', fn ($query) => $query->where('deal_stage_id', $filters['stage']))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Deal $deal): array => $this->serializeDealListItem($deal));

        return Inertia::render('deals/index', [
            'deals' => $deals,
            'filters' => $filters,
            'stages' => $this->stages(),
        ]);
    }

    /**
     * Show the form for creating a deal.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Deal::class);

        return Inertia::render('deals/create', [
            'contacts' => Contact::query()->orderBy('name')->get(['id', 'name']),
            'stages' => $this->stages(),
            'users' => User::query()->orderBy('name')->get(['id', 'name']),
            'selectedContactId' => $request->integer('contact_id') ?: null,
        ]);
    }

    /**
     * Store a newly created deal.
     */
    public function store(StoreDealRequest $request, MoveDealToStage $moveDealToStage): RedirectResponse
    {
        $this->authorize('create', Deal::class);

        $deal = Deal::query()->create($request->validated());

        $stage = DealStage::query()->findOrFail($deal->deal_stage_id);
        $moveDealToStage->handle($deal, $stage, $request->string('lost_reason')->toString() ?: null);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Deal berhasil dibuat.']);

        return to_route('deals.show', $deal);
    }

    /**
     * Display the given deal.
     */
    public function show(Deal $deal): Response
    {
        $this->authorize('view', $deal);

        $deal->load(['contact:id,name', 'stage:id,name,color,is_won,is_lost', 'assignedUser:id,name']);

        return Inertia::render('deals/show', [
            'deal' => [
                ...$this->serializeDealListItem($deal),
                'expected_close_date' => $deal->expected_close_date?->toDateString(),
                'source' => $deal->source,
                'lost_reason' => $deal->lost_reason,
                'won_at' => $deal->won_at?->toIso8601String(),
                'created_at' => $deal->created_at?->toDateString(),
            ],
            'activities' => $deal->activities()
                ->with('user:id,name')
                ->latest('occurred_at')
                ->get()
                ->map(fn (Activity $activity): array => [
                    'id' => $activity->id,
                    'type' => $activity->type->value,
                    'type_label' => $activity->type->label(),
                    'subject' => $activity->subject,
                    'body' => $activity->body,
                    'occurred_at' => $activity->occurred_at->toIso8601String(),
                    'user' => $activity->user?->only(['id', 'name']),
                ]),
            'tasks' => $deal->tasks()
                ->with('assignedUser:id,name')
                ->latest('due_at')
                ->get()
                ->map(fn (Task $task): array => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'due_at' => $task->due_at?->toIso8601String(),
                    'status' => $task->status->value,
                    'status_label' => $task->status->label(),
                    'priority' => $task->priority->value,
                    'priority_label' => $task->priority->label(),
                    'assigned_to' => $task->assignedUser?->only(['id', 'name']),
                ]),
            'activityTypes' => ActivityType::options(),
            'taskPriorities' => TaskPriority::options(),
        ]);
    }

    /**
     * Show the form for editing the given deal.
     */
    public function edit(Deal $deal): Response
    {
        $this->authorize('update', $deal);

        return Inertia::render('deals/edit', [
            'deal' => [
                'id' => $deal->id,
                'contact_id' => $deal->contact_id,
                'deal_stage_id' => $deal->deal_stage_id,
                'title' => $deal->title,
                'value' => $deal->value,
                'expected_close_date' => $deal->expected_close_date?->toDateString(),
                'assigned_to' => $deal->assigned_to,
                'source' => $deal->source,
                'lost_reason' => $deal->lost_reason,
            ],
            'contacts' => Contact::query()->orderBy('name')->get(['id', 'name']),
            'stages' => $this->stages(),
            'users' => User::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the given deal.
     */
    public function update(UpdateDealRequest $request, Deal $deal, MoveDealToStage $moveDealToStage): RedirectResponse
    {
        $this->authorize('update', $deal);

        $deal->update($request->validated());

        $stage = DealStage::query()->findOrFail($deal->deal_stage_id);
        $moveDealToStage->handle($deal, $stage, $request->string('lost_reason')->toString() ?: null);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Deal berhasil diperbarui.']);

        return to_route('deals.show', $deal);
    }

    /**
     * Delete the given deal.
     */
    public function destroy(Deal $deal): RedirectResponse
    {
        $this->authorize('delete', $deal);

        $deal->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Deal berhasil dihapus.']);

        return to_route('deals.index');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function stages(): array
    {
        return DealStage::query()
            ->ordered()
            ->get(['id', 'name', 'slug', 'color', 'is_won', 'is_lost'])
            ->map(fn (DealStage $stage): array => [
                'id' => $stage->id,
                'name' => $stage->name,
                'slug' => $stage->slug,
                'color' => $stage->color,
                'is_won' => $stage->is_won,
                'is_lost' => $stage->is_lost,
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeDealListItem(Deal $deal): array
    {
        return [
            'id' => $deal->id,
            'title' => $deal->title,
            'value' => $deal->value,
            'contact' => $deal->contact?->only(['id', 'name']),
            'stage' => $deal->stage?->only(['id', 'name', 'color', 'is_won', 'is_lost']),
            'assigned_to' => $deal->assignedUser?->only(['id', 'name']),
        ];
    }
}
