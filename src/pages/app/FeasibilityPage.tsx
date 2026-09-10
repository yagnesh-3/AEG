import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2, Search } from 'lucide-react';
import { FeasibilityStatusBadge } from '@/components/StatusBadges';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  StatTile,
  Textarea,
  useToast,
  type Column,
} from '@/components/ui';
import { useData } from '@/store/DataContext';
import { useAuth } from '@/store/AuthContext';
import { currency, currencyCompact, date, number, percent } from '@/lib/format';
import {
  feasibilityMarginPct,
  feasibilityNetRealisation,
  feasibilityTotalCost,
} from '@/lib/project';
import type { Feasibility, FeasibilityStatus } from '@/types';

interface Row {
  feasibility: Feasibility;
  projectName: string;
}

/** The standard AEG feasibility cost template. */
const COST_TEMPLATE = [
  'Land acquisition',
  'Stamp duty & acquisition costs',
  'Civil works & infrastructure',
  'Professional fees & consultants',
  'Council contributions & headworks',
  'Finance & holding costs',
  'Project management',
  'Contingency',
];

export function FeasibilityPage() {
  const { projects, feasibilities, upsertFeasibility } = useData();
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<FeasibilityStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    grossRealisation: '',
    sellingCostsPct: '3.4',
    durationMonths: '30',
    targetIrrPct: '19',
    riskSummary: '',
    costs: Object.fromEntries(COST_TEMPLATE.map((label) => [label, ''])) as Record<string, string>,
  });

  const canCreate = user!.role === 'admin' || user!.role === 'staff';

  const rows = useMemo<Row[]>(
    () =>
      feasibilities
        .map((f) => ({
          feasibility: f,
          projectName: projects.find((p) => p.id === f.projectId)?.name ?? 'Unknown project',
        }))
        .filter((row) => {
          if (status !== 'all' && row.feasibility.status !== status) return false;
          if (query && !row.projectName.toLowerCase().includes(query.toLowerCase())) return false;
          return true;
        })
        .sort((a, b) => a.projectName.localeCompare(b.projectName)),
    [feasibilities, projects, status, query],
  );

  const approved = feasibilities.filter((f) => f.status === 'approved');
  const avgMargin =
    feasibilities.reduce((sum, f) => sum + feasibilityMarginPct(f), 0) / Math.max(1, feasibilities.length);
  const totalRealisation = feasibilities.reduce((sum, f) => sum + f.grossRealisation, 0);

  const columns: Column<Row>[] = [
    {
      key: 'project',
      header: 'Project',
      render: (row) => (
        <div>
          <p className="font-medium text-navy">{row.projectName}</p>
          <p className="mt-0.5 font-mono text-[12px] text-slate">{row.feasibility.version}</p>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <FeasibilityStatusBadge status={row.feasibility.status} /> },
    {
      key: 'cost',
      header: 'Total cost',
      className: 'text-right font-mono text-[12.5px]',
      headerClassName: 'text-right',
      render: (row) => currencyCompact(feasibilityTotalCost(row.feasibility)),
    },
    {
      key: 'realisation',
      header: 'Net realisation',
      className: 'text-right font-mono text-[12.5px]',
      headerClassName: 'text-right',
      render: (row) => currencyCompact(feasibilityNetRealisation(row.feasibility)),
    },
    {
      key: 'margin',
      header: 'Margin',
      className: 'text-right font-mono text-[12.5px]',
      headerClassName: 'text-right',
      render: (row) => {
        const margin = feasibilityMarginPct(row.feasibility);
        return <span className={margin >= 20 ? 'text-ok' : margin >= 12 ? 'text-navy' : 'text-alert'}>{percent(margin)}</span>;
      },
    },
    {
      key: 'irr',
      header: 'Target IRR',
      className: 'text-right font-mono text-[12.5px]',
      headerClassName: 'text-right',
      render: (row) => percent(row.feasibility.targetIrrPct),
    },
    {
      key: 'prepared',
      header: 'Prepared',
      render: (row) => (
        <div className="text-[12.5px] text-slate">
          <p>{row.feasibility.preparedBy}</p>
          <p className="text-slate-light">{date(row.feasibility.preparedOn)}</p>
        </div>
      ),
    },
  ];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.projectId) return;

    const project = projects.find((p) => p.id === form.projectId)!;
    const existing = feasibilities.find((f) => f.projectId === form.projectId);

    const costLines = COST_TEMPLATE.map((label) => ({
      label,
      amount: Number(form.costs[label]) || 0,
    }));

    const feasibility: Feasibility = {
      id: existing?.id ?? `f-${form.projectId}`,
      projectId: form.projectId,
      version: existing ? `v${(parseFloat(existing.version.replace('v', '')) + 0.1).toFixed(1)}` : 'v1.0',
      status: 'draft',
      preparedBy: user!.name,
      preparedOn: new Date().toISOString().slice(0, 10),
      approvedOn: null,
      costLines,
      grossRealisation: Number(form.grossRealisation) || 0,
      sellingCostsPct: Number(form.sellingCostsPct) || 0,
      durationMonths: Number(form.durationMonths) || 0,
      targetMarginPct: 0,
      targetIrrPct: Number(form.targetIrrPct) || 0,
      riskSummary: form.riskSummary.trim() || 'Risk summary to be completed.',
      assumptions: existing?.assumptions ?? [
        'Pricing benchmarked against comparable sales',
        'Costs market-tested with at least two contractors',
        'Finance drawn progressively over the construction period',
      ],
    };

    // Margin is derived so the report always reconciles to its own cost lines.
    const totalCost = costLines.reduce((sum, line) => sum + line.amount, 0);
    const net = feasibility.grossRealisation * (1 - feasibility.sellingCostsPct / 100);
    feasibility.targetMarginPct =
      totalCost > 0 ? Math.round(((net - totalCost) / totalCost) * 1000) / 10 : 0;

    upsertFeasibility(feasibility);
    setModalOpen(false);
    notify(`Feasibility ${feasibility.version} saved for ${project.name}.`);
    navigate(`/app/feasibility/${form.projectId}`);
  };

  const prefill = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      setForm({ ...form, projectId });
      return;
    }
    const budget = project.financials.developmentBudget;
    const shares: Record<string, number> = {
      'Land acquisition': project.financials.landCost,
      'Stamp duty & acquisition costs': Math.round(budget * 0.055),
      'Civil works & infrastructure': Math.round(budget * 0.46),
      'Professional fees & consultants': Math.round(budget * 0.11),
      'Council contributions & headworks': Math.round(budget * 0.14),
      'Finance & holding costs': Math.round(budget * 0.12),
      'Project management': Math.round(budget * 0.045),
      Contingency: Math.round(budget * 0.07),
    };
    setForm({
      ...form,
      projectId,
      grossRealisation: String(project.financials.projectedRevenue),
      targetIrrPct: String(project.financials.targetIrrPct),
      costs: Object.fromEntries(COST_TEMPLATE.map((label) => [label, String(shares[label] ?? 0)])),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 3 — Feasibility"
        title="Feasibility library"
        description="A feasibility report for every project, on the standard AEG template: costs, returns, timelines and risk."
        actions={
          canCreate ? (
            <Button onClick={() => setModalOpen(true)}>
              <FilePlus2 size={16} />
              Generate feasibility
            </Button>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Reports on file" value={number(feasibilities.length)} sub={`across ${projects.length} projects`} />
        <StatTile label="Approved" value={number(approved.length)} sub="signed off by investors" tone="ok" />
        <StatTile label="Average margin" value={percent(avgMargin)} sub="development margin on cost" tone="gold" />
        <StatTile label="Gross realisation" value={currencyCompact(totalRealisation)} sub="forecast across the library" />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by project"
            className="pl-9"
            aria-label="Search feasibility reports"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as FeasibilityStatus | 'all')}
          aria-label="Filter by status"
          className="w-auto min-w-[160px]"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="under-review">Under review</option>
          <option value="approved">Approved</option>
        </Select>
      </div>

      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.feasibility.id}
          onRowClick={(row) => navigate(`/app/feasibility/${row.feasibility.projectId}`)}
          empty={<EmptyState title="No feasibility reports match" description="Try a different search or status." />}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate feasibility report"
        description="Select a project to pre-fill the cost template from its current financials."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="feas-form" disabled={!form.projectId}>
              Save report
            </Button>
          </>
        }
      >
        <form id="feas-form" onSubmit={submit} className="space-y-5">
          <Field label="Project" required htmlFor="f-project">
            <Select id="f-project" value={form.projectId} onChange={(e) => prefill(e.target.value)}>
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>

          <div>
            <p className="mb-3 text-[13px] font-medium text-navy">Cost plan</p>
            <div className="space-y-2.5">
              {COST_TEMPLATE.map((label) => (
                <div key={label} className="flex items-center gap-3">
                  <label htmlFor={`cost-${label}`} className="flex-1 text-[13px] text-slate">
                    {label}
                  </label>
                  <Input
                    id={`cost-${label}`}
                    type="number"
                    min="0"
                    value={form.costs[label] ?? ''}
                    onChange={(e) => setForm({ ...form, costs: { ...form.costs, [label]: e.target.value } })}
                    className="w-40 text-right font-mono text-[13px]"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                <span className="text-[13px] font-semibold text-navy">Total project cost</span>
                <span className="w-40 pr-3 text-right font-mono text-[13.5px] font-semibold text-navy">
                  {currency(
                    COST_TEMPLATE.reduce((sum, label) => sum + (Number(form.costs[label]) || 0), 0),
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Gross realisation" htmlFor="f-gross">
              <Input
                id="f-gross"
                type="number"
                min="0"
                value={form.grossRealisation}
                onChange={(e) => setForm({ ...form, grossRealisation: e.target.value })}
              />
            </Field>
            <Field label="Selling costs (%)" htmlFor="f-selling">
              <Input
                id="f-selling"
                type="number"
                min="0"
                step="0.1"
                value={form.sellingCostsPct}
                onChange={(e) => setForm({ ...form, sellingCostsPct: e.target.value })}
              />
            </Field>
            <Field label="Duration (months)" htmlFor="f-duration">
              <Input
                id="f-duration"
                type="number"
                min="1"
                value={form.durationMonths}
                onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
              />
            </Field>
            <Field label="Target IRR (%)" htmlFor="f-irr">
              <Input
                id="f-irr"
                type="number"
                min="0"
                step="0.1"
                value={form.targetIrrPct}
                onChange={(e) => setForm({ ...form, targetIrrPct: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Risk summary" htmlFor="f-risk">
            <Textarea
              id="f-risk"
              value={form.riskSummary}
              onChange={(e) => setForm({ ...form, riskSummary: e.target.value })}
              rows={4}
              placeholder="Principal risks and how they are being managed…"
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
