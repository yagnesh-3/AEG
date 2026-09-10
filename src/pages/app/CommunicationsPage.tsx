import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Mail, MessageSquare, Send, Smartphone } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  StatTile,
  Tabs,
  TabPanel,
  Textarea,
  useToast,
} from '@/components/ui';
import { useData } from '@/store/DataContext';
import { useAuth } from '@/store/AuthContext';
import { BROADCAST_AUDIENCE_LABELS } from '@/lib/labels';
import { date, number, percent, relative } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { BroadcastAudience, BroadcastChannel, EnquiryStatus } from '@/types';

const CHANNEL_ICONS: Record<BroadcastChannel, typeof Mail> = {
  email: Mail,
  sms: Smartphone,
  portal: MessageSquare,
};

export function CommunicationsPage() {
  const { broadcasts, enquiries, investors, projects, addBroadcast, replyToEnquiry, setEnquiryStatus } = useData();
  const { user } = useAuth();
  const { notify } = useToast();

  const [tab, setTab] = useState('inbox');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'open'>('open');
  const [selectedId, setSelectedId] = useState<string | null>(enquiries[0]?.id ?? null);
  const [reply, setReply] = useState('');

  const [form, setForm] = useState({
    subject: '',
    body: '',
    audience: 'all-investors' as BroadcastAudience,
    projectId: '',
    channels: { email: true, sms: false, portal: true } as Record<BroadcastChannel, boolean>,
  });

  const filteredEnquiries = enquiries
    .filter((e) =>
      statusFilter === 'open' ? e.status === 'new' || e.status === 'in-progress' : e.status === statusFilter,
    )
    .sort((a, b) => b.raisedOn.localeCompare(a.raisedOn));

  const selected = enquiries.find((e) => e.id === selectedId) ?? filteredEnquiries[0];

  const sendReply = (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    replyToEnquiry(selected.id, reply.trim(), user!.name);
    setReply('');
    notify('Reply sent to the investor.');
  };

  const sendBroadcast = (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.body.trim()) return;

    const channels = (Object.keys(form.channels) as BroadcastChannel[]).filter((c) => form.channels[c]);
    if (channels.length === 0) {
      notify('Select at least one channel.', 'info');
      return;
    }

    const recipientCount =
      form.audience === 'prospective'
        ? investors.filter((i) => i.status === 'prospective').length
        : investors.filter((i) => i.status === 'active').length;

    addBroadcast({
      id: `b-${Date.now()}`,
      subject: form.subject.trim(),
      body: form.body.trim(),
      audience: form.audience,
      projectId: form.audience === 'project-investors' ? form.projectId || undefined : undefined,
      channels,
      sentOn: new Date().toISOString().slice(0, 10),
      sentBy: user!.name,
      recipientCount,
      openRatePct: 0,
    });

    setForm({ ...form, subject: '', body: '' });
    notify(`Broadcast queued to ${recipientCount} recipients.`);
    setTab('broadcasts');
  };

  const openCount = enquiries.filter((e) => e.status === 'new' || e.status === 'in-progress').length;
  const avgOpenRate =
    broadcasts.filter((b) => b.openRatePct > 0).reduce((sum, b) => sum + b.openRatePct, 0) /
    Math.max(1, broadcasts.filter((b) => b.openRatePct > 0).length);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Investor relations"
        title="Communications"
        description="Group-wide broadcasts, and the enquiry channel investors use to reach AEG."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Open enquiries" value={number(openCount)} sub={`${enquiries.length} total on file`} tone={openCount > 0 ? 'alert' : 'default'} />
        <StatTile label="Broadcasts sent" value={number(broadcasts.length)} sub="across email, SMS and portal" />
        <StatTile label="Average open rate" value={percent(avgOpenRate)} sub="on measured broadcasts" tone="gold" />
        <StatTile label="Audience" value={number(investors.filter((i) => i.status === 'active').length)} sub="active investors reachable" />
      </div>

      <Tabs
        tabs={[
          { id: 'inbox', label: 'Enquiry inbox', count: openCount },
          { id: 'compose', label: 'Compose broadcast' },
          { id: 'broadcasts', label: 'Sent', count: broadcasts.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <TabPanel id="inbox" active={tab}>
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Enquiries"
                action={
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as EnquiryStatus | 'open')}
                    aria-label="Filter enquiries"
                    className="min-w-[130px] py-1 text-[12.5px]"
                  >
                    <option value="open">Open</option>
                    <option value="new">New</option>
                    <option value="in-progress">In progress</option>
                    <option value="answered">Answered</option>
                    <option value="closed">Closed</option>
                  </Select>
                }
              />
              {filteredEnquiries.length === 0 ? (
                <EmptyState icon={<Inbox size={18} />} title="Nothing here" description="No enquiries with this status." />
              ) : (
                <ul className="max-h-[560px] divide-y divide-line-soft overflow-y-auto">
                  {filteredEnquiries.map((enquiry) => (
                    <li key={enquiry.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(enquiry.id)}
                        className={cn(
                          'w-full px-4 py-3.5 text-left transition-colors',
                          selected?.id === enquiry.id ? 'bg-gold-wash/60' : 'hover:bg-line-soft/60',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[13.5px] font-medium text-navy">{enquiry.subject}</p>
                          <Badge tone={enquiry.status === 'new' ? 'alert' : enquiry.status === 'closed' ? 'idle' : 'warn'}>
                            {enquiry.status === 'in-progress' ? 'Open' : enquiry.status}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-[12.5px] text-slate">{enquiry.contactName}</p>
                        <p className="mt-1 text-[11.5px] text-slate-light">
                          {relative(enquiry.raisedOn)} · {enquiry.messages.length} messages
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="lg:col-span-3">
            {selected ? (
              <Card>
                <CardHeader
                  title={selected.subject}
                  description={`${selected.contactName} · ${selected.contactEmail} · via ${selected.source === 'ai-assistant' ? 'AI assistant' : selected.source}`}
                  action={
                    <Select
                      value={selected.status}
                      onChange={(e) => {
                        setEnquiryStatus(selected.id, e.target.value as EnquiryStatus);
                        notify('Enquiry status updated.');
                      }}
                      aria-label="Enquiry status"
                      className="min-w-[140px] py-1 text-[12.5px]"
                    >
                      <option value="new">New</option>
                      <option value="in-progress">In progress</option>
                      <option value="answered">Answered</option>
                      <option value="closed">Closed</option>
                    </Select>
                  }
                />
                <CardBody>
                  {selected.projectId ? (
                    <p className="mb-4 text-[13px] text-slate">
                      Regarding{' '}
                      <Link
                        to={`/app/projects/${selected.projectId}`}
                        className="font-medium text-gold-deep hover:underline"
                      >
                        {projects.find((p) => p.id === selected.projectId)?.name}
                      </Link>
                    </p>
                  ) : null}

                  <ul className="space-y-3">
                    {selected.messages.map((message) => (
                      <li
                        key={message.id}
                        className={cn('flex', message.authorRole === 'aeg' ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[85%] rounded-2xl px-4 py-3',
                            message.authorRole === 'aeg'
                              ? 'rounded-br-sm bg-navy text-white'
                              : 'rounded-bl-sm bg-ivory text-navy',
                          )}
                        >
                          <p className="text-[13.5px] leading-relaxed">{message.body}</p>
                          <p
                            className={cn(
                              'mt-1.5 text-[11.5px]',
                              message.authorRole === 'aeg' ? 'text-white/50' : 'text-slate-light',
                            )}
                          >
                            {message.author} · {date(message.sentOn)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <form onSubmit={sendReply} className="mt-5 border-t border-line pt-5">
                    <Field label="Reply" htmlFor="reply">
                      <Textarea
                        id="reply"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={4}
                        placeholder="Write your response…"
                      />
                    </Field>
                    <div className="mt-3 flex justify-end">
                      <Button type="submit" disabled={!reply.trim()}>
                        <Send size={15} />
                        Send reply
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            ) : (
              <Card>
                <EmptyState icon={<Inbox size={18} />} title="Select an enquiry" description="Choose a thread to read and reply." />
              </Card>
            )}
          </div>
        </div>
      </TabPanel>

      <TabPanel id="compose" active={tab}>
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Compose broadcast" description="Group-wide updates, newsletters and project milestones." />
            <CardBody>
              <form onSubmit={sendBroadcast} className="space-y-4">
                <Field label="Subject" required htmlFor="b-subject">
                  <Input
                    id="b-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Q4 portfolio update"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Audience" htmlFor="b-audience">
                    <Select
                      id="b-audience"
                      value={form.audience}
                      onChange={(e) => setForm({ ...form, audience: e.target.value as BroadcastAudience })}
                    >
                      {(Object.keys(BROADCAST_AUDIENCE_LABELS) as BroadcastAudience[]).map((a) => (
                        <option key={a} value={a}>
                          {BROADCAST_AUDIENCE_LABELS[a]}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  {form.audience === 'project-investors' ? (
                    <Field label="Project" htmlFor="b-project">
                      <Select
                        id="b-project"
                        value={form.projectId}
                        onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                      >
                        <option value="">Select a project…</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  ) : null}
                </div>

                <Field label="Channels">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(CHANNEL_ICONS) as BroadcastChannel[]).map((channel) => {
                      const Icon = CHANNEL_ICONS[channel];
                      const on = form.channels[channel];
                      return (
                        <button
                          key={channel}
                          type="button"
                          onClick={() => setForm({ ...form, channels: { ...form.channels, [channel]: !on } })}
                          aria-pressed={on}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors',
                            on ? 'border-gold bg-gold-wash text-gold-deep' : 'border-line bg-white text-slate hover:border-navy-mist',
                          )}
                        >
                          <Icon size={15} />
                          {channel === 'sms' ? 'SMS' : channel === 'email' ? 'Email' : 'Portal'}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Message" required htmlFor="b-body">
                  <Textarea
                    id="b-body"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    rows={10}
                    placeholder="Dear investors,&#10;&#10;…"
                  />
                </Field>

                <div className="flex justify-end">
                  <Button type="submit">
                    <Send size={15} />
                    Send broadcast
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Reach" description="Who this broadcast will go to." />
            <CardBody className="space-y-4">
              <div className="rounded-lg border border-line bg-ivory p-4">
                <p className="text-[12px] uppercase tracking-wide text-slate">Recipients</p>
                <p className="mt-1.5 font-display text-[30px] font-semibold text-navy">
                  {number(
                    form.audience === 'prospective'
                      ? investors.filter((i) => i.status === 'prospective').length
                      : investors.filter((i) => i.status === 'active').length,
                  )}
                </p>
                <p className="mt-1 text-[12.5px] text-slate">{BROADCAST_AUDIENCE_LABELS[form.audience]}</p>
              </div>

              <p className="text-[12.5px] leading-relaxed text-slate">
                Broadcasts replace one-to-one investor emails. Anything sent to the portal channel
                also appears in each investor’s updates feed.
              </p>

              <p className="text-[11.5px] leading-relaxed text-slate-light">
                This is a demonstration environment — no email or SMS is actually dispatched.
              </p>
            </CardBody>
          </Card>
        </div>
      </TabPanel>

      <TabPanel id="broadcasts" active={tab}>
        <div className="space-y-4">
          {broadcasts.map((broadcast) => (
            <Card key={broadcast.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[16px]">{broadcast.subject}</h3>
                    <p className="mt-1 text-[12.5px] text-slate">
                      {BROADCAST_AUDIENCE_LABELS[broadcast.audience]}
                      {broadcast.projectId
                        ? ` · ${projects.find((p) => p.id === broadcast.projectId)?.name}`
                        : ''}{' '}
                      · sent {date(broadcast.sentOn)} by {broadcast.sentBy}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {broadcast.channels.map((channel) => {
                      const Icon = CHANNEL_ICONS[channel];
                      return (
                        <Badge key={channel} tone="neutral">
                          <Icon size={11} />
                          {channel === 'sms' ? 'SMS' : channel === 'email' ? 'Email' : 'Portal'}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-3 line-clamp-3 whitespace-pre-line text-[13.5px] leading-relaxed text-slate">
                  {broadcast.body}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 border-t border-line-soft pt-3 text-[12.5px] text-slate">
                  <span>
                    Recipients <span className="font-medium text-navy">{number(broadcast.recipientCount)}</span>
                  </span>
                  <span>
                    Open rate{' '}
                    <span className="font-medium text-navy">
                      {broadcast.openRatePct > 0 ? percent(broadcast.openRatePct) : 'Pending'}
                    </span>
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </TabPanel>
    </div>
  );
}
