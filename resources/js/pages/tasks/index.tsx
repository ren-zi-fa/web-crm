import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Pagination from '@/components/crm/pagination';
import TaskList from '@/components/crm/task-list';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index as tasksIndex } from '@/routes/tasks';
import type { Option, Paginated, TaskItem } from '@/types';

type Props = {
    tasks: Paginated<TaskItem>;
    filters: { status: string };
    statusOptions: Option[];
    priorityOptions: Option[];
    users: { id: number; name: string }[];
};

export default function TasksIndex({ tasks, filters, statusOptions }: Props) {
    const [status, setStatus] = useState(filters.status || 'all');

    const applyFilter = (value: string) => {
        setStatus(value);
        router.get(
            tasksIndex.url(),
            { status: value === 'all' ? undefined : value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Tugas" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Tugas</h1>
                        <p className="text-sm text-muted-foreground">
                            {tasks.total} tugas ditemukan.
                        </p>
                    </div>

                    <Select value={status} onValueChange={applyFilter}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Semua status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua status</SelectItem>
                            <SelectItem value="overdue">Terlambat</SelectItem>
                            {statusOptions.map((option) => (
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

                <TaskList tasks={tasks.data} showRelated />

                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {tasks.from ?? 0}–{tasks.to ?? 0} dari{' '}
                        {tasks.total}
                    </p>
                    <Pagination meta={tasks} />
                </div>
            </div>
        </>
    );
}

TasksIndex.layout = {
    breadcrumbs: [{ title: 'Tugas', href: tasksIndex() }],
};
