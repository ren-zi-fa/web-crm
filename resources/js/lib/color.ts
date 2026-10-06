export type ThemePalette = {
    light: Record<string, string>;
    dark: Record<string, string>;
};

const DARK_BASE = '#0b0b0f';
const MAX_TINT = 8;

function normalizeHex(hex: string): string {
    const value = hex.replace('#', '').trim();

    if (value.length === 3) {
        return `#${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`.toLowerCase();
    }

    if (!/^[0-9a-fA-F]{6}$/.test(value)) {
        return '#000000';
    }

    return `#${value.toLowerCase()}`;
}

function rgb(hex: string): [number, number, number] {
    const value = normalizeHex(hex).replace('#', '');

    return [
        Number.parseInt(value.slice(0, 2), 16),
        Number.parseInt(value.slice(2, 4), 16),
        Number.parseInt(value.slice(4, 6), 16),
    ];
}

export function luminance(hex: string): number {
    const [red, green, blue] = rgb(hex);

    return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
}

export function contrastForeground(hex: string): string {
    return luminance(hex) > 0.6 ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)';
}

export function mixColor(color: string, base: string, percent: number): string {
    const ratio = Math.max(0, Math.min(100, percent)) / 100;

    const [redA, greenA, blueA] = rgb(color);
    const [redB, greenB, blueB] = rgb(base);

    const toHex = (value: number) =>
        Math.round(value).toString(16).padStart(2, '0');

    const red = Math.round(redA * ratio + redB * (1 - ratio));
    const green = Math.round(greenA * ratio + greenB * (1 - ratio));
    const blue = Math.round(blueA * ratio + blueB * (1 - ratio));

    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

export function derivePalette(
    primary: string | null,
    intensity: number,
    sidebarTinted: boolean,
): ThemePalette {
    if (!primary || intensity <= 0) {
        return { light: {}, dark: {} };
    }

    primary = normalizeHex(primary);
    const tint = (intensity / 100) * MAX_TINT;

    const darkPrimary =
        luminance(primary) < 0.45 ? mixColor(primary, '#ffffff', 20) : primary;

    const light: Record<string, string> = {
        '--primary': primary,
        '--primary-foreground': contrastForeground(primary),
        '--ring': primary,
        '--background': mixColor(primary, '#ffffff', tint),
        '--card': mixColor(primary, '#ffffff', tint * 0.5),
        '--popover': mixColor(primary, '#ffffff', tint * 0.5),
        '--accent': mixColor(primary, '#ffffff', tint * 1.2),
        '--secondary': mixColor(primary, '#ffffff', tint * 1.2),
        '--muted': mixColor(primary, '#ffffff', tint),
        '--sidebar-primary': primary,
        '--sidebar-primary-foreground': contrastForeground(primary),
        '--sidebar-ring': primary,
    };

    const dark: Record<string, string> = {
        '--primary': darkPrimary,
        '--primary-foreground': contrastForeground(darkPrimary),
        '--ring': darkPrimary,
        '--background': mixColor(primary, DARK_BASE, tint),
        '--card': mixColor(primary, DARK_BASE, tint * 0.7),
        '--popover': mixColor(primary, DARK_BASE, tint * 0.7),
        '--accent': mixColor(primary, DARK_BASE, tint * 1.2),
        '--secondary': mixColor(primary, DARK_BASE, tint * 1.2),
        '--muted': mixColor(primary, DARK_BASE, tint),
        '--sidebar-primary': darkPrimary,
        '--sidebar-primary-foreground': contrastForeground(darkPrimary),
        '--sidebar-ring': darkPrimary,
    };

    if (sidebarTinted) {
        light['--sidebar'] = mixColor(primary, '#ffffff', tint * 0.8);
        light['--sidebar-accent'] = mixColor(primary, '#ffffff', tint * 1.2);
        dark['--sidebar'] = mixColor(primary, DARK_BASE, tint * 0.8);
        dark['--sidebar-accent'] = mixColor(primary, DARK_BASE, tint * 1.2);
    }

    return { light, dark };
}

export function paletteToCss(variables: Record<string, string>): string {
    const entries = Object.entries(variables);

    if (entries.length === 0) {
        return '';
    }

    const body = entries
        .map(([token, value]) => `${token}: ${value};`)
        .join('\n');

    return `:root {\n${body}\n}\n`;
}
