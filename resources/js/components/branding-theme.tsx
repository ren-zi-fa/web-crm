import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { paletteToCss } from '@/lib/color';

const STYLE_ID = 'branding-theme';
const EMPTY: Record<string, string> = {};

export default function BrandingTheme() {
    const { settings } = usePage().props;
    const palette = settings?.theme_palette?.light ?? EMPTY;

    useEffect(() => {
        let element = document.getElementById(
            STYLE_ID,
        ) as HTMLStyleElement | null;

        if (!element) {
            element = document.createElement('style');
            element.id = STYLE_ID;
        }

        element.textContent = paletteToCss(palette);

        // Keep the override last in the head so it wins over the bundled CSS,
        // including styles injected by Vite during development.
        document.head.appendChild(element);
    }, [palette]);

    return null;
}
