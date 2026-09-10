import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { CostBreakdownChart } from '@/components/charts/CostBreakdownChart';
import { FeasibilityStatusBadge } from '@/components/StatusBadges';
import { Button, ButtonLink, Card, CardBody, EmptyState } from '@/components/ui';
import { useProject, useProjectFeasibility } from '@/store/DataContext';
import { CATEGORY_LABELS, MILESTONE_BY_CODE } from '@/lib/labels';
import { currency, date, monthYear, number, percent } from '@/lib/format';
import {
  feasibilityMarginPct,
  feasibilityNetRealisation,
  feasibilityProfit,
  feasibilitySellingCosts,
  feasibilityTotalCost,
} from '@/lib/project';

/** Print-ready feasibility report on the standard AEG template. */
export function FeasibilityReportPage() {
  const { projectId } = useParams();
  const project = useProject(projectId);
  const feasibility = useProjectFeasibility(projectId);

  if (!project || !feasibility) {
    return (
      <Card>
        <EmptyState
          title="Feasibility not found"
          description="No feasibility report exists for this project yet."
          action={
            <ButtonLink to="/app/feasibility" variant="secondary">
              Feasibility library
            </ButtonLink>
          }
        />
      </Card>
    );
  }

  const totalCost = feasibilityTotalCost(feasibility);
  const net = feasibilityNetRealisation(feasibility);
  const profit = feasibilityProfit(feasibility);

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/app/feasibility"
          className="inline-flex items-center gap-1.5 text-[13px] text-slate transition-colors hover:text-navy"
        >
          <ArrowLeft size={14} />
          Feasibility library
        </Link>
        <div className="flex gap-2">
          <ButtonLink to={`/app/projects/${project.id}`} variant="secondary" size="sm">
            Project record
          </ButtonLink>
          <Button size="sm" onClick={() => window.print()}>
            <Printer size={15} />
            Print report
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Report header */}
        <div className="border-b border-line bg-navy px-7 py-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                Alliance Estate Group — Feasibility Report
              </p>
              <h1 className="mt-3 font-display text-[30px] font-semibold text-white">{project.name}</h1>
              <p className="mt-1.5 text-[14px] text-white/60">
                {CATEGORY_LABELS[project.category]} · {project.location},{' '}
                {project.country === 'Australia' ? project.state : project.country}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[13px] text-gold">{feasibility.version}</p>
              <p className="mt-1.5 text-[12.5px] text-white/55">Prepared {date(feasibility.preparedOn)}</p>
              <p className="text-[12.5px] text-white/55">by {feasibility.preparedBy}</p>
              <div className="mt-3">
                <FeasibilityStatusBadge status={feasibility.status} />
              </div>
            </div>
          </div>
        </div>

        <CardBody className="space-y-9 px-7 py-8">
          {/* Summary */}
          <section>
            <h2 className="text-[19px]">1. Summary</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total project cost', value: currency(totalCost) },
                { label: 'Net realisation', value: currency(net) },
                {
                  label: 'Development profit',
                  value: currency(profit),
                  tone: profit > 0 ? 'text-ok' : 'text-alert',
                },
                { label: 'Margin on cost', value: percent(feasibilityMarginPct(feasibility)) },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-line bg-ivory p-4">
                  <p className="text-[11.5px] uppercase tracking-wide text-slate">{item.label}</p>
                  <p className={`mt-1.5 font-display text-[22px] font-semibold ${item.tone ?? 'text-navy'}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Costs */}
          <section>
            <h2 className="text-[19px]">2. Cost plan</h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <div className="scroll-x">
                <table className="w-full min-w-[320px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th scope="col" className="py-2 text-left text-[11.5px] font-semibold uppercase tracking-wider text-slate">
                        Cost line
                      </th>
                      <th scope="col" className="py-2 text-right text-[11.5px] font-semibold uppercase tracking-wider text-slate">
                        Amount
                      </th>
                      <th scope="col" className="py-2 text-right text-[11.5px] font-semibold uppercase tracking-wider text-slate">
                        % of cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {feasibility.costLines.map((line) => (
                      <tr key={line.label} className="border-b border-line-soft">
                        <td className="py-2.5 text-[13.5px] text-navy">{line.label}</td>
                        <td className="py-2.5 text-right font-mono text-[13px] text-navy">
                          {currency(line.amount)}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[13px] text-slate">
                          {percent((line.amount / Math.max(1, totalCost)) * 100, 1)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-navy">
                      <td className="py-3 text-[13.5px] font-semibold text-navy">Total project cost</td>
                      <td className="py-3 text-right font-mono text-[13.5px] font-semibold text-navy">
                        {currency(totalCost)}
                      </td>
                      <td className="py-3 text-right font-mono text-[13px] text-slate">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <CostBreakdownChart lines={feasibility.costLines} />
              </div>
            </div>
          </section>

          {/* Returns */}
          <section>
            <h2 className="text-[19px]">3. Returns</h2>
            <div className="mt-4 scroll-x">
              <table className="w-full min-w-[380px] border-collapse text-sm">
                <tbody>
                  {[
                    ['Gross realisation', currency(feasibility.grossRealisation)],
                    [
                      `Less selling costs (${percent(feasibility.sellingCostsPct)})`,
                      `(${currency(feasibilitySellingCosts(feasibility))})`,
                    ],
                    ['Net realisation', currency(net)],
                    ['Less total project cost', `(${currency(totalCost)})`],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-line-soft">
                      <td className="py-2.5 text-[13.5px] text-navy">{label}</td>
                      <td className="py-2.5 text-right font-mono text-[13px] text-navy">{value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-navy">
                    <td className="py-3 text-[13.5px] font-semibold text-navy">Development profit</td>
                    <td
                      className={`py-3 text-right font-mono text-[13.5px] font-semibold ${profit > 0 ? 'text-ok' : 'text-alert'}`}
                    >
                      {currency(profit)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[13.5px] text-navy">Margin on cost</td>
                    <td className="py-2.5 text-right font-mono text-[13px] text-navy">
                      {percent(feasibilityMarginPct(feasibility))}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[13.5px] text-navy">Target IRR</td>
                    <td className="py-2.5 text-right font-mono text-[13px] text-navy">
                      {percent(feasibility.targetIrrPct)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h2 className="text-[19px]">4. Timeline</h2>
            <p className="mt-2 text-[13.5px] text-slate">
              Development period of {feasibility.durationMonths} months, from{' '}
              {monthYear(project.startedOn)} to {monthYear(project.targetCompletion)}.
            </p>
            <div className="mt-4 scroll-x">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line">
                    {['Milestone', 'Description', 'Target', 'Actual'].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="py-2 text-left text-[11.5px] font-semibold uppercase tracking-wider text-slate"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {project.milestones.map((m) => (
                    <tr key={m.code} className="border-b border-line-soft">
                      <td className="py-2.5">
                        <span className="font-mono text-[12px] font-bold text-gold-deep">{m.code}</span>
                        <span className="ml-2 text-[13.5px] text-navy">{MILESTONE_BY_CODE[m.code].name}</span>
                      </td>
                      <td className="py-2.5 text-[12.5px] text-slate">{MILESTONE_BY_CODE[m.code].description}</td>
                      <td className="py-2.5 text-[13px] text-navy">{date(m.targetDate)}</td>
                      <td className={`py-2.5 text-[13px] ${m.actualDate ? 'text-ok' : 'text-slate-light'}`}>
                        {date(m.actualDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Risk */}
          <section>
            <h2 className="text-[19px]">5. Risk</h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-slate">{feasibility.riskSummary}</p>
          </section>

          {/* Assumptions */}
          <section>
            <h2 className="text-[19px]">6. Assumptions</h2>
            <ul className="mt-3 space-y-2">
              {feasibility.assumptions.map((assumption) => (
                <li key={assumption} className="flex gap-3 text-[14px] text-slate">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                  {assumption}
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-line pt-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                ['Site area', `${number(project.areaHectares)} ha`],
                project.lots ? ['Lots', number(project.lots)] : ['Project manager', project.projectManager],
                ['Approved', feasibility.approvedOn ? date(feasibility.approvedOn) : 'Pending sign-off'],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-[11.5px] uppercase tracking-wide text-slate">{label}</p>
                  <p className="mt-1 text-[14px] font-medium text-navy">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11.5px] leading-relaxed text-slate-light">
              This feasibility is prepared for AEG internal and investor reporting purposes. Figures
              are forecasts based on the assumptions listed above and are not a guarantee of return.
            </p>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}
