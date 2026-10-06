<?php

namespace App\Http\Controllers;

use App\Enums\ActivityType;
use App\Http\Requests\Crm\StoreActivityRequest;
use App\Http\Requests\Crm\UpdateActivityRequest;
use App\Models\Activity;
use App\Models\Contact;
use App\Models\Deal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    /**
     * Display a listing of activities.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Activity::class);

        $filters = [
            'type' => $request->string('type')->toString(),
        ];

        $activities = Activity::query()
            ->with(['user:id,name', 'activitable'])
            ->when($filters['type'] !== '', fn ($query) => $query->where('type', $filters['type']))
            ->latest('occurred_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Activity $activity): array => $this->serializeActivity($activity));

        return Inertia::render('activities/index', [
            'activities' => $activities,
            'filters' => $filters,
            'typeOptions' => ActivityType::options(),
        ]);
    }

    /**
     * Store a newly created activity.
     */
    public function store(StoreActivityRequest $request): RedirectResponse
    {
        $this->authorize('create', Activity::class);

        $activity = Activity::query()->create([
            'type' => $request->enum('type', ActivityType::class),
            'subject' => $request->input('subject'),
            'body' => $request->input('body'),
            'occurred_at' => $request->date('occurred_at'),
            'user_id' => $request->user()?->id,
        ]);

        $activitable = $this->resolveActivitable($request);

        if ($activitable !== null) {
            $activitable->activities()->save($activity);

            if ($activitable instanceof Contact) {
                $activitable->update(['last_contacted_at' => $activity->occurred_at]);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Aktivitas berhasil dicatat.']);

        return back();
    }

    /**
     * Update the given activity.
     */
    public function update(UpdateActivityRequest $request, Activity $activity): RedirectResponse
    {
        $this->authorize('update', $activity);

        $activity->update([
            'type' => $request->enum('type', ActivityType::class),
            'subject' => $request->input('subject'),
            'body' => $request->input('body'),
            'occurred_at' => $request->date('occurred_at'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Aktivitas berhasil diperbarui.']);

        return back();
    }

    /**
     * Delete the given activity.
     */
    public function destroy(Activity $activity): RedirectResponse
    {
        $this->authorize('delete', $activity);

        $activity->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Aktivitas berhasil dihapus.']);

        return back();
    }

    private function resolveActivitable(Request $request): Contact|Deal|null
    {
        return match ($request->input('activitable_type')) {
            'contact' => Contact::query()->findOrFail($request->integer('activitable_id')),
            'deal' => Deal::query()->findOrFail($request->integer('activitable_id')),
            default => null,
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeActivity(Activity $activity): array
    {
        $activitable = $activity->activitable;

        $related = null;

        if ($activitable instanceof Contact) {
            $related = ['type' => 'Contact', 'id' => $activitable->id, 'name' => $activitable->name];
        }

        if ($activitable instanceof Deal) {
            $related = ['type' => 'Deal', 'id' => $activitable->id, 'name' => $activitable->title];
        }

        return [
            'id' => $activity->id,
            'type' => $activity->type->value,
            'type_label' => $activity->type->label(),
            'subject' => $activity->subject,
            'body' => $activity->body,
            'occurred_at' => $activity->occurred_at->toIso8601String(),
            'user' => $activity->user?->only(['id', 'name']),
            'related' => $related,
        ];
    }
}
