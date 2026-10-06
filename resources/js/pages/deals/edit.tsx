import { Head, Link } from '@inertiajs/react';
import DealForm, { type EditableDeal } from '@/components/crm/deal-form';
import { Button } from '@/components/ui/button';
import { index as dealsIndex } from '@/routes/deals';
import type { StageRef, UserRef } from '@/types';

type Props = {
    deal: EditableDeal;
    contacts: UserRef[];
    stages: StageRef[];
    users: UserRef[];
};

export default function DealsEdit({ deal, contacts, stages, users }: Props) {
    return (
        <>
            <Head title={`Ubah ${deal.title}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Ubah Deal</h1>
                        <p className="text-sm text-muted-foreground">
                            Perbarui data deal.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={dealsIndex()}>Kembali</Link>
                    </Button>
                </div>

                <div className="max-w-3xl rounded-xl border p-6">
                    <DealForm
                        deal={deal}
                        contacts={contacts}
                        stages={stages}
                        users={users}
                    />
                </div>
            </div>
        </>
    );
}

DealsEdit.layout = {
    breadcrumbs: [{ title: 'Deals', href: dealsIndex() }],
};
