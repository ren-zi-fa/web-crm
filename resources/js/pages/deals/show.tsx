import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import ActivityForm from '@/components/crm/activity-form';
import ActivityTimeline from '@/components/crm/activity-timeline';
import StageBadge from '@/components/crm/stage-badge';
import TaskForm from '@/components/crm/task-form';
import TaskList from '@/components/crm/task-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import { show as contactsShow } from '@/routes/contacts';
import {
    destroy as dealsDestroy,
    edit as dealsEdit,
    index as dealsIndex,
} from '@/routes/deals';
import type { ActivityItem, DealDetail, Option, TaskItem } from '@/types';

type Props = {
    deal: DealDetail;
    activities: ActivityItem[];
    tasks: TaskItem[];
    activityTypes: Option[];
    taskPriorities: Option[];
};

export default function DealsShow({
    deal,
    activities,
    tasks,
    activityTypes,
    taskPriorities,
}: Props) {
    const remove = () => {
        if (!window.confirm(`Hapus deal "${deal.title}"?`)) {
            return;
        }

        router.delete(dealsDestroy.url(deal.id));
    };

    return (
        <>
            <Head title={deal.title} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl font-semibold">
                                {deal.title}
                            </h1>
                            {deal.stage && (
                                <StageBadge
                                    name={deal.stage.name}
                                    color={deal.stage.color}
                                    isWon={deal.stage.is_won}
                                    isLost={deal.stage.is_lost}
                                />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {formatCurrency(deal.value)} • Dibuat{' '}
                            {formatDate(deal.created_at)}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={dealsIndex()}>Kembali</Link>
                        </Button>
                        <Button asChild>
                            <Link href={dealsEdit(deal.id)}>
                                <Pencil /> Ubah
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={remove}>
                            <Trash2 /> Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tugas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <TaskForm
                                    taskableId={deal.id}
                                    taskableType="deal"
                                    priorityOptions={taskPriorities}
                                />
                                <TaskList tasks={tasks} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Aktivitas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ActivityForm
                                    activitableId={deal.id}
                                    activitableType="deal"
                                    typeOptions={activityTypes}
                                />
                                <ActivityTimeline activities={activities} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <dl className="space-y-2">
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-muted-foreground">
                                            Kontak
                                        </dt>
                                        <dd className="text-right">
                                            {deal.contact ? (
                                                <Link
                                                    href={contactsShow(
                                                        deal.contact.id,
                                                    )}
                                                    className="hover:underline"
                                                >
                                                    {deal.contact.name}
                                                </Link>
                                            ) : (
                                                '-'
                                            )}
                                        </dd>
                                    </div>
                                    <Info
                                        label="Nilai"
                                        value={formatCurrency(deal.value)}
                                    />
                                    <Info
                                        label="Perkiraan closing"
                                        value={deal.expected_close_date}
                                    />
                                    <Info
                                        label="PIC"
                                        value={deal.assigned_to?.name ?? null}
                                    />
                                    <Info label="Sumber" value={deal.source} />
                                    {deal.won_at && (
                                        <Info
                                            label="Menang pada"
                                            value={formatDate(deal.won_at)}
                                        />
                                    )}
                                    {deal.lost_reason && (
                                        <Info
                                            label="Alasan kalah"
                                            value={deal.lost_reason}
                                        />
                                    )}
                                </dl>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

function Info({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right">{value || '-'}</dd>
        </div>
    );
}

DealsShow.layout = {
    breadcrumbs: [{ title: 'Deals', href: dealsIndex() }],
};
