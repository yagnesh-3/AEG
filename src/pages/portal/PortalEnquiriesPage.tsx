import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, Send } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
  useToast,
} from '@/components/ui';
import { useData, useInvestorProjects } from '@/store/DataContext';
import { useAuth } from '@/store/AuthContext';
import { date } from '@/lib/format';
import { cn } from '@/lib/cn';

export function PortalEnquiriesPage() {
  const { user } = useAuth();
  const { enquiries, investors, addEnquiry, projects: allProjects } = useData();
  const projects = useInvestorProjects(user!.investorId);
  const { notify } = useToast();

  const investor = investors.find((i) => i.id === user!.investorId);
  const myEnquiries = enquiries
    .filter((e) => e.investorId === user!.investorId)
    .sort((a, b) => b.raisedOn.localeCompare(a.raisedOn));

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', projectId: '', message: '' });
  const [selectedId, setSelectedId] = useState<string | null>(myEnquiries[0]?.id ?? null);

  const selected = myEnquiries.find((e) => e.id === selectedId) ?? myEnquiries[0];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || form.message.trim().length < 10) {
      notify('Add a subject and a little more detail.', 'info');
      return;
    }
    const id = `e-${Date.now()}`;
    addEnquiry({
      id,
      subject: form.subject.trim(),
      investorId: user!.investorId,
      contactName: investor?.name ?? user!.name,
      contactEmail: investor?.email ?? user!.email,
      projectId: form.projectId || undefined,
      source: 'portal',
      status: 'new',
      raisedOn: new Date().toISOString().slice(0, 10),
      messages: [
        {
          id: `em-${Date.now()}`,
          author: investor?.name ?? user!.name,
          authorRole: 'investor',
          body: form.message.trim(),
          sentOn: new Date().toISOString().slice(0, 10),
        },
      ],
    });
    setModalOpen(false);
    setForm({ subject: '', projectId: '', message: '' });
    setSelectedId(id);
    notify('Your enquiry has been sent to AEG.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Investor portal"
        title="My enquiries"
        description="Raise a question with AEG and follow the thread through to an answer."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            New enquiry
          </Button>
        }
      />

      {myEnquiries.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquare size={18} />}
            title="No enquiries yet"
            description="Raise a question about a project, your holdings or a distribution."
            action={
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
                New enquiry
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader title="Threads" />
              <ul className="max-h-[560px] divide-y divide-line-soft overflow-y-auto">
                {myEnquiries.map((enquiry) => (
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
                        <Badge tone={enquiry.status === 'answered' ? 'ok' : enquiry.status === 'closed' ? 'idle' : 'warn'}>
                          {enquiry.status === 'in-progress' ? 'Open' : enquiry.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11.5px] text-slate-light">
                        {date(enquiry.raisedOn)} · {enquiry.messages.length} messages
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {selected ? (
              <Card>
                <CardHeader
                  title={selected.subject}
                  description={
                    selected.projectId
                      ? `Regarding ${allProjects.find((p) => p.id === selected.projectId)?.name ?? 'a project'}`
                      : 'General enquiry'
                  }
                  action={
                    <Badge tone={selected.status === 'answered' ? 'ok' : selected.status === 'closed' ? 'idle' : 'warn'}>
                      {selected.status === 'in-progress' ? 'Open' : selected.status}
                    </Badge>
                  }
                />
                <CardBody>
                  <ul className="space-y-3">
                    {selected.messages.map((message) => (
                      <li
                        key={message.id}
                        className={cn('flex', message.authorRole === 'investor' ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[85%] rounded-2xl px-4 py-3',
                            message.authorRole === 'investor'
                              ? 'rounded-br-sm bg-navy text-white'
                              : 'rounded-bl-sm bg-ivory text-navy',
                          )}
                        >
                          <p className="text-[13.5px] leading-relaxed">{message.body}</p>
                          <p
                            className={cn(
                              'mt-1.5 text-[11.5px]',
                              message.authorRole === 'investor' ? 'text-white/50' : 'text-slate-light',
                            )}
                          >
                            {message.authorRole === 'aeg' ? `${message.author} · AEG` : message.author} ·{' '}
                            {date(message.sentOn)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {selected.status === 'closed' ? (
                    <p className="mt-5 rounded-lg border border-line bg-ivory px-4 py-3 text-center text-[12.5px] text-slate">
                      This enquiry is closed. Raise a new one if you have a further question.
                    </p>
                  ) : (
                    <p className="mt-5 rounded-lg border border-line bg-ivory px-4 py-3 text-center text-[12.5px] text-slate">
                      AEG has been notified and will respond here. You will see replies in this thread.
                    </p>
                  )}
                </CardBody>
              </Card>
            ) : null}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New enquiry"
        description="Your relationship manager will respond in the thread."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="enquiry-form">
              <Send size={15} />
              Send enquiry
            </Button>
          </>
        }
      >
        <form id="enquiry-form" onSubmit={submit} className="space-y-4">
          <Field label="Subject" required htmlFor="e-subject">
            <Input
              id="e-subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Timing of the next distribution"
            />
          </Field>
          <Field label="Project" htmlFor="e-project" hint="Optional — leave blank for a general enquiry.">
            <Select id="e-project" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">General enquiry</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Your question" required htmlFor="e-message">
            <Textarea
              id="e-message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
            />
          </Field>
        </form>
      </Modal>

      <p className="text-[12px] text-slate-light">
        Prefer email? You can also reach the team at{' '}
        <Link to="/contact" className="text-gold-deep hover:underline">
          allianceestate.com.au/contact
        </Link>
        .
      </p>
    </div>
  );
}
