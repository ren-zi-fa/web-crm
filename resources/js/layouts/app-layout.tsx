import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import BrandingTheme from '@/components/branding-theme';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <BrandingTheme />
            {children}
        </AppLayoutTemplate>
    );
}
