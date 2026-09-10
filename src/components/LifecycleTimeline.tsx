import { cn } from '@/lib/cn';
import { LIFECYCLE_STAGES } from '@/lib/labels';
import { lifecycleIndex } from '@/lib/project';
import type { LifecycleStage } from '@/types';

/**
 * The end-to-end delivery flow: Land Identification through Settlement.
 * Scrolls horizontally within its own container on narrow screens.
 */
export function LifecycleTimeline({ stage, className }: { stage: LifecycleStage; className?: string }) {
  const current = lifecycleIndex(stage);

  return (
    <div className={cn('scroll-x pb-2', className)}>
      <ol className="flex min-w-max items-start gap-0">
        {LIFECYCLE_STAGES.map((item, i) => {
          const done = i < current;
          const active = i === current;
          const isLast = i === LIFECYCLE_STAGES.length - 1;

          return (
            <li key={item.stage} className="flex items-start">
              <div className="flex w-[104px] flex-col items-center text-center">
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full border-2 text-[10px] font-bold',
                    done
                      ? 'border-navy bg-navy text-white'
                      : active
                        ? 'border-gold bg-gold text-white ring-4 ring-gold/15'
                        : 'border-line bg-surface text-slate-light',
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    'mt-2 px-1 text-[11.5px] leading-tight',
                    active ? 'font-semibold text-navy' : done ? 'text-navy' : 'text-slate-light',
                  )}
                >
                  {item.name}
                </span>
              </div>
              {!isLast ? (
                <span
                  className={cn('mt-3 h-0.5 w-4 shrink-0 rounded-full', done ? 'bg-navy' : 'bg-line')}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
