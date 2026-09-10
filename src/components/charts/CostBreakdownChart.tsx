import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { AXIS } from '@/components/charts/theme';
import { currency, currencyCompact } from '@/lib/format';
import type { FeasibilityCostLine } from '@/types';

/** Sequential single hue — this is magnitude across ordered cost lines, not identity. */
const RAMP = ['#0D366B', '#184F95', '#256ABF', '#2A78D6', '#3987E5', '#5598E7', '#6DA7EC', '#86B6EF'];

export function CostBreakdownChart({ lines }: { lines: FeasibilityCostLine[] }) {
  const sorted = [...lines].sort((a, b) => b.amount - a.amount);

  return (
    <div style={{ height: Math.max(200, sorted.length * 34 + 20) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 62, bottom: 4, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={188}
            axisLine={false}
            tickLine={false}
            tick={{ ...AXIS.tick, fontFamily: AXIS.fontFamily }}
          />
          <Tooltip
            cursor={{ fill: '#F0ECE4', radius: 4 }}
            content={<ChartTooltip format={(v) => currency(v)} hideName />}
          />
          <Bar isAnimationActive={false} dataKey="amount" name="Cost" radius={[0, 4, 4, 0]} barSize={16}>
            {sorted.map((line, i) => (
              <Cell key={line.label} fill={RAMP[Math.min(i, RAMP.length - 1)]} />
            ))}
            <LabelList
              dataKey="amount"
              position="right"
              formatter={(v: unknown) => currencyCompact(Number(v))}
              style={{ fill: '#0F2440', fontSize: 12, fontWeight: 600, fontFamily: AXIS.fontFamily }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
