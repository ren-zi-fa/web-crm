import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const themeVariables = [
    '--primary',
    '--primary-foreground',
    '--ring',
    '--sidebar-primary',
    '--sidebar-primary-foreground',
    '--sidebar-ring',
] as const;

export default function BrandingTheme() {
    const { settings } = usePage().props;

    useEffect(() => {
        const root = document.documentElement;

        if (!settings?.theme_primary) {
            themeVariables.forEach((variable) =>
                root.style.removeProperty(variable),
            );

            return;
        }

        const foreground =
            settings.theme_primary_foreground ?? 'oklch(0.985 0 0)';

        root.style.setProperty('--primary', settings.theme_primary);
        root.style.setProperty('--primary-foreground', foreground);
        root.style.setProperty('--ring', settings.theme_primary);
        root.style.setProperty('--sidebar-primary', settings.theme_primary);
        root.style.setProperty('--sidebar-primary-foreground', foreground);
        root.style.setProperty('--sidebar-ring', settings.theme_primary);
    }, [settings?.theme_primary, settings?.theme_primary_foreground]);

    return null;
}
