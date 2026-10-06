import { Head, useForm } from '@inertiajs/react';
import { ImageIcon, RotateCcw } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo } from 'react';
import BrandingController from '@/actions/App/Http/Controllers/Settings/BrandingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { derivePalette } from '@/lib/color';
import { cn } from '@/lib/utils';
import { edit as editBranding } from '@/routes/branding';

const presets = [
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Biru', value: '#2563eb' },
    { name: 'Langit', value: '#0284c7' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Hijau', value: '#16a34a' },
    { name: 'Ungu', value: '#9333ea' },
    { name: 'Merah', value: '#dc2626' },
    { name: 'Oranye', value: '#ea580c' },
    { name: 'Merah Muda', value: '#db2777' },
    { name: 'Abu', value: '#334155' },
];

type Props = {
    appName: string;
    logoUrl: string | null;
    themePrimary: string | null;
    themeIntensity: number;
    themeSidebarTinted: boolean;
};

export default function Branding({
    appName,
    logoUrl,
    themePrimary,
    themeIntensity,
    themeSidebarTinted,
}: Props) {
    const { data, setData, post, processing, errors, reset, progress } =
        useForm({
            app_name: appName,
            logo: null as File | null,
            remove_logo: false,
            theme_primary: themePrimary ?? '',
            theme_intensity: themeIntensity,
            theme_sidebar_tinted: themeSidebarTinted,
        });

    const logoPreview = useMemo(() => {
        if (data.logo instanceof File) {
            return URL.createObjectURL(data.logo);
        }

        return data.remove_logo ? null : logoUrl;
    }, [data.logo, data.remove_logo, logoUrl]);

    const preview = useMemo(
        () =>
            derivePalette(
                data.theme_primary || null,
                data.theme_intensity,
                data.theme_sidebar_tinted,
            ).light,
        [data.theme_primary, data.theme_intensity, data.theme_sidebar_tinted],
    );

    const isPreviewActive = Object.keys(preview).length > 0;
    const textColor = 'oklch(0.145 0 0)';

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post(BrandingController.update.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset('logo', 'remove_logo'),
        });
    };

    const primary = data.theme_primary || '#4f46e5';

    return (
        <>
            <Head title="Branding" />

            <h1 className="sr-only">Branding settings</h1>

            <form onSubmit={submit} className="space-y-8">
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Branding"
                        description="Atur nama dan logo aplikasi Anda"
                    />

                    <div className="grid gap-2">
                        <Label htmlFor="app_name">Nama aplikasi</Label>
                        <Input
                            id="app_name"
                            value={data.app_name}
                            onChange={(event) =>
                                setData('app_name', event.target.value)
                            }
                            required
                        />
                        <InputError message={errors.app_name} />
                    </div>

                    <div className="grid gap-3">
                        <Label>Logo</Label>

                        <div className="flex items-center gap-4">
                            <div className="flex size-16 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Logo"
                                        className="size-full object-contain"
                                    />
                                ) : (
                                    <ImageIcon className="size-6 text-muted-foreground" />
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                    onChange={(event) =>
                                        setData(
                                            'logo',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    PNG, JPG, WEBP, atau SVG. Maks 2MB.
                                </p>
                            </div>
                        </div>

                        <InputError message={errors.logo} />

                        {logoUrl && !data.logo && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remove_logo"
                                    checked={data.remove_logo}
                                    onCheckedChange={(checked) =>
                                        setData('remove_logo', checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="remove_logo"
                                    className="font-normal"
                                >
                                    Hapus logo saat ini
                                </Label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Tema warna"
                        description="Warna brand dipakai untuk tombol dan diselaraskan ke latar aplikasi"
                    />

                    <div className="flex flex-wrap gap-2">
                        {presets.map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                title={preset.name}
                                onClick={() =>
                                    setData('theme_primary', preset.value)
                                }
                                className={cn(
                                    'size-9 rounded-full border-2 transition-transform hover:scale-110',
                                    data.theme_primary.toLowerCase() ===
                                        preset.value.toLowerCase()
                                        ? 'border-foreground'
                                        : 'border-transparent',
                                )}
                                style={{ backgroundColor: preset.value }}
                            >
                                <span className="sr-only">{preset.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Input
                            type="color"
                            value={primary}
                            onChange={(event) =>
                                setData('theme_primary', event.target.value)
                            }
                            className="h-9 w-16 cursor-pointer p-1"
                        />
                        <Input
                            value={data.theme_primary}
                            onChange={(event) =>
                                setData('theme_primary', event.target.value)
                            }
                            placeholder="#4f46e5"
                            className="w-32 font-mono"
                            maxLength={7}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setData('theme_primary', '')}
                        >
                            <RotateCcw /> Reset
                        </Button>
                    </div>

                    <InputError message={errors.theme_primary} />

                    <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme_intensity">
                                Intensitas latar
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                {data.theme_intensity}%
                            </span>
                        </div>
                        <input
                            id="theme_intensity"
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={data.theme_intensity}
                            onChange={(event) =>
                                setData(
                                    'theme_intensity',
                                    Number(event.target.value),
                                )
                            }
                            className="w-full accent-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                            Semakin tinggi, semakin kuat warna brand menyerap ke
                            latar dan kartu.
                        </p>
                        <InputError message={errors.theme_intensity} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="theme_sidebar_tinted"
                            checked={data.theme_sidebar_tinted}
                            onCheckedChange={(checked) =>
                                setData(
                                    'theme_sidebar_tinted',
                                    checked === true,
                                )
                            }
                        />
                        <Label
                            htmlFor="theme_sidebar_tinted"
                            className="font-normal"
                        >
                            Warnai sidebar mengikuti brand
                        </Label>
                    </div>

                    <div className="grid gap-2">
                        <span className="text-xs text-muted-foreground">
                            Pratinjau
                        </span>
                        <div
                            className="rounded-xl border p-4"
                            style={{
                                backgroundColor: isPreviewActive
                                    ? preview['--background']
                                    : undefined,
                                color: textColor,
                            }}
                        >
                            <div className="flex gap-3">
                                <div
                                    className="w-24 space-y-2 rounded-lg p-2"
                                    style={{
                                        backgroundColor: isPreviewActive
                                            ? (preview['--sidebar'] ??
                                              preview['--card'])
                                            : undefined,
                                    }}
                                >
                                    <div className="h-2 w-full rounded bg-current opacity-30" />
                                    <div className="h-2 w-3/4 rounded bg-current opacity-20" />
                                    <div className="h-2 w-2/3 rounded bg-current opacity-20" />
                                </div>

                                <div
                                    className="flex-1 space-y-3 rounded-lg border p-3"
                                    style={{
                                        backgroundColor: isPreviewActive
                                            ? preview['--card']
                                            : undefined,
                                    }}
                                >
                                    <div className="h-2 w-1/2 rounded bg-current opacity-30" />
                                    <div
                                        className="h-6 w-1/3 rounded-md"
                                        style={{
                                            backgroundColor: primary,
                                            color: isPreviewActive
                                                ? preview[
                                                      '--primary-foreground'
                                                  ]
                                                : undefined,
                                        }}
                                    />
                                    <div
                                        className="flex h-8 items-center rounded-md px-2"
                                        style={{
                                            backgroundColor: isPreviewActive
                                                ? preview['--muted']
                                                : undefined,
                                        }}
                                    >
                                        <span className="text-xs opacity-60">
                                            Baris tabel (hover)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {progress && (
                    <progress
                        value={progress.percentage}
                        max="100"
                        className="h-1 w-full"
                    >
                        {progress.percentage}%
                    </progress>
                )}

                <Button type="submit" disabled={processing}>
                    Simpan Branding
                </Button>
            </form>
        </>
    );
}

Branding.layout = {
    breadcrumbs: [
        {
            title: 'Branding',
            href: editBranding(),
        },
    ],
};
