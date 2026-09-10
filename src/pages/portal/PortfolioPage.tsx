import { Link } from 'react-router-dom';
import { ArrowRight, FileText, TrendingUp, Wallet } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { TrustStatusBadge } from '@/components/StatusBadges';
import {
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  PageHeader,
  StatTile,
} from '@/components/ui';
import { useData, useInvestorProjects } from '@/store/DataContext';
import { useAuth } from '@/store/AuthContext';
import { currency, currencyCompact, date, number, percent } from '@/lib/format';
import type { UnitHolding } from '@/types';

export function PortfolioPage() {
  const { user } = useAuth();
  const { holdings, trusts, investors, projectUpdates } = useData();
  const investorId = user!.investorId;
  const projects = useInvestorProjects(investorId);

  const investor = investors.find((i) => i.id === investorId);
  const myHoldings = holdings.filter((h) => h.investorId === investorId);
  const committed = myHoldings.reduce((sum, h) => sum + h.committed, 0);
  const distributions = myHoldings.reduce((sum, h) => sum + h.distributionsPaid, 0);
  const units = myHoldings.reduce((sum, h) => sum + h.units, 0);

  const projectIds = new Set(projects.map((p) => p.id));
  const recentUpdates = projectUpdates
    .filter((u) => u.investorVisible && projectIds.has(u.projectId))
    .sort((a, b) => b.postedOn.localeCompare(a.postedOn))
    .slice(0, 4);

  if (!investor) {
    return (
      <Card>
        <EmptyState title="No investor record linked" description="This account is not linked to an investor on the register." />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Investor portal"
        title={`Welcome back, ${investor.name.split(' ')[0]}`}
        description={`Your holdings across ${number(myHoldings.length)} AEG trusts, and the projects behind them.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Capital committed"
          value={currencyCompact(committed)}
          sub={`${number(units)} units held`}
          icon={<Wallet size={16} />}
          tone="gold"
        />
        <StatTile
          label="Distributions received"
          value={currencyCompact(distributions)}
          sub={committed > 0 ? `${percent((distributions / committed) * 100)} of capital returned` : '—'}
          icon={<TrendingUp size={16} />}
          tone="ok"
        />
        <StatTile label="Projects" value={number(projects.length)} sub="you hold an interest in" />
        <StatTile
          label="Trusts"
          value={number(new Set(myHoldings.map((h) => h.trustId)).size)}
          sub={`relationship manager: ${investor.relationshipManager}`}
        />
      </div>

      <Card>
        <CardHeader title="Your holdings" description="Units held in each AEG unit trust." />
        <DataTable
          columns={[
            {
              key: 'trust',
              header: 'Trust',
              render: (h: UnitHolding) => {
                const trust = trusts.find((t) => t.id === h.trustId);
                return (
                  <div>
                    <p className="font-medium text-navy">{trust?.name}</p>
                    <p className="mt-0.5 font-mono text-[12px] text-slate">ABN {trust?.abn}</p>
                  </div>
                );
              },
            },
            {
              key: 'status',
              header: 'Status',
              render: (h: UnitHolding) => {
                const trust = trusts.find((t) => t.id === h.trustId);
                return trust ? <TrustStatusBadge status={trust.status} /> : null;
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
          rows={myHoldings}
          rowKey={(h) => h.id}
          empty={<EmptyState title="No holdings yet" description="Speak with your relationship manager about current raises." />}
        />
      </Card>

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[20px]">Your projects</h2>
          <Link
            to="/portal/updates"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-gold-deep hover:underline"
          >
            All updates <ArrowRight size={13} />
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <EmptyState title="No projects yet" description="Projects appear here once you hold units in a trust." />
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} to={`/portal/projects/${project.id}`} />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader
          title="Latest updates"
          description="Reporting on the projects you hold an interest in."
          action={
            <Link to="/portal/updates" className="text-[13px] font-medium text-gold-deep hover:underline">
              View all
            </Link>
          }
        />
        {recentUpdates.length === 0 ? (
          <EmptyState icon={<FileText size={18} />} title="No updates yet" description="Project updates will appear here as they are posted." />
        ) : (
          <CardBody className="space-y-5 divide-y divide-line-soft">
            {recentUpdates.map((update) => {
              const project = projects.find((p) => p.id === update.projectId);
              return (
                <div key={update.id} className="pt-5 first:pt-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-[15px] font-medium text-navy">{update.title}</h4>
                    <span className="text-[12px] text-slate-light">{date(update.postedOn)}</span>
                  </div>
                  {project ? (
                    <Link
                      to={`/portal/projects/${project.id}`}
                      className="mt-0.5 inline-block text-[12.5px] font-medium text-gold-deep hover:underline"
                    >
                      {project.name}
                    </Link>
                  ) : null}
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">{update.body}</p>
                </div>
              );
            })}
          </CardBody>
        )}
      </Card>
    </div>
  );
}
