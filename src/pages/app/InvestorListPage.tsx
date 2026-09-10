import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { Badge, Card, DataTable, EmptyState, Input, PageHeader, Select, StatTile, Avatar, type Column } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { INVESTOR_TYPE_LABELS } from '@/lib/labels';
import { currency, currencyCompact, date, number } from '@/lib/format';
import type { Investor, InvestorStatus, InvestorType } from '@/types';

interface Row {
  investor: Investor;
  committed: number;
  distributions: number;
  trustCount: number;
}

export function InvestorListPage() {
  const { investors, holdings, trusts } = useData();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<InvestorStatus | 'all'>('all');
  const [type, setType] = useState<InvestorType | 'all'>('all');

  const rows = useMemo<Row[]>(
    () =>
      investors
        .map((investor) => {
          const mine = holdings.filter((h) => h.investorId === investor.id);
          return {
            investor,
            committed: mine.reduce((sum, h) => sum + h.committed, 0),
            distributions: mine.reduce((sum, h) => sum + h.distributionsPaid, 0),
            trustCount: new Set(mine.map((h) => h.trustId)).size,
          };
        })
        .filter((row) => {
          if (status !== 'all' && row.investor.status !== status) return false;
          if (type !== 'all' && row.investor.type !== type) return false;
          if (query) {
            const haystack = `${row.investor.name} ${row.investor.location} ${row.investor.email}`.toLowerCase();
            if (!haystack.includes(query.toLowerCase())) return false;
          }
          return true;
        })
        .sort((a, b) => b.committed - a.committed),
    [investors, holdings, status, type, query],
  );

  const totalCommitted = holdings.reduce((sum, h) => sum + h.committed, 0);
  const totalDistributed = holdings.reduce((sum, h) => sum + h.distributionsPaid, 0);

  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Investor',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar initials={row.investor.initials} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{row.investor.name}</p>
            <p className="truncate text-[12.5px] text-slate">{row.investor.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (row) => <Badge tone="neutral">{INVESTOR_TYPE_LABELS[row.investor.type]}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.investor.status === 'active' ? 'ok' : row.investor.status === 'prospective' ? 'gold' : 'idle'}>
          {row.investor.status === 'active' ? 'Active' : row.investor.status === 'prospective' ? 'Prospective' : 'Exited'}
        </Badge>
      ),
    },
    { key: 'location', header: 'Location', render: (row) => <span className="text-[13px] text-slate">{row.investor.location}</span> },
    {
      key: 'trusts',
      header: 'Trusts',
      className: 'text-right font-mono text-[12.5px]',
      headerClassName: 'text-right',
      render: (row) => number(row.trustCount),
    },
    {
      key: 'committed',
      header: 'Committed',
      className: 'text-right font-mono text-[12.5px]',
      headerClassName: 'text-right',
      render: (row) => currency(row.committed),
    },
    {
      key: 'distributions',
      header: 'Distributions',
      className: 'text-right font-mono text-[12.5px]',
      headerClassName: 'text-right',
      render: (row) => currency(row.distributions),
    },
    { key: 'rm', header: 'Manager', render: (row) => <span className="text-[13px] text-slate">{row.investor.relationshipManager}</span> },
    { key: 'joined', header: 'Joined', render: (row) => <span className="text-[12.5px] text-slate">{date(row.investor.joinedOn)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 2 — Investors"
        title="Investor register"
        description="Every AEG investor, their holdings across the unit trusts, and the relationship manager who looks after them."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Investors" value={number(investors.length)} sub={`${investors.filter((i) => i.status === 'active').length} active`} />
        <StatTile label="Capital committed" value={currencyCompact(totalCommitted)} sub="across all trusts" tone="gold" />
        <StatTile label="Distributions paid" value={currencyCompact(totalDistributed)} sub="returned to unit holders" tone="ok" />
        <StatTile label="Unit trusts" value={number(trusts.length)} sub={`${trusts.filter((t) => t.status === 'active').length} active`} />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or location"
            className="pl-9"
            aria-label="Search investors"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as InvestorStatus | 'all')}
          aria-label="Filter by status"
          className="w-auto min-w-[150px]"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="prospective">Prospective</option>
          <option value="exited">Exited</option>
        </Select>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as InvestorType | 'all')}
          aria-label="Filter by type"
          className="w-auto min-w-[150px]"
        >
          <option value="all">All types</option>
          {(Object.keys(INVESTOR_TYPE_LABELS) as InvestorType[]).map((t) => (
            <option key={t} value={t}>
              {INVESTOR_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.investor.id}
          onRowClick={(row) => navigate(`/app/investors/${row.investor.id}`)}
          empty={
            <EmptyState icon={<Users size={18} />} title="No investors match" description="Try widening the filters." />
          }
        />
      </Card>
    </div>
  );
}
