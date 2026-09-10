import { Link } from 'react-router-dom';
import { MapPin, LandPlot } from 'lucide-react';
import { CategoryBadge, ProjectStatusBadge } from '@/components/StatusBadges';
import { MilestoneDots } from '@/components/MilestoneTracker';
import { ProgressBar } from '@/components/ui';
import { LIFECYCLE_LABELS } from '@/lib/labels';
import { milestoneProgress } from '@/lib/project';
import { number } from '@/lib/format';
import type { Project } from '@/types';

interface Props {
  project: Project;
  /** Public cards link to the marketing view; internal cards to the CRM record. */
  to: string;
}

export function ProjectCard({ project, to }: Props) {
  const progress = milestoneProgress(project);

  return (
    <Link
      to={to}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-shadow duration-200 hover:shadow-lift"
    >
      <div
        className="relative h-36 shrink-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${project.imageTone[0]} 0%, ${project.imageTone[1]} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(255,255,255,.9) 0 1px, transparent 1px 26px), repeating-linear-gradient(25deg, rgba(255,255,255,.55) 0 1px, transparent 1px 34px)',
          }}
          aria-hidden
        />
        <div className="absolute left-3.5 top-3.5">
          <span className="rounded-md bg-white/92 px-2 py-0.5 text-[11.5px] font-medium text-navy">
            {project.country === 'Australia' ? project.state : project.country}
          </span>
        </div>
        <div className="absolute bottom-3.5 left-3.5 right-3.5">
          <p className="font-display text-[19px] font-semibold leading-tight text-white drop-shadow-sm">
            {project.name}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={project.category} />
          <ProjectStatusBadge status={project.status} />
        </div>

        <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-slate">{project.summary}</p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-slate">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} className="text-slate-light" />
            {project.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <LandPlot size={13} className="text-slate-light" />
            {project.lots ? `${project.lots} lots` : `${number(project.areaHectares)} ha`}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="text-slate">{LIFECYCLE_LABELS[project.lifecycleStage]}</span>
            <span className="font-semibold text-navy">{progress}%</span>
          </div>
          <ProgressBar
            value={progress}
            tone={project.status === 'completed' ? 'ok' : 'gold'}
            label={`${project.name} milestone progress`}
          />
          <div className="mt-2.5 flex items-center justify-between">
            <MilestoneDots milestones={project.milestones} />
            <span className="text-[11.5px] text-slate-light">M1 – M7</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
