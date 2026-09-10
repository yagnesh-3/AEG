import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Search } from 'lucide-react';
import { Badge, Card, DataTable, EmptyState, Input, PageHeader, Select, StatTile, useToast, type Column } from '@/components/ui';
import { useData, useInvestorProjects } from '@/store/DataContext';
import { useAuth } from '@/store/AuthContext';
import { DOCUMENT_KIND_LABELS } from '@/lib/labels';
import { date, number } from '@/lib/format';
import type { DocumentKind, ProjectDocument } from '@/types';

interface Row {
  document: ProjectDocument;
  projectName: string;
  projectId: string;
}

export function PortalDocumentsPage() {
  const { user } = useAuth();
  const { documents } = useData();
  const { notify } = useToast();
  const projects = useInvestorProjects(user!.investorId);

  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState<DocumentKind | 'all'>('all');

  const projectIds = new Set(projects.map((p) => p.id));

  const rows = useMemo<Row[]>(
    () =>
      documents
        .filter((d) => d.investorVisible && projectIds.has(d.projectId))
        .map((d) => ({
          document: d,
          projectName: projects.find((p) => p.id === d.projectId)?.name ?? '',
          projectId: d.projectId,
        }))
        .filter((row) => {
          if (projectFilter !== 'all' && row.projectId !== projectFilter) return false;
          if (kindFilter !== 'all' && row.document.kind !== kindFilter) return false;
          if (query && !row.document.name.toLowerCase().includes(query.toLowerCase())) return false;
          return true;
        })
        .sort((a, b) => b.document.uploadedOn.localeCompare(a.document.uploadedOn)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documents, projects, projectFilter, kindFilter, query],
  );

  const kinds = Array.from(new Set(rows.map((r) => r.document.kind)));

  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Document',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <FileText size={15} className="shrink-0 text-slate-light" />
          <span className="font-medium text-navy">{row.document.name}</span>
        </div>
      ),
    },
    {
      key: 'project',
      header: 'Project',
      render: (row) => (
        <Link to={`/portal/projects/${row.projectId}`} className="text-[13px] text-gold-deep hover:underline">
          {row.projectName}
        </Link>
      ),
    },
    { key: 'kind', header: 'Type', render: (row) => <Badge tone="neutral">{DOCUMENT_KIND_LABELS[row.document.kind]}</Badge> },
    {
      key: 'size',
      header: 'Size',
      className: 'font-mono text-[12.5px]',
      render: (row) => `${number(Math.round(row.document.sizeKb / 100) / 10)} MB`,
    },
    { key: 'added', header: 'Added', render: (row) => <span className="text-[13px] text-slate">{date(row.document.uploadedOn)}</span> },
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Investor portal"
        title="Document library"
        description="Self-serve access to feasibility reports, approvals, registered plans and statements for your projects."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Documents" value={number(rows.length)} sub={`across ${projects.length} projects`} />
        <StatTile label="Feasibility reports" value={number(rows.filter((r) => r.document.kind === 'feasibility').length)} tone="gold" />
        <StatTile label="Approvals" value={number(rows.filter((r) => r.document.kind === 'da-submission').length)} />
        <StatTile label="Statements" value={number(rows.filter((r) => r.document.kind === 'financial').length)} />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents"
            className="pl-9"
            aria-label="Search documents"
          />
        </div>
        <Select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          aria-label="Filter by project"
          className="w-auto min-w-[170px]"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value as DocumentKind | 'all')}
          aria-label="Filter by type"
          className="w-auto min-w-[150px]"
        >
          <option value="all">All types</option>
          {kinds.map((k) => (
            <option key={k} value={k}>
              {DOCUMENT_KIND_LABELS[k]}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.document.id}
          empty={<EmptyState icon={<FileText size={18} />} title="No documents match" description="Try a different search or filter." />}
        />
      </Card>
    </div>
  );
}
