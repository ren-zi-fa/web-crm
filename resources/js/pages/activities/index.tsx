import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ActivityTimeline from '@/components/crm/activity-timeline';
import Pagination from '@/components/crm/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as activitiesIndex } from '@/routes/activities';
import type { ActivityItem, Option, Paginated } from '@/types';

type Props = {
    activities: Paginated<ActivityItem>;
    filters: { type: string };
    typeOptions: Option[];
};

export default function ActivitiesIndex({
    activities,
    filters,
    typeOptions,
}: Props) {
    const [type, setType] = useState(filters.type || 'all');

    const applyFilter = (value: string) => {
        setType(value);
        router.get(
            activitiesIndex.url(),
            { type: value === 'all' ? undefined : value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Aktivitas" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Aktivitas</h1>
                        <p className="text-sm text-muted-foreground">
                            {activities.total} aktivitas tercatat.
                        </p>
                    </div>

                    <Select value={type} onValueChange={applyFilter}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Semua jenis" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua jenis</SelectItem>
                            {typeOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border p-4">
                    <ActivityTimeline activities={activities.data} />
                </div>

                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {activities.from ?? 0}–{activities.to ?? 0}{' '}
                        dari {activities.total}
                    </p>
                    <Pagination meta={activities} />
                </div>
            </div>
        </>
    );
}

ActivitiesIndex.layout = {
    breadcrumbs: [{ title: 'Aktivitas', href: activitiesIndex() }],
};
