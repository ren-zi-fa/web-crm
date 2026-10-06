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
import { contrastForeground } from '@/lib/color';
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
};

export default function Branding({ appName, logoUrl, themePrimary }: Props) {
    const { data, setData, post, processing, errors, reset, progress } =
        useForm({
            app_name: appName,
            logo: null as File | null,
            remove_logo: false,
            theme_primary: themePrimary ?? '',
        });

    const logoPreview = useMemo(() => {
        if (data.logo instanceof File) {
            return URL.createObjectURL(data.logo);
        }

        return data.remove_logo ? null : logoUrl;
    }, [data.logo, data.remove_logo, logoUrl]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post(BrandingController.update.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset('logo', 'remove_logo'),
        });
    };

    const primary = data.theme_primary || '#4f46e5';
    const foreground = contrastForeground(primary);

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
                        description="Pilih warna utama yang digunakan di seluruh aplikasi"
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

                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-muted-foreground">
                            Pratinjau
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <span
                                className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium"
                                style={{
                                    backgroundColor: primary,
                                    color: foreground,
                                }}
                            >
                                Tombol Utama
                            </span>
                            <span className="inline-flex h-9 items-center rounded-md border border-input px-4 text-sm">
                                Tombol Sekunder
                            </span>
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
