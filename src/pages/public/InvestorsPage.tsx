import { Check, FileSpreadsheet, LockKeyhole, MessagesSquare, PieChart, Wallet } from 'lucide-react';
import { ButtonLink, Card, CardBody, SectionTitle } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { currencyCompact, percent } from '@/lib/format';

const PORTAL_FEATURES = [
  {
    icon: PieChart,
    title: 'Your portfolio at a glance',
    body: 'Committed capital, distributions received and unit holdings across every AEG trust you participate in.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Self-serve documents',
    body: 'Feasibility reports, notices of determination, registered plans and settlement statements — filed by project.',
  },
  {
    icon: MessagesSquare,
    title: 'A direct enquiry channel',
    body: 'Raise a question against a project and see the thread through to an answer, rather than chasing an inbox.',
  },
  {
    icon: LockKeyhole,
    title: 'Role-based access',
    body: 'You see your own holdings and the projects behind them. Internal cost detail and the risk register stay internal.',
  },
];

const PROCESS = [
  {
    step: '01',
    title: 'Introduction',
    body: 'A relationship manager walks through the current raises, the structure and the reporting you will receive.',
  },
  {
    step: '02',
    title: 'Feasibility review',
    body: 'You receive the feasibility report for the project — costs, forecast returns, delivery timeline and risk — before committing.',
  },
  {
    step: '03',
    title: 'Unit subscription',
    body: 'Capital is committed by subscribing for units in the project’s unit trust. Units are issued at $1,000 each.',
  },
  {
    step: '04',
    title: 'Reporting through delivery',
    body: 'Milestone progress, project updates and documents flow into your portal for the life of the project.',
  },
  {
    step: '05',
    title: 'Exit and distribution',
    body: 'On completion, the exit process runs through valuation, settlement, distribution and sign-off — each stage tracked and visible.',
  },
];

export function InvestorsPage() {
  const { projects, trusts, holdings } = useData();

  const openProjects = projects.filter(
    (p) => p.financials.investorCapitalRaised < p.financials.investorCapitalTarget,
  );
  const capacity = openProjects.reduce(
    (sum, p) => sum + (p.financials.investorCapitalTarget - p.financials.investorCapitalRaised),
    0,
  );
  const avgIrr =
    projects.reduce((sum, p) => sum + p.financials.targetIrrPct, 0) / Math.max(1, projects.length);
  const totalCommitted = holdings.reduce((sum, h) => sum + h.committed, 0);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-aeg grid gap-10 py-14 md:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">For investors</p>
            <h1 className="mt-3 text-balance text-[34px] leading-tight md:text-[44px]">
              Exposure to Australian land, without running the project yourself.
            </h1>
            <p className="mt-6 text-[15.5px] leading-relaxed text-slate">
              AEG investors participate through a unit trust structure, with a feasibility report
              provided before any capital is committed and stage-by-stage reporting for the life of
              the project. You hold units; we run the delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/contact" size="lg">
                Request an introduction
              </ButtonLink>
              <ButtonLink to="/login" variant="secondary" size="lg">
                Investor login
              </ButtonLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: percent(avgIrr), label: 'Average target IRR across the portfolio' },
              { value: `${trusts.filter((t) => t.status !== 'closed').length}`, label: 'Active unit trusts' },
              { value: currencyCompact(totalCommitted), label: 'Capital committed by investors' },
              { value: currencyCompact(capacity), label: 'Capacity in current raises' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-line bg-ivory p-5">
                <p className="font-display text-[28px] font-semibold leading-none text-navy">{stat.value}</p>
                <p className="mt-2.5 text-[12.5px] leading-snug text-slate">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="container-aeg py-14 md:py-20">
          <SectionTitle
            eyebrow="The portal"
            title="Reporting you can check yourself"
            description="Rather than communicating with each investor individually, AEG runs a dedicated investor portal. Broadcast updates, project reporting and documents all arrive in one place."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {PORTAL_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardBody className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="text-[16px]">{feature.title}</h3>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">{feature.body}</p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="container-aeg py-14 md:py-20">
          <SectionTitle eyebrow="How it works" title="From introduction to exit" align="center" />

          <ol className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {PROCESS.map((item) => (
              <li key={item.step} className="rounded-xl border border-line bg-ivory p-5">
                <span className="font-display text-[26px] font-semibold leading-none text-gold-soft">
                  {item.step}
                </span>
                <h3 className="mt-3 text-[16px]">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="container-aeg py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionTitle
                eyebrow="Structure"
                title="Unit trusts, not handshakes"
                description="Each project or project group sits inside an AEG unit trust with a corporate trustee. Your interest is recorded on the unit register, and the exit process is tracked as formally as delivery is."
              />
              <ul className="mt-7 space-y-3">
                {[
                  'Units issued at $1,000 each, typical minimum parcel of 250 units',
                  'Corporate trustee: AEG Trustee Services Pty Ltd',
                  'Unit register maintained per trust, visible in your portal',
                  'Exit tracked through valuation, settlement, distribution and sign-off',
                  'Company and project accounting handled by an independent corporate accountant',
                ].map((point) => (
                  <li key={point} className="flex gap-3 text-[14.5px] text-slate">
                    <Check size={16} className="mt-1 shrink-0 text-gold" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <Card className="bg-navy text-white">
              <CardBody className="p-7">
                <span className="flex size-10 items-center justify-center rounded-lg bg-white/10 text-gold">
                  <Wallet size={19} />
                </span>
                <h3 className="mt-5 font-display text-[22px] font-semibold text-white">
                  Currently open to new capital
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/65">
                  {openProjects.length} projects in the portfolio have capacity remaining in their
                  raise, totalling approximately {currencyCompact(capacity)}.
                </p>

                <ul className="mt-6 space-y-3 border-t border-white/10 pt-5">
                  {openProjects.slice(0, 4).map((project) => {
                    const remaining =
                      project.financials.investorCapitalTarget - project.financials.investorCapitalRaised;
                    return (
                      <li key={project.id} className="flex items-baseline justify-between gap-4">
                        <span className="text-[13.5px] text-white/80">{project.name}</span>
                        <span className="shrink-0 font-mono text-[12.5px] text-gold">
                          {currencyCompact(remaining)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <p className="mt-6 text-[11.5px] leading-relaxed text-white/40">
                  Figures are illustrative and do not constitute an offer of securities or financial
                  advice. Any investment is subject to the relevant trust documentation.
                </p>

                <ButtonLink to="/contact" variant="gold" className="mt-6 w-full">
                  Register your interest
                </ButtonLink>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
