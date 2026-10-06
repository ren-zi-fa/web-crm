<?php

namespace App\Http\Controllers;

use App\Actions\Crm\MoveDealToStage;
use App\Http\Requests\Crm\UpdateDealStageRequest;
use App\Models\Deal;
use App\Models\DealStage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PipelineController extends Controller
{
    /**
     * Display the sales pipeline as a kanban board.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Deal::class);

        $stages = DealStage::query()
            ->ordered()
            ->with(['deals' => fn ($query) => $query->with('contact:id,name')->latest()])
            ->get()
            ->map(fn (DealStage $stage): array => [
                'id' => $stage->id,
                'name' => $stage->name,
                'slug' => $stage->slug,
                'color' => $stage->color,
                'is_won' => $stage->is_won,
                'is_lost' => $stage->is_lost,
                'deals' => $stage->deals
                    ->map(fn (Deal $deal): array => [
                        'id' => $deal->id,
                        'title' => $deal->title,
                        'value' => $deal->value,
                        'contact' => $deal->contact?->only(['id', 'name']),
                    ])
                    ->values()
                    ->all(),
            ]);

        return Inertia::render('deals/kanban', [
            'stages' => $stages,
        ]);
    }

    /**
     * Move the given deal to another pipeline stage.
     */
    public function updateStage(
        UpdateDealStageRequest $request,
        Deal $deal,
        MoveDealToStage $moveDealToStage,
    ): RedirectResponse {
        $this->authorize('update', $deal);

        $stage = DealStage::query()->findOrFail($request->integer('deal_stage_id'));

        if ($stage->is_lost && blank($request->input('lost_reason'))) {
            throw ValidationException::withMessages([
                'lost_reason' => 'Alasan kehilangan wajib diisi.',
            ]);
        }

        $moveDealToStage->handle($deal, $stage, $request->string('lost_reason')->toString() ?: null);

        return back();
    }
}
