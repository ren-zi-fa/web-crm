export function formatCurrency(value: string | number): string {
    const amount = typeof value === 'string' ? Number.parseFloat(value) : value;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number.isNaN(amount) ? 0 : amount);
}

export function formatDate(value: string | null, withTime = false): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(new Date(value));
}

export function toDateTimeInput(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Date(value).toISOString().slice(0, 16);
}
