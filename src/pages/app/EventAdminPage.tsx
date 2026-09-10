import { useMemo, useState } from 'react';
import { CalendarDays, MapPin, Search, Ticket, Users } from 'lucide-react';
import { RsvpStatusBadge } from '@/components/StatusBadges';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DetailRow,
  EmptyState,
  Input,
  PageHeader,
  ProgressBar,
  Select,
  StatTile,
  useToast,
  type Column,
} from '@/components/ui';
import { useData } from '@/store/DataContext';
import { launchEvent } from '@/data';
import { RSVP_CHANNEL_LABELS } from '@/lib/labels';
import { date, number, percent } from '@/lib/format';
import type { EventRsvp, RsvpChannel, RsvpStatus } from '@/types';

export function EventAdminPage() {
  const { eventRsvps, setRsvpStatus } = useData();
  const { notify } = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<RsvpStatus | 'all'>('all');

  const filtered = useMemo(
    () =>
      eventRsvps
        .filter((r) => {
          if (status !== 'all' && r.status !== status) return false;
          if (query) {
            const haystack = `${r.name} ${r.email} ${r.ticketCode}`.toLowerCase();
            if (!haystack.includes(query.toLowerCase())) return false;
          }
          return true;
        })
        .sort((a, b) => b.rsvpOn.localeCompare(a.rsvpOn)),
    [eventRsvps, status, query],
  );

  const confirmed = eventRsvps.filter((r) => r.status === 'confirmed' || r.status === 'checked-in');
  const attending = confirmed.reduce((sum, r) => sum + r.guests, 0);
  const checkedIn = eventRsvps.filter((r) => r.status === 'checked-in').reduce((sum, r) => sum + r.guests, 0);
  const waitlist = eventRsvps.filter((r) => r.status === 'waitlist').length;

  const channelRows = (Object.keys(RSVP_CHANNEL_LABELS) as RsvpChannel[])
    .map((channel) => ({
      channel,
      count: eventRsvps.filter((r) => r.channel === channel).length,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxChannel = Math.max(...channelRows.map((r) => r.count), 1);

  const columns: Column<EventRsvp>[] = [
    {
      key: 'name',
      header: 'Guest',
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-navy">{r.name}</p>
          <p className="truncate text-[12.5px] text-slate">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'ticket',
      header: 'Ticket',
      render: (r) => <span className="font-mono text-[12px] text-navy">{r.ticketCode}</span>,
    },
    {
      key: 'guests',
      header: 'Guests',
      className: 'text-right font-mono text-[12.5px]',
      headerClassName: 'text-right',
      render: (r) => number(r.guests),
    },
    { key: 'channel', header: 'Source', render: (r) => <Badge tone="neutral">{RSVP_CHANNEL_LABELS[r.channel]}</Badge> },
    {
      key: 'investor',
      header: 'Type',
      render: (r) => (r.investorId ? <Badge tone="gold">Investor</Badge> : <Badge tone="idle">Public</Badge>),
    },
    { key: 'rsvp', header: 'RSVP', render: (r) => <span className="text-[12.5px] text-slate">{date(r.rsvpOn)}</span> },
    { key: 'status', header: 'Status', render: (r) => <RsvpStatusBadge status={r.status} /> },
    {
      key: 'action',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (r) =>
        r.status === 'checked-in' ? (
          <span className="text-[12px] text-ok">Checked in</span>
        ) : r.status === 'confirmed' ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setRsvpStatus(r.id, 'checked-in');
              notify(`${r.name} checked in.`);
            }}
          >
            Check in
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Launch event"
        title={launchEvent.name}
        description="RSVP tracking, ticketing and channel attribution for the AEG brand launch."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Guests confirmed"
          value={number(attending)}
          sub={`target ${number(launchEvent.capacityMin)}–${number(launchEvent.capacityMax)}`}
          icon={<Users size={16} />}
          tone={attending >= launchEvent.capacityMin ? 'ok' : 'gold'}
        />
        <StatTile label="RSVPs received" value={number(eventRsvps.length)} sub={`${waitlist} on the waitlist`} icon={<Ticket size={16} />} />
        <StatTile label="Checked in" value={number(checkedIn)} sub="on the night" />
        <StatTile
          label="Capacity used"
          value={percent((attending / launchEvent.capacityMax) * 100, 0)}
          sub={`${number(Math.max(0, launchEvent.capacityMax - attending))} places remaining`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Event detail" />
          <CardBody>
            <dl>
              <DetailRow label="Timing" value={<span className="text-right">{launchEvent.dateLabel}</span>} />
              <DetailRow label="Venue" value={launchEvent.venue} />
              <DetailRow label="Address" value={<span className="text-right">{launchEvent.address}</span>} />
              <DetailRow label="Capacity" value={`${number(launchEvent.capacityMin)}–${number(launchEvent.capacityMax)}`} />
            </dl>
            <div className="mt-4 flex gap-2 text-[12.5px] text-slate">
              <CalendarDays size={14} className="mt-0.5 shrink-0 text-gold" />
              <p>Date to be confirmed — venue shortlisting continues in the Norwest area.</p>
            </div>
            <div className="mt-2 flex gap-2 text-[12.5px] text-slate">
              <MapPin size={14} className="mt-0.5 shrink-0 text-gold" />
              <p>Organiser WhatsApp group covers the internal team and external helpers.</p>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Promotion channels" description="Where RSVPs are coming from." />
          <CardBody className="space-y-3">
            {channelRows.map((row) => (
              <div key={row.channel}>
                <div className="mb-1 flex items-baseline justify-between text-[13px]">
                  <span className="text-navy">{RSVP_CHANNEL_LABELS[row.channel]}</span>
                  <span className="font-mono text-[12.5px] text-slate">
                    {number(row.count)} · {percent((row.count / eventRsvps.length) * 100, 0)}
                  </span>
                </div>
                <ProgressBar
                  value={(row.count / maxChannel) * 100}
                  tone="gold"
                  label={`${RSVP_CHANNEL_LABELS[row.channel]} RSVPs`}
                />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or ticket code"
            className="pl-9"
            aria-label="Search RSVPs"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as RsvpStatus | 'all')}
          aria-label="Filter by status"
          className="w-auto min-w-[160px]"
        >
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked in</option>
          <option value="waitlist">Waitlist</option>
          <option value="declined">Declined</option>
        </Select>
      </div>

      <Card>
        <CardHeader title="RSVP register" description={`${filtered.length} of ${eventRsvps.length} RSVPs`} />
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.id}
          empty={<EmptyState icon={<Ticket size={18} />} title="No RSVPs match" description="Try a different search or status." />}
        />
      </Card>
    </div>
  );
}
