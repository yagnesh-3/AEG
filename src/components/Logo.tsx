import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface LogoProps {
  to?: string;
  tone?: 'navy' | 'light';
  compact?: boolean;
  className?: string;
}

export function Logo({ to = '/', tone = 'navy', compact = false, className }: LogoProps) {
  const mark = (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg font-display text-[17px] font-bold leading-none',
        tone === 'navy' ? 'bg-navy text-gold' : 'bg-white/10 text-gold',
      )}
      aria-hidden
    >
      A
    </span>
  );

  return (
    <Link to={to} className={cn('flex items-center gap-2.5', className)} aria-label="Alliance Estate Group — home">
      {mark}
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display text-[15px] font-semibold tracking-tight',
              tone === 'navy' ? 'text-navy' : 'text-white',
            )}
          >
            Alliance Estate Group
          </span>
          <span
            className={cn(
              'mt-1 text-[10px] font-medium uppercase tracking-[0.16em]',
              tone === 'navy' ? 'text-slate' : 'text-white/60',
            )}
          >
            Invest · Develop · Deliver
          </span>
        </span>
      ) : null}
    </Link>
  );
}
