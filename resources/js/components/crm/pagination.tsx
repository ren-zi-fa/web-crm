import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

export default function Pagination({ meta }: { meta: Paginated<unknown> }) {
    if (meta.last_page <= 1) {
        return null;
    }

    return (
        <nav
            className="flex flex-wrap items-center gap-1"
            aria-label="Navigasi halaman"
        >
            {meta.links.map((link, index) =>
                link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        className={cn(
                            'rounded-md border px-3 py-1 text-sm transition-colors',
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'hover:bg-accent',
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={index}
                        className="rounded-md border px-3 py-1 text-sm text-muted-foreground opacity-60"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </nav>
    );
}
