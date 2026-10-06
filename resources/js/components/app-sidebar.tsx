import { Link } from '@inertiajs/react';
import {
    Activity,
    Briefcase,
    CheckSquare,
    KanbanSquare,
    LayoutGrid,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as activitiesIndex } from '@/routes/activities';
import { index as contactsIndex } from '@/routes/contacts';
import { index as dealsIndex } from '@/routes/deals';
import { index as pipelineIndex } from '@/routes/pipeline';
import { index as tasksIndex } from '@/routes/tasks';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Kontak',
        href: contactsIndex(),
        icon: Users,
    },
    {
        title: 'Pipeline',
        href: pipelineIndex(),
        icon: KanbanSquare,
    },
    {
        title: 'Deals',
        href: dealsIndex(),
        icon: Briefcase,
    },
    {
        title: 'Tugas',
        href: tasksIndex(),
        icon: CheckSquare,
    },
    {
        title: 'Aktivitas',
        href: activitiesIndex(),
        icon: Activity,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
