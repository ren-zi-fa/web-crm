import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import TaskController from '@/actions/App/Http/Controllers/TaskController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Option } from '@/types';

type Props = {
    taskableType: 'contact' | 'deal';
    taskableId: number;
    priorityOptions: Option[];
};

export default function TaskForm({
    taskableType,
    taskableId,
    priorityOptions,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        due_at: '',
        priority: 'medium',
        taskable_type: taskableType,
        taskable_id: taskableId,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post(TaskController.store.url(), {
            preserveScroll: true,
            onSuccess: () => reset('title', 'due_at'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3 rounded-lg border p-4">
            <div className="grid gap-2">
                <Label htmlFor="task-title">Judul tugas</Label>
                <Input
                    id="task-title"
                    value={data.title}
                    onChange={(event) => setData('title', event.target.value)}
                    placeholder="Contoh: Follow up penawaran"
                />
                <InputError message={errors.title} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="task-due">Jatuh tempo</Label>
                    <Input
                        id="task-due"
                        type="datetime-local"
                        value={data.due_at}
                        onChange={(event) =>
                            setData('due_at', event.target.value)
                        }
                    />
                    <InputError message={errors.due_at} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="task-priority">Prioritas</Label>
                    <Select
                        value={data.priority}
                        onValueChange={(value) => setData('priority', value)}
                    >
                        <SelectTrigger id="task-priority" className="w-full">
                            <SelectValue placeholder="Pilih prioritas" />
                        </SelectTrigger>
                        <SelectContent>
                            {priorityOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.priority} />
                </div>
            </div>

            <Button type="submit" disabled={processing}>
                Tambah Tugas
            </Button>
        </form>
    );
}
