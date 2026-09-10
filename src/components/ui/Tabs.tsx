import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('scroll-x border-b border-line', className)}>
      <div role="tablist" className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative -mb-px border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
                selected
                  ? 'border-gold text-navy'
                  : 'border-transparent text-slate hover:border-line hover:text-navy',
              )}
            >
              {tab.label}
              {typeof tab.count === 'number' ? (
                <span
                  className={cn(
                    'ml-2 rounded px-1.5 py-0.5 text-[11px] font-semibold',
                    selected ? 'bg-gold-wash text-gold-deep' : 'bg-line-soft text-slate',
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TabPanel({ id, active, children }: { id: string; active: string; children: ReactNode }) {
  if (id !== active) return null;
  return (
    <div role="tabpanel" className="pt-5">
      {children}
    </div>
  );
}
