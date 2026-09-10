import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/* ---------- Page header ---------- */

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
        <h1 className="text-2xl md:text-[28px]">{title}</h1>
        {description ? (
          <div className="mt-1.5 max-w-2xl text-sm text-slate">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ---------- Stat tile ---------- */

interface StatTileProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: 'default' | 'gold' | 'ok' | 'alert';
}

export function StatTile({ label, value, sub, icon, tone = 'default' }: StatTileProps) {
  const accent = {
    default: 'text-navy',
    gold: 'text-gold-deep',
    ok: 'text-ok',
    alert: 'text-alert',
  }[tone];

  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium uppercase tracking-wide text-slate">{label}</p>
        {icon ? <span className="text-slate-light">{icon}</span> : null}
      </div>
      <p className={cn('mt-2 font-display text-[26px] leading-none font-semibold', accent)}>{value}</p>
      {sub ? <p className="mt-2 text-[12.5px] text-slate">{sub}</p> : null}
    </div>
  );
}

/* ---------- Progress bar ---------- */

interface ProgressBarProps {
  value: number;
  tone?: 'navy' | 'gold' | 'ok' | 'warn' | 'alert';
  className?: string;
  label?: string;
}

export function ProgressBar({ value, tone = 'navy', className, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const fill = {
    navy: 'bg-navy',
    gold: 'bg-gold',
    ok: 'bg-ok',
    warn: 'bg-warn',
    alert: 'bg-alert',
  }[tone];

  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-line-soft', className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500', fill)} style={{ width: `${clamped}%` }} />
    </div>
  );
}

/* ---------- Empty state ---------- */

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon ? (
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-line-soft text-slate-light">
          {icon}
        </div>
      ) : null}
      <p className="font-medium text-navy">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-[13px] text-slate">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ---------- Avatar ---------- */

export function Avatar({
  initials,
  size = 'md',
  tone = 'navy',
}: {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'navy' | 'gold';
}) {
  const sizes = { sm: 'size-7 text-[11px]', md: 'size-9 text-[13px]', lg: 'size-12 text-base' };
  const tones = { navy: 'bg-navy/8 text-navy', gold: 'bg-gold-wash text-gold-deep' };
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizes[size],
        tones[tone],
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* ---------- Section heading ---------- */

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={cn(align === 'center' && 'mx-auto max-w-2xl text-center', className)}>
      {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
      <h2 className="text-balance text-[26px] md:text-[32px]">{title}</h2>
      {description ? <p className="mt-3 text-[15px] leading-relaxed text-slate">{description}</p> : null}
    </div>
  );
}

/* ---------- Definition list row ---------- */

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line-soft py-2.5 last:border-0">
      <dt className="text-[13px] text-slate">{label}</dt>
      <dd className="text-right text-[13.5px] font-medium text-navy">{value}</dd>
    </div>
  );
}
