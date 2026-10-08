import { Link, usePage } from "@inertiajs/react";
import { CheckSquare, KanbanSquare, Users } from "lucide-react";
import AppLogoIcon from "@/components/app-logo-icon";
import { Card, CardContent } from "@/components/ui/card";
import { home } from "@/routes";
import type { AuthLayoutProps } from "@/types";

const highlights = [
    {
        icon: Users,
        title: "Kontak terpusat",
        description: "Lead dan pelanggan dalam satu basis data.",
    },
    {
        icon: KanbanSquare,
        title: "Pipeline visual",
        description: "Seret deal antar tahap dengan mudah.",
    },
    {
        icon: CheckSquare,
        title: "Tugas terpantau",
        description: "Follow-up tidak ada yang terlewat.",
    },
];

function BrandLogo({ className = "size-6" }: { className?: string }) {
    const { name, settings } = usePage().props;

    if (settings?.logo_url) {
        return (
            <img
                src={settings.logo_url}
                alt={name}
                className="size-full object-contain"
            />
        );
    }

    return <AppLogoIcon className={`fill-current ${className}`} />;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-[1.05fr_1fr]">
            {/* Panel branding — mengikuti warna tema */}
            <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                >
                    <div className="absolute -top-32 -left-32 size-96 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute top-1/3 -right-24 size-80 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-40 left-1/4 size-96 rounded-full bg-black/10 blur-3xl" />
                </div>

                <Link
                    href={home()}
                    className="relative flex items-center gap-3"
                >
                    <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white/15 p-1.5 backdrop-blur">
                        <BrandLogo />
                    </span>
                    <span className="text-lg font-semibold tracking-tight">
                        {name}
                    </span>
                </Link>

                <div className="relative space-y-8">
                    <div className="space-y-3">
                        <h2 className="max-w-md text-3xl leading-tight font-semibold tracking-tight text-balance">
                            Kelola penjualan dalam satu tempat.
                        </h2>
                        <p className="max-w-md text-sm leading-relaxed opacity-80">
                            Pantau kontak, pipeline deal, dan tugas tim Anda
                            dengan tampilan yang bersih dan cepat.
                        </p>
                    </div>

                    <ul className="space-y-3">
                        {highlights.map((item) => (
                            <li
                                key={item.title}
                                className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur"
                            >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                                    <item.icon className="size-4" />
                                </span>
                                <span>
                                    <span className="block text-sm font-medium">
                                        {item.title}
                                    </span>
                                    <span className="block text-xs opacity-75">
                                        {item.description}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-xs opacity-70">
                    © {new Date().getFullYear()} {name}
                </p>
            </div>

            {/* Panel formulir */}
            <div className="relative flex items-center justify-center overflow-hidden p-6 md:p-10">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                >
                    <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
                </div>

                <div className="relative w-full max-w-sm">
                    <Link
                        href={home()}
                        className="mb-6 flex items-center justify-center gap-2 lg:hidden"
                    >
                        <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-primary p-1.5 text-primary-foreground">
                            <BrandLogo />
                        </span>
                        <span className="text-lg font-semibold tracking-tight">
                            {name}
                        </span>
                    </Link>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="space-y-6 px-6 py-8 sm:px-8">
                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                )}
                            </div>
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
