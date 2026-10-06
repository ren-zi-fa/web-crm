export type Option = {
    value: string;
    label: string;
};

export type AppSettings = {
    app_name: string;
    logo_url: string | null;
    theme_primary: string | null;
    theme_primary_foreground: string | null;
    theme_intensity: number;
    theme_sidebar_tinted: boolean;
    theme_palette: {
        light: Record<string, string>;
        dark: Record<string, string>;
    };
};

export type UserRef = {
    id: number;
    name: string;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

export type StageRef = {
    id: number;
    name: string;
    color: string | null;
    is_won: boolean;
    is_lost: boolean;
};

export type ContactListItem = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    city: string | null;
    source: string | null;
    lifecycle_stage: string;
    lifecycle_label: string;
    deals_count: number;
    assigned_to: UserRef | null;
};

export type ContactDetail = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    source: string | null;
    notes: string | null;
    lifecycle_stage: string;
    lifecycle_label: string;
    assigned_to: UserRef | null;
    created_at: string | null;
};

export type DealListItem = {
    id: number;
    title: string;
    value: string;
    contact: UserRef | null;
    stage: StageRef | null;
    assigned_to: UserRef | null;
};

export type DealDetail = DealListItem & {
    expected_close_date: string | null;
    source: string | null;
    lost_reason: string | null;
    won_at: string | null;
    created_at: string | null;
};

export type KanbanDeal = {
    id: number;
    title: string;
    value: string;
    contact: UserRef | null;
};

export type KanbanStage = StageRef & {
    slug: string;
    deals: KanbanDeal[];
};

export type ActivityItem = {
    id: number;
    type: string;
    type_label: string;
    subject: string | null;
    body: string | null;
    occurred_at: string;
    user: UserRef | null;
    related: {
        type: string;
        id: number;
        name: string;
    } | null;
};

export type TaskItem = {
    id: number;
    title: string;
    description?: string | null;
    due_at: string | null;
    status: string;
    status_label: string;
    priority: string;
    priority_label: string;
    assigned_to: UserRef | null;
    related?: {
        type: string;
        id: number;
        name: string;
    } | null;
};

export type DashboardKpi = {
    openPipelineValue: number;
    openDeals: number;
    wonValueThisMonth: number;
    wonDealsThisMonth: number;
    overdueTasks: number;
};

export type RevenuePoint = {
    label: string;
    value: number;
};

export type PipelineStagePoint = {
    name: string;
    color: string | null;
    count: number;
    value: number;
};

export type AttentionDeal = {
    id: number;
    title: string;
    value: string;
    expected_close_date: string | null;
    contact: UserRef | null;
    stage: StageRef | null;
};
