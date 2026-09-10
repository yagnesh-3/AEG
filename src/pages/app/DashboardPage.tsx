import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  MessageSquare,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { MilestoneProgressChart } from '@/components/charts/MilestoneProgressChart';
import { CapitalChart } from '@/components/charts/CapitalChart';
import { RiskCategoryBadge, RiskSeverityBadge } from '@/components/StatusBadges';
import { MilestoneDots } from '@/components/MilestoneTracker';
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
  ProgressBar,
  StatTile,
} from '@/components/ui';
import { useData } from '@/store/DataContext';
import { useAuth } from '@/store/AuthContext';
import { canAccess } from '@/lib/access';
import { currencyCompact, date, number } from '@/lib/format';
import { milestoneProgress, openRisks, overdueMilestoneCount, riskScore } from '@/lib/project';

export function DashboardPage() {
  const { projects, risks, enquiries, investors, holdings } = useData();
  const { user } = useAuth();
  const role = user!.role;

  const inDevelopment = projects.filter((p) => p.status === 'in-development');
  const completed = projects.filter((p) => p.status === 'completed');
  const committed = holdings.reduce((sum, h) => sum + h.committed, 0);
  const capitalGap = projects.reduce(
    (sum, p) => sum + Math.max(0, p.financials.investorCapitalTarget - p.financials.investorCapitalRaised),
    0,
  );

  const attention = projects
    .map((p) => ({ project: p, overdue: overdueMilestoneCount(p) }))
    .filter((row) => row.overdue > 0)
    .sort((a, b) => b.overdue - a.overdue)
    .slice(0, 5);

  const topRisks = openRisks(risks)
    .sort((a, b) => riskScore(b) - riskScore(a))
    .slice(0, 5);

  const openEnquiries = enquiries
    .filter((e) => e.status === 'new' || e.status === 'in-progress')
    .sort((a, b) => b.raisedOn.localeCompare(a.raisedOn));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you, ${user!.name.split(' ')[0]}`}
        description="Portfolio position across every AEG project, with the items that need attention first."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Projects"
          value={number(projects.length)}
          sub={`${inDevelopment.length} in development · ${completed.length} completed`}
          icon={<Building2 size={16} />}
        />
        <StatTile
          label="Capital committed"
          value={currencyCompact(committed)}
          sub={`across ${number(investors.filter((i) => i.status === 'active').length)} active investors`}
          icon={<Wallet size={16} />}
          tone="gold"
        />
        <StatTile
          label="Capacity remaining"
          value={currencyCompact(capitalGap)}
          sub="still to raise across open projects"
          icon={<TrendingUp size={16} />}
        />
        <StatTile
          label="Open risks"
          value={number(openRisks(risks).length)}
          sub={`${attention.length} projects with an overdue milestone`}
          icon={<AlertTriangle size={16} />}
          tone={attention.length > 0 ? 'alert' : 'default'}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Portfolio by category"
            description="Capital committed to land and development across the six AEG categories."
          />
          <CardBody>
            <CategoryBreakdownChart projects={projects} measure="value" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Milestone position across the portfolio"
            description="How many projects have reached each of the seven key milestones."
          />
          <CardBody>
            <MilestoneProgressChart projects={projects} />
          </CardBody>
        </Card>
      </div>

      {canAccess(role, 'investors') ? (
        <Card>
          <CardHeader
            title="Capital raised against target"
            description="The six projects with the most capacity still to place."
          />
          <CardBody>
            <CapitalChart projects={projects} />
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Needs attention"
            description="Projects carrying an overdue milestone."
            action={
              <Link to="/app/projects" className="text-[13px] font-medium text-gold-deep hover:underline">
                All projects
              </Link>
            }
          />
          {attention.length === 0 ? (
            <EmptyState title="Nothing overdue" description="Every milestone is tracking to its target date." />
          ) : (
            <ul className="divide-y divide-line-soft">
              {attention.map(({ project, overdue }) => (
                <li key={project.id}>
                  <Link
                    to={`/app/projects/${project.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gold-wash/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-navy">{project.name}</p>
                      <p className="mt-0.5 text-[12.5px] text-slate">
                        {project.location} · {project.projectManager}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <MilestoneDots milestones={project.milestones} />
                        <span className="text-[11.5px] text-slate-light">
                          {milestoneProgress(project)}% complete
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-alert-wash px-2 py-1 text-[11.5px] font-semibold text-alert">
                      {overdue} overdue
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Highest-scoring open risks"
            description="Likelihood × impact across every project register."
          />
          {topRisks.length === 0 ? (
            <EmptyState title="No open risks" description="Every risk on the register is mitigated or closed." />
          ) : (
            <ul className="divide-y divide-line-soft">
              {topRisks.map((risk) => {
                const project = projects.find((p) => p.id === risk.projectId);
                return (
                  <li key={risk.id}>
                    <Link
                      to={`/app/projects/${risk.projectId}?tab=risks`}
                      className="block px-5 py-3.5 transition-colors hover:bg-gold-wash/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[14px] font-medium text-navy">{risk.title}</p>
                        <RiskSeverityBadge risk={risk} />
                      </div>
                      <p className="mt-1 text-[12.5px] text-slate">{project?.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <RiskCategoryBadge category={risk.category} />
                        <span className="text-[11.5px] text-slate-light">Owner: {risk.owner}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {canAccess(role, 'communications') ? (
        <Card>
          <CardHeader
            title="Open investor enquiries"
            description="Questions raised through the portal, website and assistant."
            action={
              <Link
                to="/app/communications"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-gold-deep hover:underline"
              >
                Inbox <ArrowUpRight size={13} />
              </Link>
            }
          />
          {openEnquiries.length === 0 ? (
            <EmptyState
              icon={<MessageSquare size={18} />}
              title="Inbox clear"
              description="Every enquiry has been answered or closed."
            />
          ) : (
            <ul className="divide-y divide-line-soft">
              {openEnquiries.slice(0, 4).map((enquiry) => (
                <li key={enquiry.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-navy">{enquiry.subject}</p>
                    <p className="mt-0.5 text-[12.5px] text-slate">
                      {enquiry.contactName} · raised {date(enquiry.raisedOn)}
                    </p>
                  </div>
                  <span
                    className={
                      enquiry.status === 'new'
                        ? 'rounded-md bg-alert-wash px-2 py-1 text-[11.5px] font-semibold text-alert'
                        : 'rounded-md bg-warn-wash px-2 py-1 text-[11.5px] font-semibold text-warn'
                    }
                  >
                    {enquiry.status === 'new' ? 'New' : 'In progress'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Delivery progress" description="Milestone completion for every project in development." />
        <CardBody className="space-y-3.5">
          {inDevelopment.slice(0, 8).map((project) => {
            const progress = milestoneProgress(project);
            return (
              <Link key={project.id} to={`/app/projects/${project.id}`} className="block group">
                <div className="mb-1.5 flex items-baseline justify-between gap-4 text-[13px]">
                  <span className="truncate font-medium text-navy group-hover:text-gold-deep">
                    {project.name}
                  </span>
                  <span className="shrink-0 text-slate">{progress}%</span>
                </div>
                <ProgressBar value={progress} tone="gold" label={`${project.name} progress`} />
              </Link>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
