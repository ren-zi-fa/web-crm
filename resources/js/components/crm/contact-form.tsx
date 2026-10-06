import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ContactController from '@/actions/App/Http/Controllers/ContactController';
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
import type { Option, UserRef } from '@/types';

export type EditableContact = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    source: string | null;
    lifecycle_stage: string;
    assigned_to: number | null;
    notes: string | null;
};

type Props = {
    contact?: EditableContact | null;
    stageOptions: Option[];
    users: UserRef[];
};

export default function ContactForm({ contact, stageOptions, users }: Props) {
    const { data, setData, post, put, processing, errors, transform } = useForm(
        {
            name: contact?.name ?? '',
            email: contact?.email ?? '',
            phone: contact?.phone ?? '',
            whatsapp: contact?.whatsapp ?? '',
            address: contact?.address ?? '',
            city: contact?.city ?? '',
            province: contact?.province ?? '',
            source: contact?.source ?? '',
            lifecycle_stage: contact?.lifecycle_stage ?? 'lead',
            assigned_to: contact?.assigned_to
                ? String(contact.assigned_to)
                : 'none',
            notes: contact?.notes ?? '',
        },
    );

    transform((form) => ({
        ...form,
        assigned_to:
            form.assigned_to === 'none' ? null : Number(form.assigned_to),
    }));

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (contact?.id) {
            put(ContactController.update.url(contact.id), {
                preserveScroll: true,
            });

            return;
        }

        post(ContactController.store.url());
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="name">Nama</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(event) =>
                            setData('email', event.target.value)
                        }
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone">Telepon</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(event) =>
                            setData('phone', event.target.value)
                        }
                    />
                    <InputError message={errors.phone} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                        id="whatsapp"
                        value={data.whatsapp}
                        onChange={(event) =>
                            setData('whatsapp', event.target.value)
                        }
                    />
                    <InputError message={errors.whatsapp} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="city">Kota</Label>
                    <Input
                        id="city"
                        value={data.city}
                        onChange={(event) =>
                            setData('city', event.target.value)
                        }
                    />
                    <InputError message={errors.city} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="province">Provinsi</Label>
                    <Input
                        id="province"
                        value={data.province}
                        onChange={(event) =>
                            setData('province', event.target.value)
                        }
                    />
                    <InputError message={errors.province} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="source">Sumber</Label>
                    <Input
                        id="source"
                        value={data.source}
                        onChange={(event) =>
                            setData('source', event.target.value)
                        }
                        placeholder="Website, Instagram, Referral..."
                    />
                    <InputError message={errors.source} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="lifecycle_stage">Tahap</Label>
                    <Select
                        value={data.lifecycle_stage}
                        onValueChange={(value) =>
                            setData('lifecycle_stage', value)
                        }
                    >
                        <SelectTrigger id="lifecycle_stage" className="w-full">
                            <SelectValue placeholder="Pilih tahap" />
                        </SelectTrigger>
                        <SelectContent>
                            {stageOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.lifecycle_stage} />
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

            <div className="grid gap-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                    id="address"
                    value={data.address}
                    onChange={(event) => setData('address', event.target.value)}
                    rows={2}
                />
                <InputError message={errors.address} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(event) => setData('notes', event.target.value)}
                    rows={3}
                />
                <InputError message={errors.notes} />
            </div>

            <Button type="submit" disabled={processing}>
                {contact?.id ? 'Simpan Perubahan' : 'Simpan Kontak'}
            </Button>
        </form>
    );
}
