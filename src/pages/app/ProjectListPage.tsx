import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Plus, Rows3, Search } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { MilestoneDots } from '@/components/MilestoneTracker';
import { CategoryBadge, ProjectStatusBadge } from '@/components/StatusBadges';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  ProgressBar,
  Select,
  Textarea,
  useToast,
  type Column,
} from '@/components/ui';
import { useData } from '@/store/DataContext';
import { useAuth } from '@/store/AuthContext';
import { CATEGORY_LABELS, CATEGORY_ORDER, LIFECYCLE_LABELS, LIFECYCLE_STAGES, MILESTONES, STATUS_LABELS } from '@/lib/labels';
import { currencyCompact, number, slugify } from '@/lib/format';
import { milestoneProgress } from '@/lib/project';
import type { LifecycleStage, Project, ProjectCategory, ProjectStatus } from '@/types';

const BLANK_FORM = {
  name: '',
  category: 'residential-land' as ProjectCategory,
  status: 'new' as ProjectStatus,
  location: '',
  state: 'NSW',
  country: 'Australia',
  lifecycleStage: 'land-identification' as LifecycleStage,
  projectManager: 'Daniel Whitmore',
  summary: '',
  lots: '',
  areaHectares: '',
  landCost: '',
  developmentBudget: '',
  projectedRevenue: '',
  capitalTarget: '',
  targetIrrPct: '18',
  targetCompletion: '',
};

export function ProjectListPage() {
  const { projects, addProject } = useData();
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [view, setView] = useState<'table' | 'grid'>('table');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ProjectCategory | 'all'>('all');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canCreate = user!.role === 'admin' || user!.role === 'staff';

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (category !== 'all' && p.category !== category) return false;
        if (status !== 'all' && p.status !== status) return false;
        if (query) {
          const haystack = `${p.name} ${p.location} ${p.state} ${p.projectManager}`.toLowerCase();
          if (!haystack.includes(query.toLowerCase())) return false;
        }
        return true;
      }),
    [projects, category, status, query],
  );

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Project',
      render: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{p.name}</p>
          <p className="mt-0.5 text-[12.5px] text-slate">
            {p.location}, {p.country === 'Australia' ? p.state : p.country}
          </p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (p) => <CategoryBadge category={p.category} /> },
    { key: 'status', header: 'Status', render: (p) => <ProjectStatusBadge status={p.status} /> },
    {
      key: 'stage',
      header: 'Stage',
      render: (p) => <span className="text-[13px] text-slate">{LIFECYCLE_LABELS[p.lifecycleStage]}</span>,
    },
    {
      key: 'milestones',
      header: 'M1 – M7',
      render: (p) => (
        <div className="w-28">
          <MilestoneDots milestones={p.milestones} />
          <ProgressBar value={milestoneProgress(p)} tone="gold" className="mt-2" />
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Total cost',
      className: 'text-right font-mono text-[12.5px]',
      headerClassName: 'text-right',
      render: (p) => currencyCompact(p.financials.landCost + p.financials.developmentBudget),
    },
    {
      key: 'pm',
      header: 'Project manager',
      render: (p) => <span className="text-[13px] text-slate">{p.projectManager}</span>,
    },
  ];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'A project name is required';
    if (!form.location.trim()) next.location = 'A location is required';
    if (!form.targetCompletion) next.targetCompletion = 'Set a target completion date';
    if (Number(form.landCost) <= 0) next.landCost = 'Enter the land cost';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const landCost = Number(form.landCost);
    const developmentBudget = Number(form.developmentBudget) || 0;
    const capitalTarget = Number(form.capitalTarget) || 0;

    const project: Project = {
      id: `p-${Date.now()}`,
      slug: slugify(form.name),
      name: form.name.trim(),
      category: form.category,
      status: form.status,
      location: form.location.trim(),
      state: form.state,
      country: form.country,
      summary: form.summary.trim() || `${CATEGORY_LABELS[form.category]} project at ${form.location}.`,
      description: form.summary.trim() || 'Project record created on the platform. Detail to follow.',
      lots: form.lots ? Number(form.lots) : undefined,
      areaHectares: Number(form.areaHectares) || 0,
      startedOn: today,
      targetCompletion: form.targetCompletion,
      lifecycleStage: form.lifecycleStage,
      projectManager: form.projectManager,
      milestones: MILESTONES.map((m, i) => {
        const start = new Date(today).getTime();
        const end = new Date(form.targetCompletion).getTime();
        return {
          code: m.code,
          status: 'not-started' as const,
          targetDate: new Date(start + ((end - start) * (i + 1)) / (MILESTONES.length + 0.35))
            .toISOString()
            .slice(0, 10),
          actualDate: null,
        };
      }),
      financials: {
        landCost,
        developmentBudget,
        developmentSpendToDate: 0,
        projectedRevenue: Number(form.projectedRevenue) || 0,
        realisedRevenue: 0,
        investorCapitalRaised: 0,
        investorCapitalTarget: capitalTarget,
        targetIrrPct: Number(form.targetIrrPct) || 0,
      },
      imageTone: ['#1D3A5F', '#4A76A0'],
      featured: false,
    };

    addProject(project);
    setModalOpen(false);
    setForm(BLANK_FORM);
    notify(`${project.name} added to the project database.`);
    navigate(`/app/projects/${project.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 1 — Projects"
        title="Project database"
        description="Every AEG project on one record: category, status, location, documents, financials, milestones and risk."
        actions={
          canCreate ? (
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              New project
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, location or project manager"
            className="pl-9"
            aria-label="Search projects"
          />
        </div>

        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as ProjectCategory | 'all')}
          aria-label="Filter by category"
          className="w-auto min-w-[170px]"
        >
          <option value="all">All categories</option>
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus | 'all')}
          aria-label="Filter by status"
          className="w-auto min-w-[150px]"
        >
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>

        <div className="flex rounded-lg border border-line bg-white p-0.5">
          <button
            type="button"
            onClick={() => setView('table')}
            className={`rounded-md p-1.5 transition-colors ${view === 'table' ? 'bg-navy text-white' : 'text-slate hover:text-navy'}`}
            aria-label="Table view"
            aria-pressed={view === 'table'}
          >
            <Rows3 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`rounded-md p-1.5 transition-colors ${view === 'grid' ? 'bg-navy text-white' : 'text-slate hover:text-navy'}`}
            aria-label="Card view"
            aria-pressed={view === 'grid'}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <p className="text-[13px] text-slate">
        Showing <span className="font-semibold text-navy">{filtered.length}</span> of {projects.length}{' '}
        projects
      </p>

      {view === 'table' ? (
        <Card>
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(p) => p.id}
            onRowClick={(p) => navigate(`/app/projects/${p.id}`)}
            empty={<EmptyState title="No projects match these filters" description="Try widening the filters." />}
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState title="No projects match these filters" description="Try widening the filters." />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} to={`/app/projects/${project.id}`} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New project"
        description="Creates the project record with an M1–M7 tracker ready to populate."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="new-project-form">
              Create project
            </Button>
          </>
        }
      >
        <form id="new-project-form" onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project name" required htmlFor="p-name" error={errors.name}>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Schofields Rise"
              />
            </Field>
            <Field label="Location" required htmlFor="p-location" error={errors.location}>
              <Input
                id="p-location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Schofields, Sydney"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category" htmlFor="p-category">
              <Select
                id="p-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status" htmlFor="p-status">
              <Select
                id="p-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
              >
                {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Delivery stage" htmlFor="p-stage">
              <Select
                id="p-stage"
                value={form.lifecycleStage}
                onChange={(e) => setForm({ ...form, lifecycleStage: e.target.value as LifecycleStage })}
              >
                {LIFECYCLE_STAGES.map((s) => (
                  <option key={s.stage} value={s.stage}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="State / region" htmlFor="p-state">
              <Input id="p-state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </Field>
            <Field label="Country" htmlFor="p-country">
              <Input
                id="p-country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </Field>
            <Field label="Project manager" htmlFor="p-pm">
              <Select
                id="p-pm"
                value={form.projectManager}
                onChange={(e) => setForm({ ...form, projectManager: e.target.value })}
              >
                {['Daniel Whitmore', 'Priya Raghavan', 'Marcus Chen', 'Yusuf Al-Rashid', 'Anita Desai'].map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Summary" htmlFor="p-summary" hint="One or two sentences for the project card.">
            <Textarea
              id="p-summary"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              rows={2}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Lots" htmlFor="p-lots" hint="Leave blank if not a subdivision">
              <Input
                id="p-lots"
                type="number"
                min="0"
                value={form.lots}
                onChange={(e) => setForm({ ...form, lots: e.target.value })}
              />
            </Field>
            <Field label="Area (hectares)" htmlFor="p-area">
              <Input
                id="p-area"
                type="number"
                min="0"
                step="0.1"
                value={form.areaHectares}
                onChange={(e) => setForm({ ...form, areaHectares: e.target.value })}
              />
            </Field>
            <Field label="Target completion" required htmlFor="p-target" error={errors.targetCompletion}>
              <Input
                id="p-target"
                type="date"
                value={form.targetCompletion}
                onChange={(e) => setForm({ ...form, targetCompletion: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Land cost (AUD)" required htmlFor="p-land" error={errors.landCost}>
              <Input
                id="p-land"
                type="number"
                min="0"
                value={form.landCost}
                onChange={(e) => setForm({ ...form, landCost: e.target.value })}
              />
            </Field>
            <Field label="Development budget" htmlFor="p-budget">
              <Input
                id="p-budget"
                type="number"
                min="0"
                value={form.developmentBudget}
                onChange={(e) => setForm({ ...form, developmentBudget: e.target.value })}
              />
            </Field>
            <Field label="Projected revenue" htmlFor="p-revenue">
              <Input
                id="p-revenue"
                type="number"
                min="0"
                value={form.projectedRevenue}
                onChange={(e) => setForm({ ...form, projectedRevenue: e.target.value })}
              />
            </Field>
            <Field label="Capital target" htmlFor="p-capital">
              <Input
                id="p-capital"
                type="number"
                min="0"
                value={form.capitalTarget}
                onChange={(e) => setForm({ ...form, capitalTarget: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Target IRR (%)" htmlFor="p-irr" className="max-w-[180px]">
            <Input
              id="p-irr"
              type="number"
              min="0"
              step="0.1"
              value={form.targetIrrPct}
              onChange={(e) => setForm({ ...form, targetIrrPct: e.target.value })}
            />
          </Field>

          <p className="text-[12px] text-slate-light">
            Area is recorded in hectares; {number(0)} is accepted for holdings without a measured site.
          </p>
        </form>
      </Modal>
    </div>
  );
}
