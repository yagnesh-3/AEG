import { useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  Megaphone,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { MilestoneTracker } from '@/components/MilestoneTracker';
import { LifecycleTimeline } from '@/components/LifecycleTimeline';
import { CostBreakdownChart } from '@/components/charts/CostBreakdownChart';
import {
  CategoryBadge,
  FeasibilityStatusBadge,
  MilestoneBadge,
  ProjectStatusBadge,
  RiskCategoryBadge,
  RiskSeverityBadge,
  RiskStatusBadge,
} from '@/components/StatusBadges';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DetailRow,
  EmptyState,
  Field,
  Input,
  Modal,
  ProgressBar,
  Select,
  StatTile,
  Tabs,
  TabPanel,
  Textarea,
  useToast,
  type Column,
} from '@/components/ui';
import {
  useData,
  useProject,
  useProjectDocuments,
  useProjectFeasibility,
  useProjectInvestors,
  useProjectRisks,
  useProjectUpdates,
} from '@/store/DataContext';
import { useAuth } from '@/store/AuthContext';
import { canAccess } from '@/lib/access';
import {
  DOCUMENT_KIND_LABELS,
  LIFECYCLE_LABELS,
  MILESTONE_BY_CODE,
  RISK_CATEGORY_LABELS,
  RISK_STATUS_LABELS,
} from '@/lib/labels';
import { currency, currencyCompact, date, number, percent } from '@/lib/format';
import {
  budgetUsedPct,
  capitalRaisedPct,
  feasibilityMarginPct,
  feasibilityNetRealisation,
  feasibilityTotalCost,
  milestoneProgress,
  projectedProfit,
  totalProjectCost,
} from '@/lib/project';
import type { Milestone, MilestoneStatus, Risk, RiskCategory, RiskImpact, RiskLikelihood, RiskStatus } from '@/types';

const BLANK_RISK = {
  title: '',
  category: 'approvals-regulatory' as RiskCategory,
  description: '',
  mitigation: '',
  likelihood: 'medium' as RiskLikelihood,
  impact: 'medium' as RiskImpact,
  owner: 'Daniel Whitmore',
};

export function ProjectRecordPage() {
  const { id } = useParams();
  const project = useProject(id);
  const { setMilestone, addRisk, updateRisk, addProjectUpdate } = useData();
  const { user } = useAuth();
  const { notify } = useToast();
  const [params, setParams] = useSearchParams();

  const risks = useProjectRisks(project?.id);
  const documents = useProjectDocuments(project?.id);
  const updates = useProjectUpdates(project?.id);
  const feasibility = useProjectFeasibility(project?.id);
  const projectInvestors = useProjectInvestors(project?.id);

  const [riskModal, setRiskModal] = useState(false);
  const [riskForm, setRiskForm] = useState(BLANK_RISK);
  const [updateModal, setUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ title: '', body: '', investorVisible: 'yes' });

  if (!project) {
    return (
      <Card>
        <EmptyState
          title="Project not found"
          description="This project may have been removed from the database."
          action={
            <ButtonLink to="/app/projects" variant="secondary">
              Back to projects
            </ButtonLink>
          }
        />
      </Card>
    );
  }

  const role = user!.role;
  const canEdit = role === 'admin' || role === 'staff';
  const showInvestors = canAccess(role, 'investors');
  const activeTab = params.get('tab') ?? 'overview';
  const setTab = (tab: string) => {
    const next = new URLSearchParams(params);
    if (tab === 'overview') next.delete('tab');
    else next.set('tab', tab);
    setParams(next, { replace: true });
  };

  const progress = milestoneProgress(project);
  const { financials } = project;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'milestones', label: 'Milestones', count: project.milestones.filter((m) => m.status === 'complete').length },
    { id: 'risks', label: 'Risks', count: risks.filter((r) => r.status === 'open' || r.status === 'monitoring').length },
    { id: 'feasibility', label: 'Feasibility' },
    { id: 'financials', label: 'Financials' },
    { id: 'documents', label: 'Documents', count: documents.length },
    ...(showInvestors ? [{ id: 'investors', label: 'Investors', count: projectInvestors.length }] : []),
    { id: 'updates', label: 'Updates', count: updates.length },
  ];

  const changeMilestone = (milestone: Milestone, status: MilestoneStatus) => {
    setMilestone(project.id, milestone.code, { status });
    notify(`${milestone.code} ${MILESTONE_BY_CODE[milestone.code].name} set to ${status.replace('-', ' ')}.`);
  };

  const submitRisk = (e: FormEvent) => {
    e.preventDefault();
    if (!riskForm.title.trim()) return;
    addRisk({
      id: `r-${Date.now()}`,
      projectId: project.id,
      category: riskForm.category,
      title: riskForm.title.trim(),
      description: riskForm.description.trim(),
      likelihood: riskForm.likelihood,
      impact: riskForm.impact,
      status: 'open',
      mitigation: riskForm.mitigation.trim(),
      owner: riskForm.owner,
      raisedOn: new Date().toISOString().slice(0, 10),
    });
    setRiskModal(false);
    setRiskForm(BLANK_RISK);
    notify('Risk added to the register.');
  };

  const submitUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (!updateForm.title.trim()) return;
    addProjectUpdate({
      id: `u-${Date.now()}`,
      projectId: project.id,
      title: updateForm.title.trim(),
      body: updateForm.body.trim(),
      postedOn: new Date().toISOString().slice(0, 10),
      postedBy: user!.name,
      investorVisible: updateForm.investorVisible === 'yes',
    });
    setUpdateModal(false);
    setUpdateForm({ title: '', body: '', investorVisible: 'yes' });
    notify('Update posted.');
  };

  const riskColumns: Column<Risk>[] = [
    {
      key: 'title',
      header: 'Risk',
      render: (r) => (
        <div className="max-w-md">
          <p className="font-medium text-navy">{r.title}</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate">{r.description}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (r) => <RiskCategoryBadge category={r.category} /> },
    { key: 'severity', header: 'Severity', render: (r) => <RiskSeverityBadge risk={r} /> },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        canEdit ? (
          <Select
            value={r.status}
            onChange={(e) => {
              updateRisk(r.id, { status: e.target.value as RiskStatus });
              notify('Risk status updated.');
            }}
            aria-label={`Status for ${r.title}`}
            className="min-w-[130px] py-1 text-[12.5px]"
          >
            {(Object.keys(RISK_STATUS_LABELS) as RiskStatus[]).map((s) => (
              <option key={s} value={s}>
                {RISK_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        ) : (
          <RiskStatusBadge status={r.status} />
        ),
    },
    { key: 'owner', header: 'Owner', render: (r) => <span className="text-[13px] text-slate">{r.owner}</span> },
    {
      key: 'raised',
      header: 'Raised',
      render: (r) => <span className="text-[12.5px] text-slate">{date(r.raisedOn)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/app/projects"
        className="inline-flex items-center gap-1.5 text-[13px] text-slate transition-colors hover:text-navy"
      >
        <ArrowLeft size={14} />
        Project database
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={project.category} />
            <ProjectStatusBadge status={project.status} />
            <Badge tone="neutral">{LIFECYCLE_LABELS[project.lifecycleStage]}</Badge>
          </div>
          <h1 className="mt-3 text-[28px] md:text-[32px]">{project.name}</h1>
          <p className="mt-1.5 text-[14px] text-slate">
            {project.location}, {project.country === 'Australia' ? project.state : project.country} ·
            Project manager: {project.projectManager}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ButtonLink to={`/projects/${project.slug}`} variant="secondary" size="sm">
            Public view
          </ButtonLink>
          {canEdit ? (
            <Button size="sm" onClick={() => setUpdateModal(true)}>
              <Megaphone size={15} />
              Post update
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Milestone progress"
          value={`${progress}%`}
          sub={`${project.milestones.filter((m) => m.status === 'complete').length} of 7 complete`}
          tone="gold"
        />
        <StatTile
          label="Total project cost"
          value={currencyCompact(totalProjectCost(project))}
          sub={`Land ${currencyCompact(financials.landCost)} · Build ${currencyCompact(financials.developmentBudget)}`}
        />
        <StatTile
          label="Projected profit"
          value={currencyCompact(projectedProfit(project))}
          sub={`Target IRR ${percent(financials.targetIrrPct)}`}
          tone={projectedProfit(project) > 0 ? 'ok' : 'alert'}
        />
        <StatTile
          label="Capital raised"
          value={`${Math.round(capitalRaisedPct(project))}%`}
          sub={`${currencyCompact(financials.investorCapitalRaised)} of ${currencyCompact(financials.investorCapitalTarget)}`}
        />
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setTab} />

      {/* Overview */}
      <TabPanel id="overview" active={activeTab}>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="min-w-0 space-y-5 lg:col-span-2">
            <Card>
              <CardHeader title="Delivery flow" description="Where this project sits in the end-to-end process." />
              <CardBody>
                <LifecycleTimeline stage={project.lifecycleStage} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Description" />
              <CardBody>
                <p className="text-[14.5px] leading-relaxed text-slate">{project.description}</p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Milestone summary"
                description="M1 – M7 with target and actual dates."
                action={
                  <button
                    type="button"
                    onClick={() => setTab('milestones')}
                    className="text-[13px] font-medium text-gold-deep hover:underline"
                  >
                    Manage
                  </button>
                }
              />
              <CardBody>
                <MilestoneTracker milestones={project.milestones} />
              </CardBody>
            </Card>
          </div>

          <div className="min-w-0 space-y-5">
            <Card>
              <CardHeader title="Project record" />
              <CardBody>
                <dl>
                  <DetailRow label="Project ID" value={<span className="font-mono text-[12.5px]">{project.id}</span>} />
                  <DetailRow label="Site area" value={`${number(project.areaHectares)} ha`} />
                  {project.lots ? <DetailRow label="Lots" value={number(project.lots)} /> : null}
                  <DetailRow label="Commenced" value={date(project.startedOn)} />
                  <DetailRow label="Target completion" value={date(project.targetCompletion)} />
                  <DetailRow label="Project manager" value={project.projectManager} />
                  <DetailRow label="Documents" value={number(documents.length)} />
                  <DetailRow
                    label="Open risks"
                    value={number(risks.filter((r) => r.status === 'open' || r.status === 'monitoring').length)}
                  />
                </dl>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Budget position" />
              <CardBody className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                    <span className="text-slate">Development spend</span>
                    <span className="font-medium text-navy">{Math.round(budgetUsedPct(project))}%</span>
                  </div>
                  <ProgressBar
                    value={budgetUsedPct(project)}
                    tone={budgetUsedPct(project) > 90 ? 'warn' : 'navy'}
                    label="Development budget used"
                  />
                  <p className="mt-1.5 text-[12px] text-slate">
                    {currency(financials.developmentSpendToDate)} of {currency(financials.developmentBudget)}
                  </p>
                </div>

                <div>
                  <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                    <span className="text-slate">Capital raised</span>
                    <span className="font-medium text-navy">{Math.round(capitalRaisedPct(project))}%</span>
                  </div>
                  <ProgressBar value={capitalRaisedPct(project)} tone="gold" label="Investor capital raised" />
                  <p className="mt-1.5 text-[12px] text-slate">
                    {currency(financials.investorCapitalRaised)} of {currency(financials.investorCapitalTarget)}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </TabPanel>

      {/* Milestones */}
      <TabPanel id="milestones" active={activeTab}>
        <Card>
          <CardHeader
            title="Milestone tracker"
            description={
              canEdit
                ? 'Set each milestone to not started, in progress or complete. Completing one stamps today’s date.'
                : 'The seven key milestones tracked on every AEG project.'
            }
          />
          <div className="scroll-x">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-ivory/60">
                  {['Milestone', 'Description', 'Target', 'Actual', 'Status'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider text-slate"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {project.milestones.map((milestone) => {
                  const meta = MILESTONE_BY_CODE[milestone.code];
                  return (
                    <tr key={milestone.code} className="border-b border-line-soft last:border-0">
                      <td className="px-4 py-3">
                        <span className="font-mono text-[12px] font-bold text-gold-deep">{milestone.code}</span>
                        <span className="ml-2.5 font-medium text-navy">{meta.name}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-slate">{meta.description}</td>
                      <td className="px-4 py-3 text-[13px] text-navy">{date(milestone.targetDate)}</td>
                      <td className="px-4 py-3 text-[13px]">
                        <span className={milestone.actualDate ? 'text-ok' : 'text-slate-light'}>
                          {date(milestone.actualDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {canEdit ? (
                          <Select
                            value={milestone.status}
                            onChange={(e) => changeMilestone(milestone, e.target.value as MilestoneStatus)}
                            aria-label={`Status for ${milestone.code}`}
                            className="min-w-[140px] py-1 text-[12.5px]"
                          >
                            <option value="not-started">Not started</option>
                            <option value="in-progress">In progress</option>
                            <option value="complete">Complete</option>
                          </Select>
                        ) : (
                          <MilestoneBadge status={milestone.status} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="mt-5">
          <CardHeader title="Timeline" />
          <CardBody>
            <MilestoneTracker milestones={project.milestones} />
          </CardBody>
        </Card>
      </TabPanel>

      {/* Risks */}
      <TabPanel id="risks" active={activeTab}>
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(RISK_CATEGORY_LABELS) as RiskCategory[]).map((category) => {
            const inCategory = risks.filter((r) => r.category === category);
            const open = inCategory.filter((r) => r.status === 'open' || r.status === 'monitoring').length;
            return (
              <StatTile
                key={category}
                label={RISK_CATEGORY_LABELS[category]}
                value={number(inCategory.length)}
                sub={`${open} open or monitoring`}
                tone={open > 0 ? 'alert' : 'default'}
              />
            );
          })}
        </div>

        <Card>
          <CardHeader
            title="Risk register"
            description="Tagged by category, with an owner, a status and a mitigation note."
            action={
              canEdit ? (
                <Button size="sm" variant="secondary" onClick={() => setRiskModal(true)}>
                  <Plus size={15} />
                  Add risk
                </Button>
              ) : null
            }
          />
          <DataTable
            columns={riskColumns}
            rows={risks}
            rowKey={(r) => r.id}
            empty={
              <EmptyState
                icon={<ShieldAlert size={18} />}
                title="No risks on the register"
                description="Add the first risk to start tracking mitigation for this project."
              />
            }
          />
        </Card>

        {risks.length > 0 ? (
          <Card className="mt-5">
            <CardHeader title="Mitigations" description="Internal notes — never shown in the investor portal." />
            <CardBody className="space-y-4 divide-y divide-line-soft">
              {risks.map((risk) => (
                <div key={risk.id} className="pt-4 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-medium text-navy">{risk.title}</p>
                    <RiskStatusBadge status={risk.status} />
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">{risk.mitigation}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        ) : null}
      </TabPanel>

      {/* Feasibility */}
      <TabPanel id="feasibility" active={activeTab}>
        {!feasibility ? (
          <Card>
            <EmptyState
              icon={<FileText size={18} />}
              title="No feasibility on file"
              description="Generate a feasibility report to capture costs, returns, timeline and risk for this project."
              action={
                canAccess(role, 'feasibility') ? (
                  <ButtonLink to="/app/feasibility" variant="secondary">
                    Feasibility library
                  </ButtonLink>
                ) : null
              }
            />
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Cost plan"
                description={`${feasibility.version} · prepared by ${feasibility.preparedBy}`}
                action={<FeasibilityStatusBadge status={feasibility.status} />}
              />
              <CardBody>
                <CostBreakdownChart lines={feasibility.costLines} />
              </CardBody>
            </Card>

            <div className="space-y-5">
              <Card>
                <CardHeader title="Feasibility summary" />
                <CardBody>
                  <dl>
                    <DetailRow label="Total project cost" value={currency(feasibilityTotalCost(feasibility))} />
                    <DetailRow label="Gross realisation" value={currency(feasibility.grossRealisation)} />
                    <DetailRow label="Selling costs" value={percent(feasibility.sellingCostsPct)} />
                    <DetailRow label="Net realisation" value={currency(feasibilityNetRealisation(feasibility))} />
                    <DetailRow label="Development margin" value={percent(feasibilityMarginPct(feasibility))} />
                    <DetailRow label="Target IRR" value={percent(feasibility.targetIrrPct)} />
                    <DetailRow label="Duration" value={`${feasibility.durationMonths} months`} />
                  </dl>
                </CardBody>
              </Card>

              {canAccess(role, 'feasibility') ? (
                <ButtonLink to={`/app/feasibility/${project.id}`} className="w-full">
                  <FileText size={16} />
                  Open full report
                </ButtonLink>
              ) : null}
            </div>

            <Card className="lg:col-span-3">
              <CardHeader title="Risk summary" description="From the feasibility report." />
              <CardBody>
                <p className="text-[14.5px] leading-relaxed text-slate">{feasibility.riskSummary}</p>
              </CardBody>
            </Card>
          </div>
        )}
      </TabPanel>

      {/* Financials */}
      <TabPanel id="financials" active={activeTab}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Cost & revenue" />
            <CardBody>
              <dl>
                <DetailRow label="Land cost" value={currency(financials.landCost)} />
                <DetailRow label="Development budget" value={currency(financials.developmentBudget)} />
                <DetailRow label="Development spend to date" value={currency(financials.developmentSpendToDate)} />
                <DetailRow label="Total project cost" value={currency(totalProjectCost(project))} />
                <DetailRow label="Projected revenue" value={currency(financials.projectedRevenue)} />
                <DetailRow label="Realised revenue" value={currency(financials.realisedRevenue)} />
                <DetailRow
                  label="Projected profit"
                  value={
                    <span className={projectedProfit(project) > 0 ? 'text-ok' : 'text-alert'}>
                      {currency(projectedProfit(project))}
                    </span>
                  }
                />
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Investor capital" />
            <CardBody className="space-y-5">
              <dl>
                <DetailRow label="Capital target" value={currency(financials.investorCapitalTarget)} />
                <DetailRow label="Capital raised" value={currency(financials.investorCapitalRaised)} />
                <DetailRow
                  label="Remaining"
                  value={currency(
                    Math.max(0, financials.investorCapitalTarget - financials.investorCapitalRaised),
                  )}
                />
                <DetailRow label="Target IRR" value={percent(financials.targetIrrPct)} />
              </dl>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                  <span className="text-slate">Budget consumed</span>
                  <span className="font-medium text-navy">{Math.round(budgetUsedPct(project))}%</span>
                </div>
                <ProgressBar
                  value={budgetUsedPct(project)}
                  tone={budgetUsedPct(project) > 90 ? 'warn' : 'navy'}
                  label="Budget consumed"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                  <span className="text-slate">Revenue realised</span>
                  <span className="font-medium text-navy">
                    {Math.round((financials.realisedRevenue / Math.max(1, financials.projectedRevenue)) * 100)}%
                  </span>
                </div>
                <ProgressBar
                  value={(financials.realisedRevenue / Math.max(1, financials.projectedRevenue)) * 100}
                  tone="ok"
                  label="Revenue realised"
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </TabPanel>

      {/* Documents */}
      <TabPanel id="documents" active={activeTab}>
        <Card>
          <CardHeader
            title="Document register"
            description="Files held against this project. Investor-visible documents appear in the portal library."
          />
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
              { key: 'uploaded', header: 'Uploaded', render: (d) => <span className="text-[13px] text-slate">{date(d.uploadedOn)}</span> },
              { key: 'by', header: 'By', render: (d) => <span className="text-[13px] text-slate">{d.uploadedBy}</span> },
              {
                key: 'visibility',
                header: 'Investor visible',
                render: (d) => (d.investorVisible ? <Badge tone="ok">Visible</Badge> : <Badge tone="idle">Internal</Badge>),
              },
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
            empty={
              <EmptyState
                icon={<FileText size={18} />}
                title="No documents yet"
                description="Documents appear here as the project moves through its milestones."
              />
            }
          />
        </Card>
      </TabPanel>

      {/* Investors */}
      {showInvestors ? (
        <TabPanel id="investors" active={activeTab}>
          <Card>
            <CardHeader
              title="Investors exposed to this project"
              description="Through their holdings in the trust or trusts that hold this project."
            />
            <DataTable
              columns={[
                {
                  key: 'investor',
                  header: 'Investor',
                  render: (row) => (
                    <Link
                      to={`/app/investors/${row.investor.id}`}
                      className="font-medium text-navy hover:text-gold-deep hover:underline"
                    >
                      {row.investor.name}
                    </Link>
                  ),
                },
                { key: 'location', header: 'Location', render: (row) => <span className="text-[13px] text-slate">{row.investor.location}</span> },
                {
                  key: 'units',
                  header: 'Units',
                  className: 'text-right font-mono text-[12.5px]',
                  headerClassName: 'text-right',
                  render: (row) => number(row.holding.units),
                },
                {
                  key: 'committed',
                  header: 'Committed',
                  className: 'text-right font-mono text-[12.5px]',
                  headerClassName: 'text-right',
                  render: (row) => currency(row.holding.committed),
                },
                {
                  key: 'distributions',
                  header: 'Distributions',
                  className: 'text-right font-mono text-[12.5px]',
                  headerClassName: 'text-right',
                  render: (row) => currency(row.holding.distributionsPaid),
                },
                { key: 'rm', header: 'Relationship manager', render: (row) => <span className="text-[13px] text-slate">{row.investor.relationshipManager}</span> },
              ]}
              rows={projectInvestors}
              rowKey={(row) => row.holding.id}
              empty={
                <EmptyState
                  title="No investors yet"
                  description="This project is not held inside a unit trust with issued units."
                />
              }
            />
          </Card>
        </TabPanel>
      ) : null}

      {/* Updates */}
      <TabPanel id="updates" active={activeTab}>
        <Card>
          <CardHeader
            title="Project updates"
            description="Reporting posted against this project."
            action={
              canEdit ? (
                <Button size="sm" variant="secondary" onClick={() => setUpdateModal(true)}>
                  <Plus size={15} />
                  Post update
                </Button>
              ) : null
            }
          />
          {updates.length === 0 ? (
            <EmptyState
              icon={<Megaphone size={18} />}
              title="No updates posted"
              description="Post the first update to start the reporting trail for this project."
            />
          ) : (
            <CardBody className="space-y-5 divide-y divide-line-soft">
              {updates.map((update) => (
                <div key={update.id} className="pt-5 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-[15px] font-medium text-navy">{update.title}</h4>
                    <div className="flex items-center gap-2">
                      {update.investorVisible ? (
                        <Badge tone="ok">Investor visible</Badge>
                      ) : (
                        <Badge tone="idle">Internal</Badge>
                      )}
                      <span className="text-[12px] text-slate-light">{date(update.postedOn)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-slate">{update.body}</p>
                  <p className="mt-2 text-[12px] text-slate-light">Posted by {update.postedBy}</p>
                </div>
              ))}
            </CardBody>
          )}
        </Card>
      </TabPanel>

      {/* Add risk */}
      <Modal
        open={riskModal}
        onClose={() => setRiskModal(false)}
        title="Add risk"
        description={`Recorded against ${project.name}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRiskModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="risk-form">
              Add to register
            </Button>
          </>
        }
      >
        <form id="risk-form" onSubmit={submitRisk} className="space-y-4">
          <Field label="Risk title" required htmlFor="r-title">
            <Input
              id="r-title"
              value={riskForm.title}
              onChange={(e) => setRiskForm({ ...riskForm, title: e.target.value })}
              placeholder="e.g. DA determination running past programme"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category" htmlFor="r-category">
              <Select
                id="r-category"
                value={riskForm.category}
                onChange={(e) => setRiskForm({ ...riskForm, category: e.target.value as RiskCategory })}
              >
                {(Object.keys(RISK_CATEGORY_LABELS) as RiskCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {RISK_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Likelihood" htmlFor="r-likelihood">
              <Select
                id="r-likelihood"
                value={riskForm.likelihood}
                onChange={(e) => setRiskForm({ ...riskForm, likelihood: e.target.value as RiskLikelihood })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </Field>
            <Field label="Impact" htmlFor="r-impact">
              <Select
                id="r-impact"
                value={riskForm.impact}
                onChange={(e) => setRiskForm({ ...riskForm, impact: e.target.value as RiskImpact })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </Field>
          </div>

          <Field label="Description" htmlFor="r-description">
            <Textarea
              id="r-description"
              value={riskForm.description}
              onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })}
              rows={3}
            />
          </Field>

          <Field label="Mitigation" htmlFor="r-mitigation" hint="Internal only — not shown to investors.">
            <Textarea
              id="r-mitigation"
              value={riskForm.mitigation}
              onChange={(e) => setRiskForm({ ...riskForm, mitigation: e.target.value })}
              rows={3}
            />
          </Field>

          <Field label="Owner" htmlFor="r-owner">
            <Select
              id="r-owner"
              value={riskForm.owner}
              onChange={(e) => setRiskForm({ ...riskForm, owner: e.target.value })}
            >
              {['Daniel Whitmore', 'Priya Raghavan', 'Marcus Chen', 'Yusuf Al-Rashid', 'Anita Desai'].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Select>
          </Field>
        </form>
      </Modal>

      {/* Post update */}
      <Modal
        open={updateModal}
        onClose={() => setUpdateModal(false)}
        title="Post project update"
        description="Investor-visible updates appear in the portal feed."
        footer={
          <>
            <Button variant="secondary" onClick={() => setUpdateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="update-form">
              Post update
            </Button>
          </>
        }
      >
        <form id="update-form" onSubmit={submitUpdate} className="space-y-4">
          <Field label="Title" required htmlFor="u-title">
            <Input
              id="u-title"
              value={updateForm.title}
              onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
              placeholder="e.g. Civil works progressing on programme"
            />
          </Field>
          <Field label="Update" required htmlFor="u-body">
            <Textarea
              id="u-body"
              value={updateForm.body}
              onChange={(e) => setUpdateForm({ ...updateForm, body: e.target.value })}
              rows={5}
            />
          </Field>
          <Field label="Visibility" htmlFor="u-visibility">
            <Select
              id="u-visibility"
              value={updateForm.investorVisible}
              onChange={(e) => setUpdateForm({ ...updateForm, investorVisible: e.target.value })}
            >
              <option value="yes">Visible to investors</option>
              <option value="no">Internal only</option>
            </Select>
          </Field>
        </form>
      </Modal>
    </div>
  );
}
