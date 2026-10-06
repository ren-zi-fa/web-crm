import { Head, Link } from '@inertiajs/react';
import ContactForm from '@/components/crm/contact-form';
import { Button } from '@/components/ui/button';
import {
    create as contactsCreate,
    index as contactsIndex,
} from '@/routes/contacts';
import type { Option, UserRef } from '@/types';

type Props = {
    stageOptions: Option[];
    users: UserRef[];
};

export default function ContactsCreate({ stageOptions, users }: Props) {
    return (
        <>
            <Head title="Tambah Kontak" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Tambah Kontak</h1>
                        <p className="text-sm text-muted-foreground">
                            Lengkapi data kontak baru.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={contactsIndex()}>Kembali</Link>
                    </Button>
                </div>

                <div className="max-w-3xl rounded-xl border p-6">
                    <ContactForm stageOptions={stageOptions} users={users} />
                </div>
            </div>
        </>
    );
}

ContactsCreate.layout = {
    breadcrumbs: [
        { title: 'Kontak', href: contactsIndex() },
        { title: 'Tambah', href: contactsCreate() },
    ],
};
