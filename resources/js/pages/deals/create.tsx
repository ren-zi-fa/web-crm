import { Head, Link } from '@inertiajs/react';
import DealForm from '@/components/crm/deal-form';
import { Button } from '@/components/ui/button';
import { create as dealsCreate, index as dealsIndex } from '@/routes/deals';
import type { StageRef, UserRef } from '@/types';

type Props = {
    contacts: UserRef[];
    stages: StageRef[];
    users: UserRef[];
    selectedContactId: number | null;
};

export default function DealsCreate({
    contacts,
    stages,
    users,
    selectedContactId,
}: Props) {
    return (
        <>
            <Head title="Tambah Deal" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Tambah Deal</h1>
                        <p className="text-sm text-muted-foreground">
                            Buat peluang penjualan baru.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={dealsIndex()}>Kembali</Link>
                    </Button>
                </div>

                <div className="max-w-3xl rounded-xl border p-6">
                    <DealForm
                        contacts={contacts}
                        stages={stages}
                        users={users}
                        selectedContactId={selectedContactId}
                    />
                </div>
            </div>
        </>
    );
}

DealsCreate.layout = {
    breadcrumbs: [
        { title: 'Deals', href: dealsIndex() },
        { title: 'Tambah', href: dealsCreate() },
    ],
};
