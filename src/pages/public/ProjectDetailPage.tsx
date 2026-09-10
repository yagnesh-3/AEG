import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, LandPlot, MapPin, UserRound } from 'lucide-react';
import { CategoryBadge, ProjectStatusBadge } from '@/components/StatusBadges';
import { MilestoneTracker } from '@/components/MilestoneTracker';
import { LifecycleTimeline } from '@/components/LifecycleTimeline';
import { ProjectCard } from '@/components/ProjectCard';
import { ButtonLink, Card, CardBody, CardHeader, DetailRow, ProgressBar, SectionTitle } from '@/components/ui';
import { useData, useProject, useProjectUpdates } from '@/store/DataContext';
import { LIFECYCLE_LABELS } from '@/lib/labels';
import { date, monthYear, number, percent } from '@/lib/format';
import { milestoneProgress } from '@/lib/project';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

/**
 * The AEG-branded public presentation of a project. Deliberately excludes
 * internal cost breakdowns, the risk register and non-public documents.
 */
export function ProjectDetailPage() {
  const { slug } = useParams();
  const project = useProject(slug);
  const { projects } = useData();
  const updates = useProjectUpdates(project?.id).filter((u) => u.investorVisible).slice(0, 4);

  if (!project) return <NotFoundPage />;

  const progress = milestoneProgress(project);
  const related = projects
    .filter((p) => p.id !== project.id && p.category === project.category)
    .slice(0, 3);

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${project.imageTone[0]} 0%, ${project.imageTone[1]} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(255,255,255,.9) 0 1px, transparent 1px 38px), repeating-linear-gradient(25deg, rgba(255,255,255,.55) 0 1px, transparent 1px 50px)',
          }}
          aria-hidden
        />

        <div className="container-aeg relative py-12 md:py-16">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-[13px] text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            All projects
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <CategoryBadge category={project.category} />
            <ProjectStatusBadge status={project.status} />
          </div>

          <h1 className="mt-4 text-balance text-[34px] leading-tight text-white md:text-[46px]">
            {project.name}
          </h1>
          <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-white/75">{project.summary}</p>

          <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-5">
            {[
              { icon: MapPin, label: 'Location', value: `${project.location}, ${project.country === 'Australia' ? project.state : project.country}` },
              { icon: LandPlot, label: project.lots ? 'Lots' : 'Area', value: project.lots ? `${project.lots} lots` : `${number(project.areaHectares)} ha` },
              { icon: CalendarDays, label: 'Target completion', value: monthYear(project.targetCompletion) },
              { icon: UserRound, label: 'Project manager', value: project.projectManager },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2.5">
                  <Icon size={16} className="text-gold" />
                  <div>
                    <dt className="text-[11.5px] uppercase tracking-wide text-white/50">{item.label}</dt>
                    <dd className="text-[14px] font-medium text-white">{item.value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="container-aeg py-10 md:py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Delivery stage</p>
              <h2 className="mt-1.5 text-[22px]">{LIFECYCLE_LABELS[project.lifecycleStage]}</h2>
            </div>
            <div className="min-w-[180px]">
              <div className="mb-1.5 flex items-baseline justify-between gap-4 text-[13px]">
                <span className="text-slate">Milestone progress</span>
                <span className="font-display text-[18px] font-semibold text-navy">{progress}%</span>
              </div>
              <ProgressBar value={progress} tone={project.status === 'completed' ? 'ok' : 'gold'} />
            </div>
          </div>

          <LifecycleTimeline stage={project.lifecycleStage} className="mt-8" />
        </div>
      </section>

      <section>
        <div className="container-aeg grid gap-8 py-12 md:py-16 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <SectionTitle eyebrow="Overview" title="About this project" />
              <p className="mt-5 text-[15px] leading-[1.75] text-slate">{project.description}</p>
            </div>

            <Card>
              <CardHeader
                title="Milestone tracker"
                description="The seven key milestones AEG tracks on every project."
              />
              <CardBody>
                <MilestoneTracker milestones={project.milestones} />
              </CardBody>
            </Card>

            {updates.length > 0 ? (
              <Card>
                <CardHeader title="Project updates" description="The latest reporting on this project." />
                <CardBody className="space-y-5 divide-y divide-line-soft">
                  {updates.map((update) => (
                    <div key={update.id} className="pt-5 first:pt-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-[15px] font-medium text-navy">{update.title}</h4>
                        <span className="text-[12px] text-slate-light">{date(update.postedOn)}</span>
                      </div>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">{update.body}</p>
                    </div>
                  ))}
                </CardBody>
              </Card>
            ) : null}
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader title="Key figures" />
              <CardBody>
                <dl>
                  <DetailRow label="Category" value={<CategoryBadge category={project.category} />} />
                  <DetailRow label="Status" value={<ProjectStatusBadge status={project.status} />} />
                  <DetailRow label="Site area" value={`${number(project.areaHectares)} ha`} />
                  {project.lots ? <DetailRow label="Lots" value={number(project.lots)} /> : null}
                  <DetailRow label="Commenced" value={monthYear(project.startedOn)} />
                  <DetailRow label="Target completion" value={monthYear(project.targetCompletion)} />
                  <DetailRow label="Target IRR" value={percent(project.financials.targetIrrPct)} />
                </dl>
                <p className="mt-4 text-[11.5px] leading-relaxed text-slate-light">
                  Target IRR is a forecast drawn from the current feasibility and is not a guarantee
                  of return. Detailed financials are available to investors through the portal.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-navy text-white">
              <CardBody>
                <h3 className="font-display text-[19px] font-semibold text-white">
                  Interested in this project?
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">
                  Request the feasibility summary and current raise details, or speak with the
                  relationship manager for this project.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <ButtonLink to={`/contact?project=${project.slug}`} variant="gold">
                    Enquire about {project.name.split(' ')[0]}
                  </ButtonLink>
                  <ButtonLink
                    to="/login"
                    variant="secondary"
                    className="border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
                  >
                    Investor login
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-line bg-surface">
          <div className="container-aeg py-12 md:py-16">
            <SectionTitle eyebrow="Related" title="Other projects in this category" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} to={`/projects/${p.slug}`} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
