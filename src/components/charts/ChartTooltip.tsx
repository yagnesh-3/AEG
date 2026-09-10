import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface Props extends TooltipProps<ValueType, NameType> {
  /** Formats each value; defaults to the raw number. */
  format?: (value: number) => string;
  /** Hides the series name when the chart has only one series. */
  hideName?: boolean;
}

export function ChartTooltip({ active, payload, label, format, hideName }: Props) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 shadow-lift">
      {label ? <p className="mb-1.5 text-[12px] font-semibold text-navy">{label}</p> : null}
      <ul className="space-y-1">
        {payload.map((entry, i) => (
          <li key={`${entry.name}-${i}`} className="flex items-center gap-2 text-[12px]">
            <span
              className="size-2 shrink-0 rounded-[2px]"
              style={{ background: entry.color ?? '#5A6472' }}
              aria-hidden
            />
            {!hideName ? <span className="text-slate">{entry.name}</span> : null}
            <span className="ml-auto pl-3 font-medium text-navy">
              {format ? format(Number(entry.value)) : String(entry.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
