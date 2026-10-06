import { Head, Link, router } from '@inertiajs/react';
import { KanbanSquare, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/crm/pagination';
import StageBadge from '@/components/crm/stage-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';
import { index as pipelineIndex } from '@/routes/pipeline';
import {
    create as dealsCreate,
    destroy as dealsDestroy,
    edit as dealsEdit,
    index as dealsIndex,
    show as dealsShow,
} from '@/routes/deals';
import type { DealListItem, Paginated, StageRef } from '@/types';

type Props = {
    deals: Paginated<DealListItem>;
    filters: { search: string; stage: string };
    stages: StageRef[];
};

export default function DealsIndex({ deals, filters, stages }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [stage, setStage] = useState(filters.stage || 'all');

    const applyFilters = (nextSearch: string, nextStage: string) => {
        router.get(
            dealsIndex.url(),
            {
                search: nextSearch || undefined,
                stage: nextStage === 'all' ? undefined : nextStage,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const remove = (deal: DealListItem) => {
        if (!window.confirm(`Hapus deal "${deal.title}"?`)) {
            return;
        }

        router.delete(dealsDestroy.url(deal.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Deals" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Deals</h1>
                        <p className="text-sm text-muted-foreground">
                            Daftar peluang penjualan Anda.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={pipelineIndex()}>
                                <KanbanSquare /> Pipeline
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={dealsCreate()}>
                                <Plus /> Tambah Deal
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <form
                        className="flex flex-1 gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters(search, stage);
                        }}
                    >
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari judul deal..."
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="secondary">
                            Cari
                        </Button>
                    </form>

                    <Select
                        value={stage}
                        onValueChange={(value) => {
                            setStage(value);
                            applyFilters(search, value);
                        }}
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Semua tahap" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua tahap</SelectItem>
                            {stages.map((item) => (
                                <SelectItem
                                    key={item.id}
                                    value={String(item.id)}
                                >
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Judul</TableHead>
                                <TableHead>Kontak</TableHead>
                                <TableHead>Tahap</TableHead>
                                <TableHead>Nilai</TableHead>
                                <TableHead>PIC</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deals.data.map((deal) => (
                                <TableRow key={deal.id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            href={dealsShow(deal.id)}
                                            className="hover:underline"
                                        >
                                            {deal.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {deal.contact?.name ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        {deal.stage ? (
                                            <StageBadge
                                                name={deal.stage.name}
                                                color={deal.stage.color}
                                                isWon={deal.stage.is_won}
                                                isLost={deal.stage.is_lost}
                                            />
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(deal.value)}
                                    </TableCell>
                                    <TableCell>
                                        {deal.assigned_to?.name ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <Link href={dealsEdit(deal.id)}>
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(deal)}
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {deals.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        Belum ada deal.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {deals.from ?? 0}–{deals.to ?? 0} dari{' '}
                        {deals.total}
                    </p>
                    <Pagination meta={deals} />
                </div>
            </div>
        </>
    );
}

DealsIndex.layout = {
    breadcrumbs: [{ title: 'Deals', href: dealsIndex() }],
};
