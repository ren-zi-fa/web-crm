import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Trophy, Wallet } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import TaskList from '@/components/crm/task-list';
import StageBadge from '@/components/crm/stage-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import { index as pipelineIndex } from '@/routes/pipeline';
import { index as dealsIndex, show as dealsShow } from '@/routes/deals';
import { index as tasksIndex } from '@/routes/tasks';
import type {
    AttentionDeal,
    DashboardKpi,
    PipelineStagePoint,
    RevenuePoint,
    TaskItem,
} from '@/types';

type Props = {
    kpi: DashboardKpi;
    revenueTrend: RevenuePoint[];
    pipelineByStage: PipelineStagePoint[];
    priorityTasks: TaskItem[];
    attentionDeals: AttentionDeal[];
};

export default function Dashboard({
    kpi,
    revenueTrend,
    pipelineByStage,
    priorityTasks,
    attentionDeals,
}: Props) {
    const { settings } = usePage().props;
    const primaryColor = settings?.theme_primary ?? '#4f46e5';

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Ringkasan penjualan dan aktivitas bisnis Anda.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <KpiCard
                        title="Nilai pipeline terbuka"
                        value={formatCurrency(kpi.openPipelineValue)}
                        hint={`${kpi.openDeals} deal berjalan`}
                        icon={Wallet}
                        href={pipelineIndex()}
                    />
                    <KpiCard
                        title="Menang bulan ini"
                        value={formatCurrency(kpi.wonValueThisMonth)}
                        hint={`${kpi.wonDealsThisMonth} deal won`}
                        icon={Trophy}
                        href={dealsIndex()}
                    />
                    <KpiCard
                        title="Tugas terlambat"
                        value={String(kpi.overdueTasks)}
                        hint="follow-up melewati jatuh tempo"
                        icon={AlertTriangle}
                        href={tasksIndex({ query: { status: 'overdue' } })}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pendapatan 6 bulan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueTrend}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="var(--border)"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={12}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={12}
                                            width={70}
                                            tickFormatter={(value: number) =>
                                                `${Math.round(value / 1_000_000)}jt`
                                            }
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'var(--accent)' }}
                                            formatter={(value) =>
                                                formatCurrency(Number(value))
                                            }
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill={primaryColor}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pipeline per tahap</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={pipelineByStage}
                                        layout="vertical"
                                        margin={{ left: 8 }}
                                    >
                                        <XAxis type="number" hide />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={12}
                                            width={90}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'var(--accent)' }}
                                            formatter={(value) =>
                                                formatCurrency(Number(value))
                                            }
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[0, 4, 4, 0]}
                                        >
                                            {pipelineByStage.map((stage) => (
                                                <Cell
                                                    key={stage.name}
                                                    fill={
                                                        stage.color ??
                                                        primaryColor
                                                    }
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>Tugas prioritas</CardTitle>
                            <Button asChild variant="ghost" size="sm">
                                <Link href={tasksIndex()}>Semua tugas</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <TaskList tasks={priorityTasks} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>Deal butuh perhatian</CardTitle>
                            <Button asChild variant="ghost" size="sm">
                                <Link href={dealsIndex()}>Semua deal</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {attentionDeals.map((deal) => (
                                <div
                                    key={deal.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                                >
                                    <div className="min-w-0">
                                        <Link
                                            href={dealsShow(deal.id)}
                                            className="line-clamp-1 text-sm font-medium hover:underline"
                                        >
                                            {deal.title}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            {deal.contact?.name ??
                                                'Tanpa kontak'}
                                            {deal.expected_close_date &&
                                                ` • ${formatDate(deal.expected_close_date)}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">
                                            {formatCurrency(deal.value)}
                                        </p>
                                        {deal.stage && (
                                            <StageBadge
                                                name={deal.stage.name}
                                                color={deal.stage.color}
                                                isWon={deal.stage.is_won}
                                                isLost={deal.stage.is_lost}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {attentionDeals.length === 0 && (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    Tidak ada deal yang perlu perhatian.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function KpiCard({
    title,
    value,
    hint,
    icon: Icon,
    href,
}: {
    title: string;
    value: string;
    hint: string;
    icon: typeof Wallet;
    href: React.ComponentProps<typeof Link>['href'];
}) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-1 text-2xl font-semibold">{value}</p>
                    <Link
                        href={href}
                        className="mt-1 inline-block text-xs text-muted-foreground hover:text-foreground"
                    >
                        {hint}
                    </Link>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
