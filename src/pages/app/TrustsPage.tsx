import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, Clock, Wallet } from 'lucide-react';
import { ExitStageBadge, TrustStatusBadge } from '@/components/StatusBadges';
import {
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DetailRow,
  EmptyState,
  PageHeader,
  ProgressBar,
  StatTile,
  Tabs,
  TabPanel,
} from '@/components/ui';
import { useData } from '@/store/DataContext';
import { EXIT_STAGES } from '@/lib/labels';
import { currency, currencyCompact, date, number, percent } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { UnitHolding } from '@/types';

export function TrustsPage() {
  const { trusts, holdings, investors, projects, exitProcesses } = useData();
  const [tab, setTab] = useState('trusts');
  const [selectedTrust, setSelectedTrust] = useState(trusts[0]?.id ?? '');

  const totalCommitted = holdings.reduce((sum, h) => sum + h.committed, 0);
  const totalDistributed = holdings.reduce((sum, h) => sum + h.distributionsPaid, 0);
  const activeExits = exitProcesses.filter((x) => x.stage !== 'complete');
  const distributionPool = exitProcesses.reduce((sum, x) => sum + x.distributionPool, 0);

  const trust = trusts.find((t) => t.id === selectedTrust);
  const registerRows = holdings.filter((h) => h.trustId === selectedTrust);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 4 — Investor exit"
        title="Unit trusts & exits"
        description="The AEG unit trust structures, their unit registers, and the exit process for completed or maturing projects."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Unit trusts" value={number(trusts.length)} sub={`${trusts.filter((t) => t.status === 'active').length} active`} />
        <StatTile label="Capital committed" value={currencyCompact(totalCommitted)} sub={`${number(holdings.length)} holdings on register`} tone="gold" />
        <StatTile label="Distributions paid" value={currencyCompact(totalDistributed)} sub="returned to unit holders" tone="ok" />
        <StatTile label="Exits in progress" value={number(activeExits.length)} sub={`${currencyCompact(distributionPool)} in distribution pools`} />
      </div>

      <Tabs
        tabs={[
          { id: 'trusts', label: 'Trusts', count: trusts.length },
          { id: 'register', label: 'Unit register', count: registerRows.length },
          { id: 'exits', label: 'Exit tracking', count: exitProcesses.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <TabPanel id="trusts" active={tab}>
        <Card>
          <CardHeader title="Unit trust entities" description="Each trust holds one or more projects under a corporate trustee." />
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'Trust',
                render: (t) => (
                  <div>
                    <p className="font-medium text-navy">{t.name}</p>
                    <p className="mt-0.5 font-mono text-[12px] text-slate">ABN {t.abn}</p>
                  </div>
                ),
              },
              { key: 'status', header: 'Status', render: (t) => <TrustStatusBadge status={t.status} /> },
              {
                key: 'projects',
                header: 'Projects',
                render: (t) => (
                  <div className="flex flex-wrap gap-1">
                    {t.projectIds.map((pid) => {
                      const project = projects.find((p) => p.id === pid);
                      return project ? (
                        <Link
                          key={pid}
                          to={`/app/projects/${pid}`}
                          className="rounded border border-line px-1.5 py-0.5 text-[11.5px] text-navy transition-colors hover:border-gold"
                        >
                          {project.name}
                        </Link>
                      ) : null;
                    })}
                  </div>
                ),
              },
              {
                key: 'units',
                header: 'Units on issue',
                className: 'text-right font-mono text-[12.5px]',
                headerClassName: 'text-right',
                render: (t) => number(t.totalUnits),
              },
              {
                key: 'value',
                header: 'Trust capital',
                className: 'text-right font-mono text-[12.5px]',
                headerClassName: 'text-right',
                render: (t) => currency(t.totalUnits * t.unitPrice),
              },
              { key: 'established', header: 'Established', render: (t) => <span className="text-[12.5px] text-slate">{date(t.establishedOn)}</span> },
              {
                key: 'holders',
                header: 'Holders',
                className: 'text-right font-mono text-[12.5px]',
                headerClassName: 'text-right',
                render: (t) => number(holdings.filter((h) => h.trustId === t.id).length),
              },
            ]}
            rows={trusts}
            rowKey={(t) => t.id}
            onRowClick={(t) => {
              setSelectedTrust(t.id);
              setTab('register');
            }}
          />
        </Card>
      </TabPanel>

      <TabPanel id="register" active={tab}>
        <div className="grid gap-5 lg:grid-cols-4">
          <Card className="lg:col-span-1">
            <CardHeader title="Select trust" />
            <CardBody className="space-y-1.5 p-2">
              {trusts.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTrust(t.id)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2.5 text-left transition-colors',
                    t.id === selectedTrust ? 'bg-navy text-white' : 'text-navy hover:bg-line-soft',
                  )}
                >
                  <p className="text-[13px] font-medium leading-snug">{t.name}</p>
                  <p className={cn('mt-0.5 text-[11.5px]', t.id === selectedTrust ? 'text-white/55' : 'text-slate')}>
                    {number(holdings.filter((h) => h.trustId === t.id).length)} holders ·{' '}
                    {number(t.totalUnits)} units
                  </p>
                </button>
              ))}
            </CardBody>
          </Card>

          <div className="space-y-5 lg:col-span-3">
            {trust ? (
              <Card>
                <CardHeader title={trust.name} description={`Trustee: ${trust.trustee}`} action={<TrustStatusBadge status={trust.status} />} />
                <CardBody>
                  <dl className="grid gap-x-8 sm:grid-cols-2">
                    <DetailRow label="ABN" value={<span className="font-mono text-[12.5px]">{trust.abn}</span>} />
                    <DetailRow label="Established" value={date(trust.establishedOn)} />
                    <DetailRow label="Units on issue" value={number(trust.totalUnits)} />
                    <DetailRow label="Unit price" value={currency(trust.unitPrice)} />
                    <DetailRow label="Trust capital" value={currency(trust.totalUnits * trust.unitPrice)} />
                    <DetailRow label="Holders" value={number(registerRows.length)} />
                  </dl>
                </CardBody>
              </Card>
            ) : null}

            <Card>
              <CardHeader title="Unit register" description="Every holder of units in this trust." />
              <DataTable
                columns={[
                  {
                    key: 'investor',
                    header: 'Holder',
                    render: (h: UnitHolding) => {
                      const investor = investors.find((i) => i.id === h.investorId);
                      return investor ? (
                        <Link
                          to={`/app/investors/${investor.id}`}
                          className="font-medium text-navy hover:text-gold-deep hover:underline"
                        >
                          {investor.name}
                        </Link>
                      ) : (
                        <span className="text-slate">Unknown</span>
                      );
                    },
                  },
                  {
                    key: 'units',
                    header: 'Units',
                    className: 'text-right font-mono text-[12.5px]',
                    headerClassName: 'text-right',
                    render: (h: UnitHolding) => number(h.units),
                  },
                  {
                    key: 'share',
                    header: 'Share',
                    className: 'text-right font-mono text-[12.5px]',
                    headerClassName: 'text-right',
                    render: (h: UnitHolding) =>
                      trust ? percent((h.units / Math.max(1, trust.totalUnits)) * 100) : '—',
                  },
                  {
                    key: 'committed',
                    header: 'Committed',
                    className: 'text-right font-mono text-[12.5px]',
                    headerClassName: 'text-right',
                    render: (h: UnitHolding) => currency(h.committed),
                  },
                  {
                    key: 'distributions',
                    header: 'Distributions',
                    className: 'text-right font-mono text-[12.5px]',
                    headerClassName: 'text-right',
                    render: (h: UnitHolding) => currency(h.distributionsPaid),
                  },
                  {
                    key: 'issued',
                    header: 'Issued',
                    render: (h: UnitHolding) => <span className="text-[12.5px] text-slate">{date(h.issuedOn)}</span>,
                  },
                ]}
                rows={registerRows}
                rowKey={(h) => h.id}
                empty={<EmptyState icon={<Wallet size={18} />} title="No units issued" description="This trust has no holders on the register yet." />}
              />
            </Card>
          </div>
        </div>
      </TabPanel>

      <TabPanel id="exits" active={tab}>
        <div className="space-y-5">
          {exitProcesses.map((exit) => {
            const project = projects.find((p) => p.id === exit.projectId);
            const trustRecord = trusts.find((t) => t.id === exit.trustId);
            const paidPct = (exit.distributionPaid / Math.max(1, exit.distributionPool)) * 100;

            return (
              <Card key={exit.id}>
                <CardHeader
                  title={project?.name ?? 'Unknown project'}
                  description={trustRecord?.name}
                  action={<ExitStageBadge stage={exit.stage} />}
                />
                <CardBody className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <p className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-slate">
                        Exit process
                      </p>
                      <ol className="space-y-0">
                        {EXIT_STAGES.map((stageMeta, i) => {
                          const step = exit.steps.find((s) => s.stage === stageMeta.stage);
                          const status = step?.status ?? 'not-started';
                          const isLast = i === EXIT_STAGES.length - 1;
                          return (
                            <li key={stageMeta.stage} className="relative flex gap-4 pb-5 last:pb-0">
                              {!isLast ? (
                                <span
                                  className={cn(
                                    'absolute left-[13px] top-7 bottom-0 w-px',
                                    status === 'complete' ? 'bg-ok/40' : 'bg-line',
                                  )}
                                  aria-hidden
                                />
                              ) : null}
                              <span
                                className={cn(
                                  'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                                  status === 'complete'
                                    ? 'border-ok bg-ok text-white'
                                    : status === 'in-progress'
                                      ? 'border-warn bg-warn-wash text-warn'
                                      : 'border-line bg-surface text-slate-light',
                                )}
                              >
                                {status === 'complete' ? (
                                  <Check size={14} strokeWidth={3} />
                                ) : status === 'in-progress' ? (
                                  <Clock size={13} />
                                ) : (
                                  <Circle size={7} fill="currentColor" />
                                )}
                              </span>
                              <div className="pt-0.5">
                                <p
                                  className={cn(
                                    'text-[14px] font-medium',
                                    status === 'not-started' ? 'text-slate' : 'text-navy',
                                  )}
                                >
                                  {stageMeta.name}
                                </p>
                                <p className="mt-0.5 text-[12.5px] text-slate">{stageMeta.description}</p>
                                <p className="mt-1 text-[12px] text-slate-light">
                                  Target {date(step?.targetDate ?? null)}
                                  {step?.actualDate ? ` · Completed ${date(step.actualDate)}` : ''}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                          <span className="text-slate">Distribution paid</span>
                          <span className="font-medium text-navy">{Math.round(paidPct)}%</span>
                        </div>
                        <ProgressBar value={paidPct} tone="ok" label="Distribution paid" />
                        <p className="mt-1.5 text-[12px] text-slate">
                          {currency(exit.distributionPaid)} of {currency(exit.distributionPool)}
                        </p>
                      </div>

                      <dl>
                        <DetailRow label="Opened" value={date(exit.openedOn)} />
                        <DetailRow label="Target completion" value={date(exit.targetCompletion)} />
                        <DetailRow label="Distribution pool" value={currency(exit.distributionPool)} />
                      </dl>
                    </div>
                  </div>

                  <div className="rounded-lg border border-line bg-ivory px-4 py-3">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-slate">Note</p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-navy">{exit.note}</p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </TabPanel>
    </div>
  );
}
