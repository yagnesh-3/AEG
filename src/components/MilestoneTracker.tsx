import { Check, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MILESTONE_BY_CODE } from '@/lib/labels';
import { date } from '@/lib/format';
import { isMilestoneOverdue } from '@/lib/project';
import type { Milestone } from '@/types';

interface Props {
  milestones: Milestone[];
  /** Compact mode hides target/actual dates — used on cards and public views. */
  compact?: boolean;
  className?: string;
}

export function MilestoneTracker({ milestones, compact = false, className }: Props) {
  return (
    <ol className={cn('relative', className)}>
      {milestones.map((milestone, i) => {
        const meta = MILESTONE_BY_CODE[milestone.code];
        const done = milestone.status === 'complete';
        const active = milestone.status === 'in-progress';
        const overdue = isMilestoneOverdue(milestone);
        const isLast = i === milestones.length - 1;

        return (
          <li key={milestone.code} className="relative flex gap-4 pb-5 last:pb-0">
            {!isLast ? (
              <span
                className={cn(
                  'absolute left-[13px] top-7 bottom-0 w-px',
                  done ? 'bg-ok/40' : 'bg-line',
                )}
                aria-hidden
              />
            ) : null}

            <span
              className={cn(
                'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                done
                  ? 'border-ok bg-ok text-white'
                  : active
                    ? 'border-warn bg-warn-wash text-warn'
                    : 'border-line bg-surface text-slate-light',
              )}
            >
              {done ? <Check size={14} strokeWidth={3} /> : active ? <Clock size={13} /> : <Circle size={7} fill="currentColor" />}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-mono text-[11px] font-semibold text-gold-deep">{milestone.code}</span>
                <span className={cn('text-[14px] font-medium', done || active ? 'text-navy' : 'text-slate')}>
                  {meta.name}
                </span>
                {overdue ? (
                  <span className="rounded bg-alert-wash px-1.5 py-px text-[11px] font-medium text-alert">
                    Overdue
                  </span>
                ) : null}
              </div>

              {!compact ? (
                <>
                  <p className="mt-0.5 text-[12.5px] text-slate">{meta.description}</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
                    <span className="text-slate">
                      Target <span className="font-medium text-navy">{date(milestone.targetDate)}</span>
                    </span>
                    <span className="text-slate">
                      Actual{' '}
                      <span className={cn('font-medium', milestone.actualDate ? 'text-ok' : 'text-slate-light')}>
                        {date(milestone.actualDate)}
                      </span>
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Horizontal seven-dot summary for cards and table rows. */
export function MilestoneDots({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label="Milestone progress M1 to M7">
      {milestones.map((m) => (
        <span
          key={m.code}
          title={`${m.code} — ${m.status}`}
          className={cn(
            'size-2 rounded-full',
            m.status === 'complete' ? 'bg-ok' : m.status === 'in-progress' ? 'bg-warn' : 'bg-line',
          )}
        />
      ))}
    </div>
  );
}
