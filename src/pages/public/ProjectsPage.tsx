import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { Button, EmptyState, Input, Select } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { CATEGORY_LABELS, CATEGORY_ORDER, STATUS_LABELS } from '@/lib/labels';
import type { ProjectCategory, ProjectStatus } from '@/types';

export function ProjectsPage() {
  const { projects } = useData();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const category = (params.get('category') ?? 'all') as ProjectCategory | 'all';
  const status = (params.get('status') ?? 'all') as ProjectStatus | 'all';
  const location = params.get('location') ?? 'all';

  const locations = useMemo(
    () => Array.from(new Set(projects.map((p) => (p.country === 'Australia' ? p.state : p.country)))).sort(),
    [projects],
  );

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (category !== 'all' && p.category !== category) return false;
        if (status !== 'all' && p.status !== status) return false;
        if (location !== 'all' && (p.country === 'Australia' ? p.state : p.country) !== location) return false;
        if (query) {
          const haystack = `${p.name} ${p.location} ${p.state} ${p.summary}`.toLowerCase();
          if (!haystack.includes(query.toLowerCase())) return false;
        }
        return true;
      }),
    [projects, category, status, location, query],
  );

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true });
    setQuery('');
  };

  const hasFilters = category !== 'all' || status !== 'all' || location !== 'all' || query !== '';

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-aeg py-12 md:py-16">
          <p className="eyebrow">Portfolio</p>
          <h1 className="mt-2 text-balance text-[34px] md:text-[44px]">Our projects</h1>
          <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-slate">
            {projects.length} projects across residential, commercial and farming land in Australia,
            with selected holdings in Dubai and India. Each project page shows stage-by-stage
            progress against the AEG milestone framework.
          </p>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-line bg-ivory/94 backdrop-blur-md">
        <div className="container-aeg flex flex-wrap items-center gap-2.5 py-3.5">
          <div className="relative min-w-[180px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects or locations"
              className="pl-9"
              aria-label="Search projects"
            />
          </div>

          <Select
            value={category}
            onChange={(e) => setParam('category', e.target.value)}
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
            onChange={(e) => setParam('status', e.target.value)}
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

          <Select
            value={location}
            onChange={(e) => setParam('location', e.target.value)}
            aria-label="Filter by location"
            className="w-auto min-w-[140px]"
          >
            <option value="all">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>

          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear
            </Button>
          ) : null}
        </div>
      </section>

      <section>
        <div className="container-aeg py-10 md:py-14">
          <p className="mb-6 text-[13px] text-slate">
            Showing <span className="font-semibold text-navy">{filtered.length}</span> of{' '}
            {projects.length} projects
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface">
              <EmptyState
                icon={<SlidersHorizontal size={18} />}
                title="No projects match these filters"
                description="Try widening the category, status or location filter."
                action={
                  <Button variant="secondary" size="sm" onClick={clearAll}>
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} to={`/projects/${project.slug}`} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
