import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileSpreadsheet,
  LineChart,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { ButtonLink, SectionTitle } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/labels';
import { currencyCompact, number } from '@/lib/format';

const STEPS = [
  {
    icon: Building2,
    step: 'Step 01',
    title: 'Projects',
    body: 'Every AEG project sits on one platform — categorised, tracked against milestones M1 to M7, and presented with a full document and financial record.',
  },
  {
    icon: Users,
    step: 'Step 02',
    title: 'Investors',
    body: 'A dedicated investor portal replaces one-to-one email. Investors see project updates, documents and reporting, and raise questions directly.',
  },
  {
    icon: FileSpreadsheet,
    step: 'Step 03',
    title: 'Feasibility',
    body: 'A standard feasibility report is produced for every project, capturing costs, forecast returns, delivery timeline and risk before capital is committed.',
  },
  {
    icon: ShieldCheck,
    step: 'Step 04',
    title: 'Investor Exit',
    body: 'Holdings are structured through an AEG unit trust, with the exit process tracked to completion — valuation, settlement, distribution and sign-off.',
  },
];

export function HomePage() {
  const { projects } = useData();

  const completed = projects.filter((p) => p.status === 'completed');
  const inDevelopment = projects.filter((p) => p.status === 'in-development');
  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const totalLots = projects.reduce((sum, p) => sum + (p.lots ?? 0), 0);
  const capitalDeployed = projects.reduce(
    (sum, p) => sum + p.financials.landCost + p.financials.developmentSpendToDate,
    0,
  );

  const categoryCounts = CATEGORY_ORDER.map((category) => ({
    category,
    count: projects.filter((p) => p.category === category).length,
  })).filter((row) => row.count > 0);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-navy">
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(118deg, rgba(255,255,255,.85) 0 1px, transparent 1px 42px), repeating-linear-gradient(28deg, rgba(255,255,255,.5) 0 1px, transparent 1px 56px)',
          }}
          aria-hidden
        />
        <div
          className="absolute -right-40 -top-40 size-[36rem] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #B08D46 0%, transparent 70%)' }}
          aria-hidden
        />

        <div className="container-aeg relative py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
              Private real estate investment &amp; development
            </p>
            <h1 className="mt-5 text-balance text-[38px] leading-[1.08] text-white md:text-[56px]">
              Land, delivered properly — and reported honestly.
            </h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-white/70 md:text-[17px]">
              Alliance Estate Group sources, develops and manages property projects across
              Australia, Dubai and India, and connects them with private investors. From land
              identification through subdivision registration and settlement, one project manager
              carries the thread — and every investor can see it.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink to="/projects" variant="gold" size="lg">
                View the portfolio
                <ArrowRight size={17} />
              </ButtonLink>
              <ButtonLink
                to="/investors"
                variant="secondary"
                size="lg"
                className="border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
              >
                Invest with AEG
              </ButtonLink>
            </div>
          </div>

          {/* Track record band */}
          <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/12 pt-9 md:grid-cols-4">
            {[
              { value: number(projects.length), label: 'Projects in portfolio' },
              { value: number(completed.length), label: 'Projects delivered' },
              { value: number(totalLots), label: 'Lots under management' },
              { value: currencyCompact(capitalDeployed), label: 'Capital deployed' },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-[32px] font-semibold leading-none text-gold md:text-[40px]">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-[13px] text-white/55">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-line bg-surface">
        <div className="container-aeg py-14 md:py-20">
          <SectionTitle
            eyebrow="The portfolio"
            title="Six categories, one connected record"
            description="AEG holds residential, commercial and farming land across New South Wales and South Australia, alongside selected international holdings in Dubai and India."
          />

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categoryCounts.map(({ category, count }) => (
              <Link
                key={category}
                to={`/projects?category=${category}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-ivory px-5 py-4 transition-colors hover:border-gold hover:bg-gold-wash/40"
              >
                <div>
                  <p className="font-display text-[17px] font-semibold text-navy">
                    {CATEGORY_LABELS[category]}
                  </p>
                  <p className="mt-0.5 text-[13px] text-slate">
                    {count} {count === 1 ? 'project' : 'projects'}
                  </p>
                </div>
                <ArrowRight
                  size={17}
                  className="shrink-0 text-slate-light transition-transform group-hover:translate-x-1 group-hover:text-gold"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="border-b border-line">
        <div className="container-aeg py-14 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle
              eyebrow="Current projects"
              title="Live across the portfolio"
              description={`${inDevelopment.length} projects are currently in development, with stage-by-stage progress visible on every project page.`}
            />
            <ButtonLink to="/projects" variant="secondary">
              All {projects.length} projects
              <ArrowRight size={16} />
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} to={`/projects/${project.slug}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-b border-line bg-surface">
        <div className="container-aeg py-14 md:py-20">
          <SectionTitle
            eyebrow="How AEG works"
            title="Four steps, one connected system"
            description="AEG's operating process runs through four steps. Each is supported end to end by the platform, so nothing is tracked in isolation."
            align="center"
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative rounded-xl border border-line bg-ivory p-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-navy text-gold">
                    <Icon size={19} />
                  </span>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                    {step.step}
                  </p>
                  <h3 className="mt-1.5 text-[19px]">{step.title}</h3>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery flow */}
      <section className="border-b border-line">
        <div className="container-aeg py-14 md:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTitle
                eyebrow="Delivery"
                title="The project manager is the single thread"
                description="Land identification, feasibility, purchase, survey, planning and DA, engineering, council approvals, construction certificate, civil works, subdivision registration, marketing, sales and settlement — no phase is tracked in isolation from the others."
              />
              <ul className="mt-7 space-y-3.5">
                {[
                  {
                    icon: ClipboardCheck,
                    title: 'Seven key milestones, tracked with dates',
                    body: 'M1 Land Settlement through M7 Lots Sold & Settled, each carrying a target and an actual date.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'A risk register on every project',
                    body: 'Approvals, technical, financial and programme risks, each with an owner, a status and a mitigation.',
                  },
                  {
                    icon: LineChart,
                    title: 'Budget against actual, always current',
                    body: 'Variations, contingency drawdown and capital raised, reported through to the investor update.',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="flex gap-3.5">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold-wash text-gold-deep">
                        <Icon size={16} />
                      </span>
                      <div>
                        <p className="text-[14.5px] font-medium text-navy">{item.title}</p>
                        <p className="mt-0.5 text-[13.5px] leading-relaxed text-slate">{item.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-7 shadow-card">
              <p className="eyebrow">Milestone framework</p>
              <ol className="mt-5 space-y-0">
                {[
                  ['M1', 'Land Settlement', 'Purchase completed, site secured'],
                  ['M2', 'Feasibility Sign-off', 'Budget & returns approved by investors'],
                  ['M3', 'DA Approval', 'Council consent granted'],
                  ['M4', 'Construction Certificate', 'Engineering & works approved'],
                  ['M5', 'Civil Works Complete', 'Roads, drainage, services installed'],
                  ['M6', 'Subdivision Registration', 'New titles issued'],
                  ['M7', 'Lots Sold & Settled', 'Sales proceeds realised'],
                ].map(([code, name, description]) => (
                  <li
                    key={code}
                    className="flex items-baseline gap-4 border-b border-line-soft py-3 last:border-0"
                  >
                    <span className="w-7 shrink-0 font-mono text-[12px] font-bold text-gold-deep">{code}</span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-navy">{name}</p>
                      <p className="text-[12.5px] text-slate">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ivory">
        <div className="container-aeg py-16 md:py-20">
          <div className="overflow-hidden rounded-2xl border border-line bg-navy px-7 py-12 md:px-14 md:py-16">
            <div className="max-w-2xl">
              <h2 className="text-balance text-[28px] text-white md:text-[36px]">
                See where your capital is, without sending an email.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-white/65">
                The AEG investor portal gives you project updates, milestone progress, feasibility
                summaries and documents for every project you hold an interest in — and a direct
                channel to the team behind them.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink to="/login" variant="gold" size="lg">
                  Investor login
                </ButtonLink>
                <ButtonLink
                  to="/contact"
                  variant="secondary"
                  size="lg"
                  className="border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
                >
                  Speak with the team
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
