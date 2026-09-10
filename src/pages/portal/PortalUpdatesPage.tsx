import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Megaphone } from 'lucide-react';
import { Badge, Card, CardBody, EmptyState, PageHeader, Select } from '@/components/ui';
import { useData, useInvestorProjects } from '@/store/DataContext';
import { useAuth } from '@/store/AuthContext';
import { date } from '@/lib/format';

interface FeedItem {
  id: string;
  kind: 'update' | 'broadcast';
  title: string;
  body: string;
  postedOn: string;
  projectId?: string;
  projectName?: string;
}

export function PortalUpdatesPage() {
  const { user } = useAuth();
  const { projectUpdates, broadcasts } = useData();
  const projects = useInvestorProjects(user!.investorId);
  const [filter, setFilter] = useState('all');

  const projectIds = new Set(projects.map((p) => p.id));

  const feed = useMemo<FeedItem[]>(() => {
    const updates: FeedItem[] = projectUpdates
      .filter((u) => u.investorVisible && projectIds.has(u.projectId))
      .map((u) => ({
        id: u.id,
        kind: 'update',
        title: u.title,
        body: u.body,
        postedOn: u.postedOn,
        projectId: u.projectId,
        projectName: projects.find((p) => p.id === u.projectId)?.name,
      }));

    const casts: FeedItem[] = broadcasts
      .filter(
        (b) =>
          b.channels.includes('portal') &&
          (b.audience === 'all-investors' || (b.projectId && projectIds.has(b.projectId))),
      )
      .map((b) => ({
        id: b.id,
        kind: 'broadcast',
        title: b.subject,
        body: b.body,
        postedOn: b.sentOn,
        projectId: b.projectId,
        projectName: b.projectId ? projects.find((p) => p.id === b.projectId)?.name : undefined,
      }));

    return [...updates, ...casts]
      .filter((item) => {
        if (filter === 'broadcasts') return item.kind === 'broadcast';
        if (filter === 'updates') return item.kind === 'update';
        if (filter !== 'all') return item.projectId === filter;
        return true;
      })
      .sort((a, b) => b.postedOn.localeCompare(a.postedOn));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectUpdates, broadcasts, projects, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Investor portal"
        title="Updates"
        description="Project updates and group-wide broadcasts, newest first."
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter updates" className="w-auto min-w-[170px]">
            <option value="all">Everything</option>
            <option value="updates">Project updates</option>
            <option value="broadcasts">Broadcasts</option>
            <optgroup label="By project">
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </Select>
        }
      />

      {feed.length === 0 ? (
        <Card>
          <EmptyState icon={<Megaphone size={18} />} title="Nothing to show" description="Updates will appear here as they are posted." />
        </Card>
      ) : (
        <ol className="space-y-4">
          {feed.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <Card>
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={
                          item.kind === 'broadcast'
                            ? 'flex size-8 items-center justify-center rounded-lg bg-navy text-gold'
                            : 'flex size-8 items-center justify-center rounded-lg bg-gold-wash text-gold-deep'
                        }
                      >
                        {item.kind === 'broadcast' ? <Mail size={15} /> : <Megaphone size={15} />}
                      </span>
                      <div>
                        <h3 className="text-[16px]">{item.title}</h3>
                        <p className="text-[12px] text-slate-light">
                          {item.kind === 'broadcast' ? 'Broadcast' : 'Project update'} · {date(item.postedOn)}
                        </p>
                      </div>
                    </div>
                    {item.projectName && item.projectId ? (
                      <Link
                        to={`/portal/projects/${item.projectId}`}
                        className="text-[12.5px] font-medium text-gold-deep hover:underline"
                      >
                        {item.projectName}
                      </Link>
                    ) : (
                      <Badge tone="neutral">All investors</Badge>
                    )}
                  </div>
                  <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-slate">{item.body}</p>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
