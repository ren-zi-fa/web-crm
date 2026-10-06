import { Head, Link } from '@inertiajs/react';
import ContactForm, {
    type EditableContact,
} from '@/components/crm/contact-form';
import { Button } from '@/components/ui/button';
import { index as contactsIndex } from '@/routes/contacts';
import type { Option, UserRef } from '@/types';

type Props = {
    contact: EditableContact;
    stageOptions: Option[];
    users: UserRef[];
};

export default function ContactsEdit({ contact, stageOptions, users }: Props) {
    return (
        <>
            <Head title={`Ubah ${contact.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Ubah Kontak</h1>
                        <p className="text-sm text-muted-foreground">
                            Perbarui data {contact.name}.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={contactsIndex()}>Kembali</Link>
                    </Button>
                </div>

                <div className="max-w-3xl rounded-xl border p-6">
                    <ContactForm
                        contact={contact}
                        stageOptions={stageOptions}
                        users={users}
                    />
                </div>
            </div>
        </>
    );
}

ContactsEdit.layout = {
    breadcrumbs: [{ title: 'Kontak', href: contactsIndex() }],
};
