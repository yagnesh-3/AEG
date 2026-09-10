import { useState, type FormEvent } from 'react';
import { CalendarDays, MapPin, Ticket, Users } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Field, Input, Select, useToast } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { launchEvent } from '@/data';
import { RSVP_CHANNEL_LABELS } from '@/lib/labels';
import { number } from '@/lib/format';
import type { EventRsvp, RsvpChannel } from '@/types';

const CHANNEL_OPTIONS: RsvpChannel[] = [
  'email',
  'sms',
  'whatsapp',
  'facebook',
  'instagram',
  'linkedin',
  'paid',
  'seo',
  'direct',
];

/** A deterministic Code-128-looking barcode drawn from the ticket string. */
function Barcode({ code }: { code: string }) {
  const bars = Array.from(code.replace(/-/g, '')).flatMap((char) => {
    const n = char.charCodeAt(0);
    return [1 + (n % 3), 1 + ((n >> 2) % 2), 1 + ((n >> 4) % 3)];
  });

  return (
    <div className="flex h-14 items-end gap-[2px]" role="img" aria-label={`Barcode for ticket ${code}`}>
      {bars.map((width, i) => (
        <span
          key={i}
          className={i % 2 === 0 ? 'bg-navy' : 'bg-transparent'}
          style={{ width: `${width * 2}px`, height: '100%' }}
        />
      ))}
    </div>
  );
}

export function EventPage() {
  const { eventRsvps, addRsvp } = useData();
  const { notify } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', guests: '1', channel: 'direct' as RsvpChannel });
  const [ticket, setTicket] = useState<EventRsvp | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const attending = eventRsvps
    .filter((r) => r.status === 'confirmed' || r.status === 'checked-in')
    .reduce((sum, r) => sum + r.guests, 0);
  const remaining = Math.max(0, launchEvent.capacityMax - attending);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Please enter your name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.phone.trim()) next.phone = 'A contact number is required for event check-in';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const created = addRsvp({
      name: form.name,
      email: form.email,
      phone: form.phone,
      guests: Number(form.guests),
      channel: form.channel,
    });

    setTicket(created);
    notify('RSVP confirmed — your ticket is ready below.');
    setForm({ name: '', email: '', phone: '', guests: '1', channel: 'direct' });
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-navy">
        <div
          className="absolute -left-32 -top-32 size-[30rem] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #B08D46 0%, transparent 70%)' }}
          aria-hidden
        />
        <div className="container-aeg relative py-16 md:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
            You’re invited
          </p>
          <h1 className="mt-4 text-balance text-[36px] leading-tight text-white md:text-[50px]">
            {launchEvent.name}
          </h1>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-white/70">
            {launchEvent.description}
          </p>

          <dl className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: CalendarDays, label: 'When', value: launchEvent.dateLabel },
              { icon: MapPin, label: 'Where', value: `${launchEvent.venue} — ${launchEvent.address}` },
              {
                icon: Users,
                label: 'Capacity',
                value: `${number(launchEvent.capacityMin)}–${number(launchEvent.capacityMax)} guests · ${number(remaining)} places remaining`,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="border-l-2 border-gold/40 pl-4">
                  <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                    <Icon size={13} /> {item.label}
                  </dt>
                  <dd className="mt-2 text-[14px] leading-relaxed text-white/80">{item.value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <section>
        <div className="container-aeg grid gap-8 py-12 md:py-16 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader
                title="RSVP"
                description="Confirm your place and we will issue your ticket with a scannable code."
              />
              <CardBody>
                <form onSubmit={submit} className="space-y-4" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" required htmlFor="rsvp-name" error={errors.name}>
                      <Input
                        id="rsvp-name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </Field>
                    <Field label="Email address" required htmlFor="rsvp-email" error={errors.email}>
                      <Input
                        id="rsvp-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Mobile" required htmlFor="rsvp-phone" error={errors.phone} className="sm:col-span-2">
                      <Input
                        id="rsvp-phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+61 4XX XXX XXX"
                      />
                    </Field>
                    <Field label="Attending" htmlFor="rsvp-guests">
                      <Select
                        id="rsvp-guests"
                        value={form.guests}
                        onChange={(e) => setForm({ ...form, guests: e.target.value })}
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'guest' : 'guests'}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Field label="How did you hear about the launch?" htmlFor="rsvp-channel">
                    <Select
                      id="rsvp-channel"
                      value={form.channel}
                      onChange={(e) => setForm({ ...form, channel: e.target.value as RsvpChannel })}
                    >
                      {CHANNEL_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {RSVP_CHANNEL_LABELS[c]}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <div className="flex justify-end">
                    <Button type="submit" size="lg" variant="gold">
                      Confirm my RSVP
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>

            {ticket ? (
              <Card className="mt-6 border-gold">
                <CardHeader
                  title="Your ticket"
                  description="Present this at the door — the code will be scanned on arrival."
                />
                <CardBody>
                  <div className="rounded-xl border border-dashed border-gold bg-gold-wash/40 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">{launchEvent.name}</p>
                        <p className="mt-2 font-display text-[22px] font-semibold text-navy">{ticket.name}</p>
                        <p className="mt-1 text-[13px] text-slate">
                          {ticket.guests} {ticket.guests === 1 ? 'guest' : 'guests'} · {launchEvent.venue}
                        </p>
                      </div>
                      <Ticket size={26} className="text-gold" />
                    </div>

                    <div className="mt-6 overflow-hidden">
                      <Barcode code={ticket.ticketCode} />
                      <p className="mt-2 font-mono text-[13px] tracking-[0.18em] text-navy">
                        {ticket.ticketCode}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[12px] text-slate-light">
                    A confirmation has also been recorded against your RSVP in the AEG event register.
                  </p>
                </CardBody>
              </Card>
            ) : null}
          </div>

          <div className="space-y-5 lg:col-span-2">
            <Card>
              <CardHeader title="On the night" />
              <CardBody>
                <ol className="space-y-4">
                  {[
                    ['6:30pm', 'Arrival, registration and drinks'],
                    ['7:15pm', 'Welcome and the AEG story'],
                    ['7:35pm', 'Portfolio review — Australia, Dubai and India'],
                    ['8:00pm', 'The investor platform, demonstrated live'],
                    ['8:30pm', 'Q&A with the delivery team'],
                    ['9:00pm', 'Canapés and networking'],
                  ].map(([time, item]) => (
                    <li key={time} className="flex gap-4 border-b border-line-soft pb-4 last:border-0 last:pb-0">
                      <span className="w-16 shrink-0 font-mono text-[12.5px] font-semibold text-gold-deep">
                        {time}
                      </span>
                      <span className="text-[13.5px] text-navy">{item}</span>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>

            <Card className="bg-navy text-white">
              <CardBody>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                  Registrations so far
                </p>
                <p className="mt-3 font-display text-[40px] font-semibold leading-none text-white">
                  {number(attending)}
                </p>
                <p className="mt-2 text-[13.5px] text-white/60">
                  guests confirmed of a {number(launchEvent.capacityMax)} capacity venue
                </p>
                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gold transition-[width] duration-700"
                    style={{ width: `${Math.min(100, (attending / launchEvent.capacityMax) * 100)}%` }}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
