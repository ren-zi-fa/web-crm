import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import KanbanBoard from '@/components/crm/kanban-board';
import { Button } from '@/components/ui/button';
import { index as pipelineIndex } from '@/routes/pipeline';
import { create as dealsCreate, index as dealsIndex } from '@/routes/deals';
import type { KanbanStage } from '@/types';

type Props = {
    stages: KanbanStage[];
};

export default function DealsKanban({ stages }: Props) {
    const totalDeals = stages.reduce(
        (sum, stage) => sum + stage.deals.length,
        0,
    );

    return (
        <>
            <Head title="Pipeline" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Pipeline</h1>
                        <p className="text-sm text-muted-foreground">
                            {totalDeals} deal dalam pipeline penjualan.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={dealsIndex()}>Daftar Deal</Link>
                        </Button>
                        <Button asChild>
                            <Link href={dealsCreate()}>
                                <Plus /> Tambah Deal
                            </Link>
                        </Button>
                    </div>
                </div>

                <KanbanBoard stages={stages} />
            </div>
        </>
    );
}

DealsKanban.layout = {
    breadcrumbs: [{ title: 'Pipeline', href: pipelineIndex() }],
};
