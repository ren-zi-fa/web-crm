import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import DealController from '@/actions/App/Http/Controllers/DealController';
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
import type { StageRef, UserRef } from '@/types';

export type EditableDeal = {
    id: number;
    contact_id: number;
    deal_stage_id: number;
    title: string;
    value: string;
    expected_close_date: string | null;
    assigned_to: number | null;
    source: string | null;
    lost_reason: string | null;
};

type Props = {
    deal?: EditableDeal | null;
    contacts: UserRef[];
    stages: StageRef[];
    users: UserRef[];
    selectedContactId?: number | null;
};

export default function DealForm({
    deal,
    contacts,
    stages,
    users,
    selectedContactId,
}: Props) {
    const { data, setData, post, put, processing, errors, transform } = useForm(
        {
            contact_id: String(deal?.contact_id ?? selectedContactId ?? ''),
            deal_stage_id: String(deal?.deal_stage_id ?? stages[0]?.id ?? ''),
            title: deal?.title ?? '',
            value: deal?.value ?? '0',
            expected_close_date: deal?.expected_close_date ?? '',
            assigned_to: deal?.assigned_to ? String(deal.assigned_to) : 'none',
            source: deal?.source ?? '',
            lost_reason: deal?.lost_reason ?? '',
        },
    );

    transform((form) => ({
        ...form,
        contact_id: Number(form.contact_id),
        deal_stage_id: Number(form.deal_stage_id),
        value: Number(form.value),
        assigned_to:
            form.assigned_to === 'none' ? null : Number(form.assigned_to),
    }));

    const selectedStage = stages.find(
        (stage) => String(stage.id) === String(data.deal_stage_id),
    );
    const isLost = selectedStage?.is_lost ?? false;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (deal?.id) {
            put(DealController.update.url(deal.id), { preserveScroll: true });

            return;
        }

        post(DealController.store.url());
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="contact_id">Kontak</Label>
                    <Select
                        value={data.contact_id}
                        onValueChange={(value) => setData('contact_id', value)}
                    >
                        <SelectTrigger id="contact_id" className="w-full">
                            <SelectValue placeholder="Pilih kontak" />
                        </SelectTrigger>
                        <SelectContent>
                            {contacts.map((contact) => (
                                <SelectItem
                                    key={contact.id}
                                    value={String(contact.id)}
                                >
                                    {contact.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.contact_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="deal_stage_id">Tahap</Label>
                    <Select
                        value={data.deal_stage_id}
                        onValueChange={(value) =>
                            setData('deal_stage_id', value)
                        }
                    >
                        <SelectTrigger id="deal_stage_id" className="w-full">
                            <SelectValue placeholder="Pilih tahap" />
                        </SelectTrigger>
                        <SelectContent>
                            {stages.map((stage) => (
                                <SelectItem
                                    key={stage.id}
                                    value={String(stage.id)}
                                >
                                    {stage.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.deal_stage_id} />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="title">Judul deal</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(event) =>
                            setData('title', event.target.value)
                        }
                        placeholder="Contoh: Pembuatan Website Company Profile"
                        required
                    />
                    <InputError message={errors.title} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="value">Nilai (Rp)</Label>
                    <Input
                        id="value"
                        type="number"
                        min={0}
                        step={100000}
                        value={data.value}
                        onChange={(event) =>
                            setData('value', event.target.value)
                        }
                    />
                    <InputError message={errors.value} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="expected_close_date">
                        Perkiraan closing
                    </Label>
                    <Input
                        id="expected_close_date"
                        type="date"
                        value={data.expected_close_date}
                        onChange={(event) =>
                            setData('expected_close_date', event.target.value)
                        }
                    />
                    <InputError message={errors.expected_close_date} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="source">Sumber</Label>
                    <Input
                        id="source"
                        value={data.source}
                        onChange={(event) =>
                            setData('source', event.target.value)
                        }
                    />
                    <InputError message={errors.source} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="assigned_to">Penanggung jawab</Label>
                    <Select
                        value={data.assigned_to}
                        onValueChange={(value) => setData('assigned_to', value)}
                    >
                        <SelectTrigger id="assigned_to" className="w-full">
                            <SelectValue placeholder="Pilih pengguna" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">
                                Belum ditugaskan
                            </SelectItem>
                            {users.map((user) => (
                                <SelectItem
                                    key={user.id}
                                    value={String(user.id)}
                                >
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.assigned_to} />
                </div>
            </div>

            {isLost && (
                <div className="grid gap-2">
                    <Label htmlFor="lost_reason">Alasan kalah</Label>
                    <Textarea
                        id="lost_reason"
                        value={data.lost_reason}
                        onChange={(event) =>
                            setData('lost_reason', event.target.value)
                        }
                        rows={2}
                    />
                    <InputError message={errors.lost_reason} />
                </div>
            )}

            <Button type="submit" disabled={processing}>
                {deal?.id ? 'Simpan Perubahan' : 'Simpan Deal'}
            </Button>
        </form>
    );
}
