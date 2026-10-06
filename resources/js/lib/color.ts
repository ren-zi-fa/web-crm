export function contrastForeground(hex: string): string {
    const value = hex.replace('#', '');

    if (!/^[0-9a-fA-F]{6}$/.test(value)) {
        return '#ffffff';
    }

    const red = Number.parseInt(value.slice(0, 2), 16) / 255;
    const green = Number.parseInt(value.slice(2, 4), 16) / 255;
    const blue = Number.parseInt(value.slice(4, 6), 16) / 255;

    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

    return luminance > 0.6 ? '#0b0b0b' : '#ffffff';
}
