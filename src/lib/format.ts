import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';

const AUD = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

/** Full currency, e.g. $4,250,000 */
export function currency(value: number): string {
  return AUD.format(value);
}

/** Compact currency for tiles and axes, e.g. $4.25M */
export function currencyCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  if (abs >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${value}`;
}

export function number(value: number): string {
  return new Intl.NumberFormat('en-AU').format(value);
}

export function percent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/** e.g. 12 Mar 2026 */
export function date(iso: string | null | undefined): string {
  if (!iso) return '—';
  return format(parseISO(iso), 'd MMM yyyy');
}

/** e.g. Mar 2026 */
export function monthYear(iso: string | null | undefined): string {
  if (!iso) return '—';
  return format(parseISO(iso), 'MMM yyyy');
}

export function relative(iso: string): string {
  return `${formatDistanceToNowStrict(parseISO(iso))} ago`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
