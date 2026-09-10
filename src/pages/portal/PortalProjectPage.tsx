import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { MilestoneTracker } from '@/components/MilestoneTracker';
import { LifecycleTimeline } from '@/components/LifecycleTimeline';
import { CategoryBadge, ProjectStatusBadge } from '@/components/StatusBadges';
import {
  Badge,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DetailRow,
  EmptyState,
  ProgressBar,
  StatTile,
  useToast,
} from '@/components/ui';
import {
  useProject,
  useProjectDocuments,
  useProjectFeasibility,
  useProjectUpdates,
  useInvestorProjects,
} from '@/store/DataContext';
import { useAuth } from '@/store/AuthContext';
import { DOCUMENT_KIND_LABELS, LIFECYCLE_LABELS } from '@/lib/labels';
import { currency, date, monthYear, number, percent } from '@/lib/format';
import {
  feasibilityMarginPct,
  feasibilityNetRealisation,
  feasibilityTotalCost,
  milestoneProgress,
} from '@/lib/project';

/**
 * Investor-facing project view. Deliberately excludes the internal risk
 * register, mitigation notes and cost-line breakdowns.
 */
export function PortalProjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const project = useProject(id);
  const investorProjects = useInvestorProjects(user!.investorId);
  const documents = useProjectDocuments(project?.id).filter((d) => d.investorVisible);
  const updates = useProjectUpdates(project?.id).filter((u) => u.investorVisible);
  const feasibility = useProjectFeasibility(project?.id);
  const { notify } = useToast();

  const permitted = project && investorProjects.some((p) => p.id === project.id);

  if (!project || !permitted) {
    return (
      <Card>
        <EmptyState
          title="Project not available"
          description="This project is not among your current holdings."
          action={
            <ButtonLink to="/portal" variant="secondary">
              Back to portfolio
            </ButtonLink>
          }
        />
      </Card>
    );
  }

  const progress = milestoneProgress(project);

  return (
    <div className="space-y-6">
      <Link
        to="/portal"
        className="inline-flex items-center gap-1.5 text-[13px] text-slate transition-colors hover:text-navy"
      >
        <ArrowLeft size={14} />
        My portfolio
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={project.category} />
          <ProjectStatusBadge status={project.status} />
          <Badge tone="neutral">{LIFECYCLE_LABELS[project.lifecycleStage]}</Badge>
        </div>
        <h1 className="mt-3 text-[28px] md:text-[32px]">{project.name}</h1>
        <p className="mt-1.5 text-[14px] text-slate">
          {project.location}, {project.country === 'Australia' ? project.state : project.country} · Project
          manager: {project.projectManager}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Milestone progress" value={`${progress}%`} sub={`${project.milestones.filter((m) => m.status === 'complete').length} of 7 complete`} tone="gold" />
        <StatTile label="Delivery stage" value={LIFECYCLE_LABELS[project.lifecycleStage]} />
        <StatTile label="Target completion" value={monthYear(project.targetCompletion)} />
        <StatTile label="Target IRR" value={percent(project.financials.targetIrrPct)} sub="per current feasibility" />
      </div>

      <Card>
        <CardHeader title="Delivery flow" description="Where this project sits in the end-to-end process." />
        <CardBody>
          <LifecycleTimeline stage={project.lifecycleStage} />
          <div className="mt-6">
            <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
              <span className="text-slate">Milestone progress</span>
              <span className="font-medium text-navy">{progress}%</span>
            </div>
            <ProgressBar value={progress} tone={project.status === 'completed' ? 'ok' : 'gold'} />
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="About this project" />
            <CardBody>
              <p className="text-[14.5px] leading-relaxed text-slate">{project.description}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Milestone tracker" description="The seven key milestones AEG tracks on every project." />
            <CardBody>
              <MilestoneTracker milestones={project.milestones} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Project updates" />
            {updates.length === 0 ? (
              <EmptyState title="No updates yet" description="Updates will appear here as the project progresses." />
            ) : (
              <CardBody className="space-y-5 divide-y divide-line-soft">
                {updates.map((update) => (
                  <div key={update.id} className="pt-5 first:pt-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="text-[15px] font-medium text-navy">{update.title}</h4>
                      <span className="text-[12px] text-slate-light">{date(update.postedOn)}</span>
                    </div>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">{update.body}</p>
                  </div>
                ))}
              </CardBody>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {feasibility ? (
            <Card>
              <CardHeader title="Feasibility summary" description={feasibility.version} />
              <CardBody>
                <dl>
                  <DetailRow label="Total project cost" value={currency(feasibilityTotalCost(feasibility))} />
                  <DetailRow label="Gross realisation" value={currency(feasibility.grossRealisation)} />
                  <DetailRow label="Net realisation" value={currency(feasibilityNetRealisation(feasibility))} />
                  <DetailRow label="Development margin" value={percent(feasibilityMarginPct(feasibility))} />
                  <DetailRow label="Target IRR" value={percent(feasibility.targetIrrPct)} />
                  <DetailRow label="Duration" value={`${feasibility.durationMonths} months`} />
                </dl>
                <p className="mt-4 text-[12.5px] leading-relaxed text-slate">{feasibility.riskSummary}</p>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Project record" />
            <CardBody>
              <dl>
                <DetailRow label="Site area" value={`${number(project.areaHectares)} ha`} />
                {project.lots ? <DetailRow label="Lots" value={number(project.lots)} /> : null}
                <DetailRow label="Commenced" value={monthYear(project.startedOn)} />
                <DetailRow label="Target completion" value={monthYear(project.targetCompletion)} />
                <DetailRow label="Documents" value={number(documents.length)} />
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Documents" description="Files shared with investors for this project." />
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Document',
              render: (d) => (
                <div className="flex items-center gap-2.5">
                  <FileText size={15} className="shrink-0 text-slate-light" />
                  <span className="font-medium text-navy">{d.name}</span>
                </div>
              ),
            },
            { key: 'kind', header: 'Type', render: (d) => <Badge tone="neutral">{DOCUMENT_KIND_LABELS[d.kind]}</Badge> },
            {
              key: 'size',
              header: 'Size',
              className: 'font-mono text-[12.5px]',
              render: (d) => `${number(Math.round(d.sizeKb / 100) / 10)} MB`,
            },
            { key: 'uploaded', header: 'Added', render: (d) => <span className="text-[13px] text-slate">{date(d.uploadedOn)}</span> },
            {
              key: 'action',
              header: '',
              headerClassName: 'text-right',
              className: 'text-right',
              render: () => (
                <button
                  type="button"
                  onClick={() => notify('Document download is not enabled in this demonstration.', 'info')}
                  className="rounded-lg p-1.5 text-slate transition-colors hover:bg-line-soft hover:text-navy"
                  aria-label="Download document"
                >
                  <Download size={15} />
                </button>
              ),
            },
          ]}
          rows={documents}
          rowKey={(d) => d.id}
          empty={<EmptyState icon={<FileText size={18} />} title="No documents yet" description="Documents appear as the project progresses." />}
        />
      </Card>
    </div>
  );
}
