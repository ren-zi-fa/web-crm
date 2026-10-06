import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/crm/pagination';
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
import {
    create as contactsCreate,
    destroy as contactsDestroy,
    edit as contactsEdit,
    index as contactsIndex,
    show as contactsShow,
} from '@/routes/contacts';
import type { ContactListItem, Option, Paginated } from '@/types';

type Props = {
    contacts: Paginated<ContactListItem>;
    filters: { search: string; stage: string };
    stageOptions: Option[];
};

const lifecycleVariant: Record<string, string> = {
    lead: 'bg-slate-100 text-slate-700',
    prospect: 'bg-amber-100 text-amber-700',
    customer: 'bg-green-100 text-green-700',
};

export default function ContactsIndex({
    contacts,
    filters,
    stageOptions,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [stage, setStage] = useState(filters.stage || 'all');

    const applyFilters = (nextSearch: string, nextStage: string) => {
        router.get(
            contactsIndex.url(),
            {
                search: nextSearch || undefined,
                stage: nextStage === 'all' ? undefined : nextStage,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const remove = (contact: ContactListItem) => {
        if (!window.confirm(`Hapus kontak "${contact.name}"?`)) {
            return;
        }

        router.delete(contactsDestroy.url(contact.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Kontak" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Kontak</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola data lead dan pelanggan Anda.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={contactsCreate()}>
                            <Plus /> Tambah Kontak
                        </Link>
                    </Button>
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
                            placeholder="Cari nama, email, telepon..."
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
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Kontak</TableHead>
                                <TableHead>Kota</TableHead>
                                <TableHead>Sumber</TableHead>
                                <TableHead>Tahap</TableHead>
                                <TableHead className="text-center">
                                    Deal
                                </TableHead>
                                <TableHead>PIC</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contacts.data.map((contact) => (
                                <TableRow key={contact.id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            href={contactsShow(contact.id)}
                                            className="hover:underline"
                                        >
                                            {contact.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {contact.email ?? contact.phone ?? '-'}
                                    </TableCell>
                                    <TableCell>{contact.city ?? '-'}</TableCell>
                                    <TableCell>
                                        {contact.source ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                                                lifecycleVariant[
                                                    contact.lifecycle_stage
                                                ] ??
                                                'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {contact.lifecycle_label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {contact.deals_count}
                                    </TableCell>
                                    <TableCell>
                                        {contact.assigned_to?.name ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <Link
                                                    href={contactsEdit(
                                                        contact.id,
                                                    )}
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(contact)}
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {contacts.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        Belum ada kontak.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {contacts.from ?? 0}–{contacts.to ?? 0} dari{' '}
                        {contacts.total}
                    </p>
                    <Pagination meta={contacts} />
                </div>
            </div>
        </>
    );
}

ContactsIndex.layout = {
    breadcrumbs: [{ title: 'Kontak', href: contactsIndex() }],
};
