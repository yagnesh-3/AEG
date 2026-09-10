import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { AXIS, seriesColor } from '@/components/charts/theme';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/labels';
import { currencyCompact } from '@/lib/format';
import type { Project } from '@/types';

interface Props {
  projects: Project[];
  /** Count of projects, or capital deployed per category. */
  measure?: 'count' | 'value';
}

/**
 * Magnitude across a handful of named categories — a horizontal bar, sorted,
 * with the value labelled directly on each bar so no legend is needed.
 */
export function CategoryBreakdownChart({ projects, measure = 'count' }: Props) {
  const rows = CATEGORY_ORDER.map((category, i) => {
    const inCategory = projects.filter((p) => p.category === category);
    return {
      category,
      label: CATEGORY_LABELS[category],
      value:
        measure === 'count'
          ? inCategory.length
          : inCategory.reduce((sum, p) => sum + p.financials.landCost + p.financials.developmentBudget, 0),
      color: seriesColor(i),
    };
  })
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);

  const format = (v: number) => (measure === 'count' ? String(v) : currencyCompact(v));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 52, bottom: 4, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={132}
            axisLine={false}
            tickLine={false}
            tick={{ ...AXIS.tick, fontFamily: AXIS.fontFamily }}
          />
          <Tooltip
            cursor={{ fill: '#F0ECE4', radius: 4 }}
            content={<ChartTooltip format={format} hideName />}
          />
          <Bar isAnimationActive={false} dataKey="value" name={measure === 'count' ? 'Projects' : 'Committed'} radius={[0, 4, 4, 0]} barSize={16}>
            {rows.map((row) => (
              <Cell key={row.category} fill={row.color} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: unknown) => format(Number(v))}
              style={{ fill: '#0F2440', fontSize: 12, fontWeight: 600, fontFamily: AXIS.fontFamily }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
