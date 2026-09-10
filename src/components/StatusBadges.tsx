import { Badge, StatusPill } from '@/components/ui';
import {
  CATEGORY_LABELS,
  EXIT_STAGE_LABELS,
  MILESTONE_STATUS_LABELS,
  RISK_CATEGORY_LABELS,
  RISK_STATUS_LABELS,
  STATUS_LABELS,
  TRUST_STATUS_LABELS,
} from '@/lib/labels';
import { riskSeverity } from '@/lib/project';
import type {
  ExitStage,
  FeasibilityStatus,
  MilestoneStatus,
  ProjectCategory,
  ProjectStatus,
  Risk,
  RiskStatus,
  RsvpStatus,
  TrustStatus,
} from '@/types';

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const tone = status === 'completed' ? 'ok' : status === 'in-development' ? 'gold' : 'navy';
  return <StatusPill tone={tone}>{STATUS_LABELS[status]}</StatusPill>;
}

export function CategoryBadge({ category }: { category: ProjectCategory }) {
  return <Badge tone="neutral">{CATEGORY_LABELS[category]}</Badge>;
}

export function MilestoneBadge({ status }: { status: MilestoneStatus }) {
  const tone = status === 'complete' ? 'ok' : status === 'in-progress' ? 'warn' : 'idle';
  return <StatusPill tone={tone}>{MILESTONE_STATUS_LABELS[status]}</StatusPill>;
}

export function RiskStatusBadge({ status }: { status: RiskStatus }) {
  const tone =
    status === 'open' ? 'alert' : status === 'monitoring' ? 'warn' : status === 'mitigated' ? 'ok' : 'idle';
  return <StatusPill tone={tone}>{RISK_STATUS_LABELS[status]}</StatusPill>;
}

export function RiskCategoryBadge({ category }: { category: Risk['category'] }) {
  return <Badge tone="navy">{RISK_CATEGORY_LABELS[category]}</Badge>;
}

export function RiskSeverityBadge({ risk }: { risk: Risk }) {
  const severity = riskSeverity(risk);
  const tone = severity === 'high' ? 'alert' : severity === 'medium' ? 'warn' : 'idle';
  const label = severity === 'high' ? 'High' : severity === 'medium' ? 'Medium' : 'Low';
  return <Badge tone={tone}>{label}</Badge>;
}

export function FeasibilityStatusBadge({ status }: { status: FeasibilityStatus }) {
  const tone = status === 'approved' ? 'ok' : status === 'under-review' ? 'warn' : 'idle';
  const label = status === 'approved' ? 'Approved' : status === 'under-review' ? 'Under review' : 'Draft';
  return <StatusPill tone={tone}>{label}</StatusPill>;
}

export function TrustStatusBadge({ status }: { status: TrustStatus }) {
  const tone =
    status === 'active' ? 'ok' : status === 'winding-up' ? 'warn' : status === 'forming' ? 'gold' : 'idle';
  return <StatusPill tone={tone}>{TRUST_STATUS_LABELS[status]}</StatusPill>;
}

export function ExitStageBadge({ stage }: { stage: ExitStage }) {
  const tone = stage === 'complete' ? 'ok' : stage === 'not-started' ? 'idle' : 'warn';
  return <StatusPill tone={tone}>{EXIT_STAGE_LABELS[stage]}</StatusPill>;
}

export function RsvpStatusBadge({ status }: { status: RsvpStatus }) {
  const tone =
    status === 'checked-in' ? 'ok' : status === 'confirmed' ? 'navy' : status === 'waitlist' ? 'warn' : 'idle';
  const label =
    status === 'checked-in' ? 'Checked in' : status === 'confirmed' ? 'Confirmed' : status === 'waitlist' ? 'Waitlist' : 'Declined';
  return <StatusPill tone={tone}>{label}</StatusPill>;
}
