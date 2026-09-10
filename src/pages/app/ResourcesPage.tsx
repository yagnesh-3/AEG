import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, MapPin, Phone, Search } from 'lucide-react';
import { Avatar, Badge, Card, CardBody, CardHeader, EmptyState, Input, PageHeader, Select, StatTile } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { RESOURCE_ROLE_FUNCTIONS, RESOURCE_ROLE_LABELS, ROLE_LABELS } from '@/lib/labels';
import { number } from '@/lib/format';
import type { ResourceEngagement, ResourceRole } from '@/types';

const ROLE_ORDER: ResourceRole[] = [
  'project-manager',
  'legal',
  'accountant',
  'contractor-civil',
  'contractor-survey',
  'contractor-engineering',
  'india-admin',
  'banker',
];

export function ResourcesPage() {
  const { resources, projects } = useData();
  const [query, setQuery] = useState('');
  const [engagement, setEngagement] = useState<ResourceEngagement | 'all'>('all');

  const filtered = useMemo(
    () =>
      resources.filter((r) => {
        if (engagement !== 'all' && r.engagement !== engagement) return false;
        if (query) {
          const haystack = `${r.name} ${r.organisation} ${r.location} ${RESOURCE_ROLE_LABELS[r.role]}`.toLowerCase();
          if (!haystack.includes(query.toLowerCase())) return false;
        }
        return true;
      }),
    [resources, engagement, query],
  );

  const grouped = ROLE_ORDER.map((role) => ({
    role,
    people: filtered.filter((r) => r.role === role),
  })).filter((group) => group.people.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People & outsourced resources"
        title="Resource directory"
        description="The roles that support every AEG project, with the platform access each one holds."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Resources" value={number(resources.length)} sub={`across ${ROLE_ORDER.length} role types`} />
        <StatTile label="In-house" value={number(resources.filter((r) => r.engagement === 'in-house').length)} sub="AEG staff" />
        <StatTile label="Outsourced" value={number(resources.filter((r) => r.engagement === 'outsourced').length)} sub="external contractors and advisers" tone="gold" />
        <StatTile label="Partners" value={number(resources.filter((r) => r.engagement === 'partner').length)} sub="offshore teams and banking" />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, organisation or role"
            className="pl-9"
            aria-label="Search resources"
          />
        </div>
        <Select
          value={engagement}
          onChange={(e) => setEngagement(e.target.value as ResourceEngagement | 'all')}
          aria-label="Filter by engagement"
          className="w-auto min-w-[170px]"
        >
          <option value="all">All engagements</option>
          <option value="in-house">In-house</option>
          <option value="outsourced">Outsourced</option>
          <option value="partner">Partner</option>
        </Select>
      </div>

      {grouped.length === 0 ? (
        <Card>
          <EmptyState icon={<Building2 size={18} />} title="No resources match" description="Try a different search or filter." />
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ role, people }) => (
            <Card key={role}>
              <CardHeader title={RESOURCE_ROLE_LABELS[role]} description={RESOURCE_ROLE_FUNCTIONS[role]} />
              <CardBody className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {people.map((resource) => (
                  <div key={resource.id} className="rounded-xl border border-line bg-ivory p-4">
                    <div className="flex items-start gap-3">
                      <Avatar initials={resource.initials} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-medium text-navy">{resource.name}</p>
                        <p className="truncate text-[12.5px] text-slate">{resource.organisation}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-[12.5px] text-slate">
                      <p className="flex items-center gap-2">
                        <Mail size={12} className="shrink-0 text-slate-light" />
                        <span className="truncate">{resource.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone size={12} className="shrink-0 text-slate-light" />
                        {resource.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={12} className="shrink-0 text-slate-light" />
                        {resource.location}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
                      <Badge tone={resource.engagement === 'in-house' ? 'navy' : resource.engagement === 'partner' ? 'gold' : 'neutral'}>
                        {resource.engagement === 'in-house'
                          ? 'In-house'
                          : resource.engagement === 'partner'
                            ? 'Partner'
                            : 'Outsourced'}
                      </Badge>
                      <Badge tone={resource.accessLevel === 'none' ? 'idle' : 'ok'}>
                        {resource.accessLevel === 'none' ? 'No platform access' : ROLE_LABELS[resource.accessLevel]}
                      </Badge>
                    </div>

                    {resource.projectIds.length > 0 ? (
                      <div className="mt-3">
                        <p className="text-[11.5px] uppercase tracking-wide text-slate-light">
                          Assigned projects ({resource.projectIds.length})
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {resource.projectIds.slice(0, 3).map((pid) => {
                            const project = projects.find((p) => p.id === pid);
                            return project ? (
                              <Link
                                key={pid}
                                to={`/app/projects/${pid}`}
                                className="rounded border border-line bg-white px-1.5 py-0.5 text-[11px] text-navy transition-colors hover:border-gold"
                              >
                                {project.name}
                              </Link>
                            ) : null;
                          })}
                          {resource.projectIds.length > 3 ? (
                            <span className="px-1 py-0.5 text-[11px] text-slate-light">
                              +{resource.projectIds.length - 3} more
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
