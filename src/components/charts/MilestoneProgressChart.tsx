import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { AXIS, GRID_STROKE, STATUS } from '@/components/charts/theme';
import { MILESTONES } from '@/lib/labels';
import type { Project } from '@/types';

/**
 * Portfolio-wide milestone state. Milestone status is a *status* encoding, so it
 * uses the reserved status colours rather than a categorical slot.
 */
export function MilestoneProgressChart({ projects }: { projects: Project[] }) {
  const rows = MILESTONES.map((milestone, i) => {
    const states = projects.map((p) => p.milestones[i]?.status ?? 'not-started');
    return {
      code: milestone.code,
      name: milestone.name,
      Complete: states.filter((s) => s === 'complete').length,
      'In progress': states.filter((s) => s === 'in-progress').length,
      'Not started': states.filter((s) => s === 'not-started').length,
    };
  });

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="code"
            axisLine={{ stroke: AXIS.stroke }}
            tickLine={false}
            tick={{ ...AXIS.tick, fontFamily: AXIS.fontFamily }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ ...AXIS.tick, fontFamily: AXIS.fontFamily }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: '#F0ECE4' }}
            content={<ChartTooltip format={(v) => `${v} project${v === 1 ? '' : 's'}`} />}
            labelFormatter={(code) => {
              const match = rows.find((r) => r.code === code);
              return match ? `${match.code} — ${match.name}` : String(code);
            }}
          />
          <Legend
            verticalAlign="top"
            align="left"
            height={30}
            iconType="square"
            iconSize={9}
            wrapperStyle={{ fontSize: 12, fontFamily: AXIS.fontFamily, color: '#5A6472', paddingLeft: 26 }}
          />
          {/* 2px surface gap between stacked segments keeps the boundaries legible. */}
          <Bar isAnimationActive={false} dataKey="Complete" stackId="m" fill={STATUS.complete} barSize={26} stroke="#fff" strokeWidth={2} />
          <Bar isAnimationActive={false} dataKey="In progress" stackId="m" fill={STATUS.inProgress} barSize={26} stroke="#fff" strokeWidth={2} />
          <Bar
            dataKey="Not started"
            stackId="m"
            fill={STATUS.notStarted}
            barSize={26}
            stroke="#fff"
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
