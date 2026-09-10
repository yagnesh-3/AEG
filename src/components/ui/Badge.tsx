import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'navy' | 'gold' | 'ok' | 'warn' | 'alert' | 'idle';

const TONES: Record<Tone, string> = {
  neutral: 'bg-line-soft text-slate border-line',
  navy: 'bg-navy/5 text-navy border-navy/15',
  gold: 'bg-gold-wash text-gold-deep border-gold-soft',
  ok: 'bg-ok-wash text-ok border-ok/20',
  warn: 'bg-warn-wash text-warn border-warn/20',
  alert: 'bg-alert-wash text-alert border-alert/20',
  idle: 'bg-idle-wash text-idle border-idle/20',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11.5px] font-medium leading-5 whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A badge with a leading status dot. */
export function StatusPill({ children, tone = 'neutral', className }: BadgeProps) {
  const dot: Record<Tone, string> = {
    neutral: 'bg-slate-light',
    navy: 'bg-navy',
    gold: 'bg-gold',
    ok: 'bg-ok',
    warn: 'bg-warn',
    alert: 'bg-alert',
    idle: 'bg-idle',
  };
  return (
    <Badge tone={tone} className={className}>
      <span className={cn('size-1.5 rounded-full', dot[tone])} aria-hidden />
      {children}
    </Badge>
  );
}
