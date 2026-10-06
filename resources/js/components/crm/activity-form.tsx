import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActivityController from '@/actions/App/Http/Controllers/ActivityController';
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
import { Textarea } from '@/components/ui/textarea';
import type { Option } from '@/types';

type Props = {
    activitableType: 'contact' | 'deal';
    activitableId: number;
    typeOptions: Option[];
};

export default function ActivityForm({
    activitableType,
    activitableId,
    typeOptions,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'note',
        subject: '',
        body: '',
        occurred_at: new Date().toISOString().slice(0, 16),
        activitable_type: activitableType,
        activitable_id: activitableId,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post(ActivityController.store.url(), {
            preserveScroll: true,
            onSuccess: () => reset('subject', 'body'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3 rounded-lg border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="activity-type">Jenis</Label>
                    <Select
                        value={data.type}
                        onValueChange={(value) => setData('type', value)}
                    >
                        <SelectTrigger id="activity-type" className="w-full">
                            <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <InputError message={errors.type} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="activity-occurred">Waktu</Label>
                    <Input
                        id="activity-occurred"
                        type="datetime-local"
                        value={data.occurred_at}
                        onChange={(event) =>
                            setData('occurred_at', event.target.value)
                        }
                    />
                    <InputError message={errors.occurred_at} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="activity-subject">Subjek</Label>
                <Input
                    id="activity-subject"
                    value={data.subject}
                    onChange={(event) => setData('subject', event.target.value)}
                    placeholder="Contoh: Telepon penawaran harga"
                />
                <InputError message={errors.subject} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="activity-body">Catatan</Label>
                <Textarea
                    id="activity-body"
                    value={data.body}
                    onChange={(event) => setData('body', event.target.value)}
                    placeholder="Detail aktivitas"
                    rows={3}
                />
                <InputError message={errors.body} />
            </div>

            <Button type="submit" disabled={processing}>
                Simpan Aktivitas
            </Button>
        </form>
    );
}
