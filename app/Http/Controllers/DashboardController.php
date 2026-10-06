<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\DealStage;
use App\Models\Task;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the operational dashboard.
     */
    public function index(): Response
    {
        CarbonImmutable::setLocale('id');

        $now = CarbonImmutable::now();

        return Inertia::render('dashboard', [
            'kpi' => $this->kpi($now),
            'revenueTrend' => $this->revenueTrend($now),
            'pipelineByStage' => $this->pipelineByStage(),
            'priorityTasks' => $this->priorityTasks(),
            'attentionDeals' => $this->attentionDeals($now),
        ]);
    }

    /**
     * @return array<string, float|int>
     */
    private function kpi(CarbonImmutable $now): array
    {
        $wonThisMonth = Deal::query()
            ->whereNotNull('won_at')
            ->whereBetween('won_at', [$now->startOfMonth(), $now->endOfMonth()]);

        return [
            'openPipelineValue' => (float) Deal::query()->open()->sum('value'),
            'openDeals' => Deal::query()->open()->count(),
            'wonValueThisMonth' => (float) (clone $wonThisMonth)->sum('value'),
            'wonDealsThisMonth' => (clone $wonThisMonth)->count(),
            'overdueTasks' => Task::query()->overdue()->count(),
        ];
    }

    /**
     * @return array<int, array{label: string, value: float}>
     */
    private function revenueTrend(CarbonImmutable $now): array
    {
        return collect(range(5, 0))
            ->map(function (int $monthsAgo) use ($now): array {
                $month = $now->subMonths($monthsAgo);

                $value = Deal::query()
                    ->whereNotNull('won_at')
                    ->whereBetween('won_at', [$month->startOfMonth(), $month->endOfMonth()])
                    ->sum('value');

                return [
                    'label' => $month->translatedFormat('M Y'),
                    'value' => (float) $value,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{name: string, color: string|null, count: int, value: float}>
     */
    private function pipelineByStage(): array
    {
        return DealStage::query()
            ->where('is_lost', false)
            ->ordered()
            ->withCount('deals')
            ->withSum('deals', 'value')
            ->get()
            ->map(fn (DealStage $stage): array => [
                'name' => $stage->name,
                'color' => $stage->color,
                'count' => (int) $stage->deals_count,
                'value' => (float) $stage->deals_sum_value,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function priorityTasks(): array
    {
        return Task::query()
            ->open()
            ->with(['assignedUser:id,name', 'taskable'])
            ->orderByRaw('due_at is null')
            ->orderBy('due_at')
            ->limit(8)
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
                'related' => $this->relatedName($task->taskable),
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function attentionDeals(CarbonImmutable $now): array
    {
        return Deal::query()
            ->open()
            ->whereNotNull('expected_close_date')
            ->where('expected_close_date', '<=', $now->addDays(14)->toDateString())
            ->with(['contact:id,name', 'stage:id,name,color,is_won,is_lost'])
            ->orderBy('expected_close_date')
            ->limit(8)
            ->get()
            ->map(fn (Deal $deal): array => [
                'id' => $deal->id,
                'title' => $deal->title,
                'value' => $deal->value,
                'expected_close_date' => $deal->expected_close_date?->toDateString(),
                'contact' => $deal->contact?->only(['id', 'name']),
                'stage' => $deal->stage?->only(['id', 'name', 'color', 'is_won', 'is_lost']),
            ])
            ->all();
    }

    /**
     * @return array{type: string, id: int, name: string}|null
     */
    private function relatedName(mixed $taskable): ?array
    {
        if ($taskable === null) {
            return null;
        }

        return [
            'type' => class_basename($taskable),
            'id' => (int) $taskable->getKey(),
            'name' => $taskable instanceof Deal ? $taskable->title : $taskable->name,
        ];
    }
}
