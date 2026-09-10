import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { TrustStatusBadge } from '@/components/StatusBadges';
import {
  Avatar,
  Badge,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DetailRow,
  EmptyState,
  StatTile,
} from '@/components/ui';
import { useData, useInvestorProjects } from '@/store/DataContext';
import { INVESTOR_TYPE_LABELS } from '@/lib/labels';
import { currency, currencyCompact, date, number, percent } from '@/lib/format';
import type { UnitHolding } from '@/types';

export function InvestorRecordPage() {
  const { id } = useParams();
  const { investors, holdings, trusts, enquiries, broadcasts } = useData();
  const investor = investors.find((i) => i.id === id);
  const projects = useInvestorProjects(id);

  if (!investor) {
    return (
      <Card>
        <EmptyState
          title="Investor not found"
          description="This record may have been removed from the register."
          action={
            <ButtonLink to="/app/investors" variant="secondary">
              Investor register
            </ButtonLink>
          }
        />
      </Card>
    );
  }

  const myHoldings = holdings.filter((h) => h.investorId === investor.id);
  const committed = myHoldings.reduce((sum, h) => sum + h.committed, 0);
  const distributions = myHoldings.reduce((sum, h) => sum + h.distributionsPaid, 0);
  const myEnquiries = enquiries.filter((e) => e.investorId === investor.id);
  const relevantBroadcasts = broadcasts.filter(
    (b) => b.audience === 'all-investors' || (b.projectId && projects.some((p) => p.id === b.projectId)),
  );

  return (
    <div className="space-y-6">
      <Link
        to="/app/investors"
        className="inline-flex items-center gap-1.5 text-[13px] text-slate transition-colors hover:text-navy"
      >
        <ArrowLeft size={14} />
        Investor register
      </Link>

      <div className="flex flex-wrap items-start gap-5">
        <Avatar initials={investor.initials} size="lg" tone="gold" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{INVESTOR_TYPE_LABELS[investor.type]}</Badge>
            <Badge tone={investor.status === 'active' ? 'ok' : investor.status === 'prospective' ? 'gold' : 'idle'}>
              {investor.status === 'active' ? 'Active' : investor.status === 'prospective' ? 'Prospective' : 'Exited'}
            </Badge>
          </div>
          <h1 className="mt-2.5 text-[28px]">{investor.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-[13px] text-slate">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={13} className="text-slate-light" />
              {investor.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone size={13} className="text-slate-light" />
              {investor.phone}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-light" />
              {investor.location}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Capital committed" value={currencyCompact(committed)} sub={`across ${myHoldings.length} holdings`} tone="gold" />
        <StatTile label="Distributions received" value={currencyCompact(distributions)} sub={committed > 0 ? `${percent((distributions / committed) * 100)} of capital` : '—'} tone="ok" />
        <StatTile label="Projects" value={number(projects.length)} sub="exposure through unit trusts" />
        <StatTile label="Enquiries" value={number(myEnquiries.length)} sub={`${myEnquiries.filter((e) => e.status !== 'closed').length} open`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Unit holdings" description="Units held in each AEG trust." />
          <DataTable
            columns={[
              {
                key: 'trust',
                header: 'Trust',
                render: (h: UnitHolding) => {
                  const trust = trusts.find((t) => t.id === h.trustId);
                  return (
                    <div>
                      <p className="font-medium text-navy">{trust?.name}</p>
                      <p className="mt-0.5 font-mono text-[12px] text-slate">ABN {trust?.abn}</p>
                    </div>
                  );
                },
              },
              {
                key: 'status',
                header: 'Status',
                render: (h: UnitHolding) => {
                  const trust = trusts.find((t) => t.id === h.trustId);
                  return trust ? <TrustStatusBadge status={trust.status} /> : null;
                },
              },
              {
                key: 'units',
                header: 'Units',
                className: 'text-right font-mono text-[12.5px]',
                headerClassName: 'text-right',
                render: (h: UnitHolding) => number(h.units),
              },
              {
                key: 'committed',
                header: 'Committed',
                className: 'text-right font-mono text-[12.5px]',
                headerClassName: 'text-right',
                render: (h: UnitHolding) => currency(h.committed),
              },
              {
                key: 'distributions',
                header: 'Distributions',
                className: 'text-right font-mono text-[12.5px]',
                headerClassName: 'text-right',
                render: (h: UnitHolding) => currency(h.distributionsPaid),
              },
              {
                key: 'issued',
                header: 'Issued',
                render: (h: UnitHolding) => <span className="text-[12.5px] text-slate">{date(h.issuedOn)}</span>,
              },
            ]}
            rows={myHoldings}
            rowKey={(h) => h.id}
            empty={<EmptyState title="No holdings" description="This investor has not subscribed for units yet." />}
          />
        </Card>

        <Card>
          <CardHeader title="Relationship" />
          <CardBody>
            <dl>
              <DetailRow label="Investor ID" value={<span className="font-mono text-[12.5px]">{investor.id}</span>} />
              <DetailRow label="Type" value={INVESTOR_TYPE_LABELS[investor.type]} />
              <DetailRow label="Joined" value={date(investor.joinedOn)} />
              <DetailRow label="Relationship manager" value={investor.relationshipManager} />
              <DetailRow label="Trusts" value={number(new Set(myHoldings.map((h) => h.trustId)).size)} />
              <DetailRow label="Broadcasts received" value={number(relevantBroadcasts.length)} />
            </dl>
          </CardBody>
        </Card>
      </div>

      {projects.length > 0 ? (
        <div>
          <h2 className="mb-4 text-[20px]">Projects behind these holdings</h2>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} to={`/app/projects/${project.id}`} />
            ))}
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader title="Enquiry history" description="Questions raised by this investor." />
        {myEnquiries.length === 0 ? (
          <EmptyState title="No enquiries" description="This investor has not raised a question through the portal." />
        ) : (
          <CardBody className="space-y-4 divide-y divide-line-soft">
            {myEnquiries.map((enquiry) => (
              <div key={enquiry.id} className="pt-4 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[14px] font-medium text-navy">{enquiry.subject}</p>
                  <Badge tone={enquiry.status === 'new' ? 'alert' : enquiry.status === 'closed' ? 'idle' : 'warn'}>
                    {enquiry.status === 'in-progress' ? 'In progress' : enquiry.status}
                  </Badge>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] text-slate">{enquiry.messages[0]?.body}</p>
                <p className="mt-1.5 text-[12px] text-slate-light">
                  Raised {date(enquiry.raisedOn)} · {enquiry.messages.length} messages
                </p>
              </div>
            ))}
          </CardBody>
        )}
      </Card>
    </div>
  );
}
