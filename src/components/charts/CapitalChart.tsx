import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { AXIS, GRID_STROKE, SERIES } from '@/components/charts/theme';
import { currency, currencyCompact } from '@/lib/format';
import type { Project } from '@/types';

/**
 * Capital raised against target for the projects still taking capital.
 * Both series share one scale, so they sit on a single axis as grouped bars.
 */
export function CapitalChart({ projects }: { projects: Project[] }) {
  const rows = projects
    .filter((p) => p.financials.investorCapitalRaised < p.financials.investorCapitalTarget)
    .sort(
      (a, b) =>
        b.financials.investorCapitalTarget - b.financials.investorCapitalRaised -
        (a.financials.investorCapitalTarget - a.financials.investorCapitalRaised),
    )
    .slice(0, 6)
    .map((p) => ({
      name: p.name.length > 18 ? `${p.name.slice(0, 17)}…` : p.name,
      fullName: p.name,
      Raised: p.financials.investorCapitalRaised,
      Target: p.financials.investorCapitalTarget,
    }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={{ stroke: AXIS.stroke }}
            tickLine={false}
            tick={{ ...AXIS.tick, fontSize: 11, fontFamily: AXIS.fontFamily }}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={56}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ ...AXIS.tick, fontFamily: AXIS.fontFamily }}
            tickFormatter={(v) => currencyCompact(Number(v))}
            width={54}
          />
          <Tooltip
            cursor={{ fill: '#F0ECE4' }}
            content={<ChartTooltip format={(v) => currency(v)} />}
            labelFormatter={(name) => rows.find((r) => r.name === name)?.fullName ?? String(name)}
          />
          <Legend
            verticalAlign="top"
            align="left"
            height={28}
            iconType="square"
            iconSize={9}
            wrapperStyle={{ fontSize: 12, fontFamily: AXIS.fontFamily, color: '#5A6472' }}
          />
          <Bar isAnimationActive={false} dataKey="Raised" fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar isAnimationActive={false} dataKey="Target" fill={SERIES[3]} radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
