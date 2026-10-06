import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import PipelineController from '@/actions/App/Http/Controllers/PipelineController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { KanbanDeal, KanbanStage } from '@/types';
import { show as dealShow } from '@/routes/deals';

function DealCard({
    deal,
    dragging = false,
}: {
    deal: KanbanDeal;
    dragging?: boolean;
}) {
    return (
        <div
            className={cn(
                'rounded-lg border bg-card p-3 shadow-xs',
                dragging && 'rotate-1 ring-2 ring-primary/40',
            )}
        >
            <Link
                href={dealShow(deal.id)}
                className="line-clamp-2 text-sm font-medium hover:underline"
            >
                {deal.title}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
                {deal.contact?.name ?? 'Tanpa kontak'}
            </p>
            <p className="mt-2 text-sm font-semibold">
                {formatCurrency(deal.value)}
            </p>
        </div>
    );
}

function SortableDealCard({ deal }: { deal: KanbanDeal }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: deal.id });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn('touch-none', isDragging && 'opacity-40')}
            {...attributes}
            {...listeners}
        >
            <DealCard deal={deal} />
        </div>
    );
}

function KanbanColumn({ stage }: { stage: KanbanStage }) {
    const { setNodeRef, isOver } = useDroppable({ id: `col-${stage.id}` });

    const total = stage.deals.reduce(
        (sum, deal) => sum + Number.parseFloat(deal.value),
        0,
    );

    return (
        <div className="flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40">
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                <div className="flex items-center gap-2">
                    <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: stage.color ?? '#64748b' }}
                    />
                    <span className="text-sm font-semibold">{stage.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {stage.deals.length}
                    </span>
                </div>
                <span className="text-xs text-muted-foreground">
                    {formatCurrency(total)}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    'flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto p-2',
                    isOver && 'bg-accent/40',
                )}
            >
                <SortableContext
                    items={stage.deals.map((deal) => deal.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {stage.deals.map((deal) => (
                        <SortableDealCard key={deal.id} deal={deal} />
                    ))}
                </SortableContext>

                {stage.deals.length === 0 && (
                    <p className="py-6 text-center text-xs text-muted-foreground">
                        Tidak ada deal
                    </p>
                )}
            </div>
        </div>
    );
}

function findStageOfDeal(
    columns: KanbanStage[],
    dealId: number,
): KanbanStage | undefined {
    return columns.find((stage) =>
        stage.deals.some((deal) => deal.id === dealId),
    );
}

export default function KanbanBoard({ stages }: { stages: KanbanStage[] }) {
    const [columns, setColumns] = useState<KanbanStage[]>(stages);
    const [activeDeal, setActiveDeal] = useState<KanbanDeal | null>(null);
    const [pendingLost, setPendingLost] = useState<{
        dealId: number;
        stageId: number;
    } | null>(null);
    const [lostReason, setLostReason] = useState('');
    const originStageId = useRef<number | null>(null);

    useEffect(() => {
        setColumns(stages);
    }, [stages]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    );

    const persist = (
        dealId: number,
        stageId: number,
        reason: string | null,
    ) => {
        router.patch(
            PipelineController.updateStage.url(dealId),
            { deal_stage_id: stageId, lost_reason: reason },
            {
                preserveScroll: true,
                onError: () => router.reload({ only: ['stages'] }),
            },
        );
    };

    const handleDragStart = (event: DragStartEvent) => {
        const dealId = Number(event.active.id);
        const stage = findStageOfDeal(columns, dealId);
        originStageId.current = stage?.id ?? null;
        setActiveDeal(stage?.deals.find((deal) => deal.id === dealId) ?? null);
    };

    const resolveOverStageId = (overId: number | string): number | null => {
        if (typeof overId === 'string' && overId.startsWith('col-')) {
            return Number(overId.replace('col-', ''));
        }

        return findStageOfDeal(columns, Number(overId))?.id ?? null;
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) {
            return;
        }

        const dealId = Number(active.id);
        const sourceStage = findStageOfDeal(columns, dealId);
        const targetStageId = resolveOverStageId(over.id);

        if (
            !sourceStage ||
            targetStageId === null ||
            sourceStage.id === targetStageId
        ) {
            return;
        }

        setColumns((previous) =>
            previous.map((stage) => {
                if (stage.id === sourceStage.id) {
                    return {
                        ...stage,
                        deals: stage.deals.filter((deal) => deal.id !== dealId),
                    };
                }

                if (stage.id === targetStageId) {
                    const deal = sourceStage.deals.find(
                        (item) => item.id === dealId,
                    );

                    if (!deal) {
                        return stage;
                    }

                    return { ...stage, deals: [...stage.deals, deal] };
                }

                return stage;
            }),
        );
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const dealId = Number(event.active.id);
        const finalStage = findStageOfDeal(columns, dealId);

        setActiveDeal(null);

        if (!finalStage || originStageId.current === null) {
            return;
        }

        if (finalStage.id === originStageId.current) {
            return;
        }

        if (finalStage.is_lost) {
            setLostReason('');
            setPendingLost({ dealId, stageId: finalStage.id });

            return;
        }

        persist(dealId, finalStage.id, null);
    };

    const cancelLost = () => {
        setPendingLost(null);
        setColumns(stages);
    };

    const confirmLost = () => {
        if (!pendingLost) {
            return;
        }

        persist(pendingLost.dealId, pendingLost.stageId, lostReason);
        setPendingLost(null);
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map((stage) => (
                        <KanbanColumn key={stage.id} stage={stage} />
                    ))}
                </div>

                <DragOverlay>
                    {activeDeal ? (
                        <DealCard deal={activeDeal} dragging />
                    ) : null}
                </DragOverlay>
            </DndContext>

            <Dialog
                open={pendingLost !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        cancelLost();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alasan deal kalah</DialogTitle>
                        <DialogDescription>
                            Berikan alasan mengapa deal ini ditandai kalah.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="lost_reason">Alasan</Label>
                        <Textarea
                            id="lost_reason"
                            value={lostReason}
                            onChange={(event) =>
                                setLostReason(event.target.value)
                            }
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={cancelLost}>
                            Batal
                        </Button>
                        <Button
                            onClick={confirmLost}
                            disabled={lostReason.trim() === ''}
                        >
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
