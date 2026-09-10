import { Award, Building2, Globe2, HeartHandshake, TrendingUp } from 'lucide-react';
import { ButtonLink, Card, CardBody, SectionTitle } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { CATEGORY_LABELS, RESOURCE_ROLE_FUNCTIONS, RESOURCE_ROLE_LABELS } from '@/lib/labels';
import { currencyCompact, number, percent } from '@/lib/format';
import type { ResourceRole } from '@/types';

const TIMELINE = [
  {
    year: '2019',
    title: 'AEG founded in Norwest, Sydney',
    body: 'Alliance Estate Group is established as a private alliance between developers and investors, with a first residential subdivision secured in Sydney’s north-west.',
  },
  {
    year: '2021',
    title: 'First projects delivered',
    body: 'Munno Para Gardens settles all 38 lots within nine months of registration, returning 24.6% IRR — still AEG’s strongest completed result.',
  },
  {
    year: '2022',
    title: 'Expansion into Adelaide and rural land',
    body: 'The portfolio broadens into South Australian residential land and Riverina farming holdings, with dedicated unit trusts established for each stream.',
  },
  {
    year: '2023',
    title: 'International holdings',
    body: 'Selected acquisitions in Dubai and India add geographic diversity, supported by AEG Middle East and AEG India Services.',
  },
  {
    year: '2025',
    title: 'One connected platform',
    body: 'Project management, investor relations, feasibility reporting and communications are consolidated onto a single platform, with a portal for every investor.',
  },
];

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

export function OurStoryPage() {
  const { projects, investors, resources } = useData();

  const completed = projects.filter((p) => p.status === 'completed');
  const deliveredLots = completed.reduce((sum, p) => sum + (p.lots ?? 0), 0);
  const returnedCapital = completed.reduce((sum, p) => sum + p.financials.realisedRevenue, 0);
  const avgIrr =
    completed.reduce((sum, p) => sum + p.financials.targetIrrPct, 0) / Math.max(1, completed.length);

  const australianLocations = Array.from(
    new Set(projects.filter((p) => p.country === 'Australia').map((p) => p.location.split(', ').pop()!)),
  );
  const categories = Array.from(new Set(projects.map((p) => p.category)));

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-aeg py-14 md:py-20">
          <div className="max-w-3xl">
            <p className="eyebrow">Our story</p>
            <h1 className="mt-3 text-balance text-[34px] leading-tight md:text-[46px]">
              An alliance built around one idea: investors should be able to see the work.
            </h1>
            <p className="mt-6 text-[16px] leading-relaxed text-slate">
              Alliance Estate Group is a private real estate investment and development alliance.
              We source, develop and manage property projects, and connect them with private
              investors who want exposure to Australian land without running the process
              themselves. What sets the alliance apart is not the deals — it is the reporting
              discipline behind them.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-navy">
        <div className="container-aeg py-12 md:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">Track record</p>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4">
            {[
              { value: number(completed.length), label: 'Projects delivered in Australia', icon: Award },
              { value: number(deliveredLots), label: 'Lots delivered and settled', icon: Building2 },
              { value: currencyCompact(returnedCapital), label: 'Realised for investors', icon: TrendingUp },
              { value: percent(avgIrr), label: 'Average IRR on completed projects', icon: HeartHandshake },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label}>
                  <Icon size={18} className="text-gold/70" />
                  <dd className="mt-3 font-display text-[32px] font-semibold leading-none text-white md:text-[38px]">
                    {stat.value}
                  </dd>
                  <dt className="mt-2 text-[13px] leading-snug text-white/55">{stat.label}</dt>
                </div>
              );
            })}
          </dl>

          <div className="mt-12 grid gap-8 border-t border-white/10 pt-9 md:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                <Globe2 size={13} /> Where we deliver
              </p>
              <p className="mt-3.5 text-[14.5px] leading-relaxed text-white/70">
                {australianLocations.slice(0, 12).join(' · ')}
              </p>
              <p className="mt-3 text-[13.5px] text-white/50">
                Plus international holdings in Dubai, Hyderabad and Bengaluru.
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                <Building2 size={13} /> What we hold
              </p>
              <p className="mt-3.5 text-[14.5px] leading-relaxed text-white/70">
                {categories.map((c) => CATEGORY_LABELS[c]).join(' · ')}
              </p>
              <p className="mt-3 text-[13.5px] text-white/50">
                {projects.length} projects and {investors.filter((i) => i.status === 'active').length} active
                investors across the alliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="container-aeg py-14 md:py-20">
          <SectionTitle eyebrow="History" title="How the alliance grew" />

          <ol className="mt-10 space-y-0">
            {TIMELINE.map((item, i) => (
              <li key={item.year} className="relative flex gap-6 pb-9 last:pb-0">
                {i < TIMELINE.length - 1 ? (
                  <span className="absolute left-[31px] top-9 bottom-0 w-px bg-line" aria-hidden />
                ) : null}
                <span className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-display text-[15px] font-semibold text-gold-deep">
                  {item.year}
                </span>
                <div className="pt-3.5">
                  <h3 className="text-[19px]">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-slate">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="container-aeg py-14 md:py-20">
          <SectionTitle
            eyebrow="The team behind delivery"
            title="Every project is supported by the same disciplines"
            description="AEG runs a small in-house team supported by long-standing outsourced partners. The project manager is the single point of contact across all parties."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_ORDER.map((role) => {
              const count = resources.filter((r) => r.role === role).length;
              return (
                <Card key={role} className="bg-ivory">
                  <CardBody>
                    <p className="text-[14.5px] font-semibold text-navy">{RESOURCE_ROLE_LABELS[role]}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate">
                      {RESOURCE_ROLE_FUNCTIONS[role]}
                    </p>
                    <p className="mt-3 text-[12px] text-slate-light">
                      {count} {count === 1 ? 'resource' : 'resources'} on the register
                    </p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="container-aeg py-14 md:py-20">
          <div className="rounded-2xl border border-line bg-gold-wash px-7 py-12 text-center md:px-14">
            <h2 className="text-balance text-[26px] md:text-[32px]">
              Want the detail behind the track record?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate">
              We are glad to walk through completed project outcomes, feasibility assumptions and
              how the unit trust structure works before any capital is committed.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/contact" size="lg">
                Speak with the team
              </ButtonLink>
              <ButtonLink to="/projects" variant="secondary" size="lg">
                View the portfolio
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
