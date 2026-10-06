import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import ActivityForm from '@/components/crm/activity-form';
import ActivityTimeline from '@/components/crm/activity-timeline';
import StageBadge from '@/components/crm/stage-badge';
import TaskForm from '@/components/crm/task-form';
import TaskList from '@/components/crm/task-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import { create as dealsCreate, show as dealsShow } from '@/routes/deals';
import {
    destroy as contactsDestroy,
    edit as contactsEdit,
    index as contactsIndex,
} from '@/routes/contacts';
import type {
    ActivityItem,
    ContactDetail,
    Option,
    StageRef,
    TaskItem,
} from '@/types';

type ContactDeal = {
    id: number;
    title: string;
    value: string;
    expected_close_date: string | null;
    stage: StageRef | null;
};

type Props = {
    contact: ContactDetail;
    deals: ContactDeal[];
    activities: ActivityItem[];
    tasks: TaskItem[];
    activityTypes: Option[];
    taskPriorities: Option[];
};

export default function ContactsShow({
    contact,
    deals,
    activities,
    tasks,
    activityTypes,
    taskPriorities,
}: Props) {
    const remove = () => {
        if (!window.confirm(`Hapus kontak "${contact.name}"?`)) {
            return;
        }

        router.delete(contactsDestroy.url(contact.id));
    };

    return (
        <>
            <Head title={contact.name} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold">
                                {contact.name}
                            </h1>
                            <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                {contact.lifecycle_label}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Dibuat {formatDate(contact.created_at)}
                            {contact.assigned_to &&
                                ` • PIC ${contact.assigned_to.name}`}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={contactsIndex()}>Kembali</Link>
                        </Button>
                        <Button asChild>
                            <Link href={contactsEdit(contact.id)}>
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
                                <CardTitle>Deals</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {deals.map((deal) => (
                                    <div
                                        key={deal.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border p-3"
                                    >
                                        <div>
                                            <Link
                                                href={dealsShow(deal.id)}
                                                className="text-sm font-medium hover:underline"
                                            >
                                                {deal.title}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {formatCurrency(deal.value)}
                                                {deal.expected_close_date &&
                                                    ` • ${formatDate(deal.expected_close_date)}`}
                                            </p>
                                        </div>
                                        {deal.stage && (
                                            <StageBadge
                                                name={deal.stage.name}
                                                color={deal.stage.color}
                                                isWon={deal.stage.is_won}
                                                isLost={deal.stage.is_lost}
                                            />
                                        )}
                                    </div>
                                ))}

                                {deals.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada deal.
                                    </p>
                                )}

                                <Button asChild variant="outline" size="sm">
                                    <Link
                                        href={dealsCreate({
                                            query: { contact_id: contact.id },
                                        })}
                                    >
                                        <Plus /> Tambah Deal
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tugas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <TaskForm
                                    taskableId={contact.id}
                                    taskableType="contact"
                                    priorityOptions={taskPriorities}
                                />
                                <TaskList tasks={tasks} />
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
                                    <Info label="Email" value={contact.email} />
                                    <Info
                                        label="Telepon"
                                        value={contact.phone}
                                    />
                                    <Info
                                        label="WhatsApp"
                                        value={contact.whatsapp}
                                    />
                                    <Info label="Kota" value={contact.city} />
                                    <Info
                                        label="Provinsi"
                                        value={contact.province}
                                    />
                                    <Info
                                        label="Sumber"
                                        value={contact.source}
                                    />
                                    <Info
                                        label="Alamat"
                                        value={contact.address}
                                    />
                                    <Info
                                        label="Catatan"
                                        value={contact.notes}
                                    />
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Aktivitas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ActivityForm
                                    activitableId={contact.id}
                                    activitableType="contact"
                                    typeOptions={activityTypes}
                                />
                                <ActivityTimeline activities={activities} />
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

ContactsShow.layout = {
    breadcrumbs: [{ title: 'Kontak', href: contactsIndex() }],
};
