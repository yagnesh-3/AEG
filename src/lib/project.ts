import { LIFECYCLE_STAGES, MILESTONES } from '@/lib/labels';
import type {
  Feasibility,
  LifecycleStage,
  Project,
  Risk,
  RiskImpact,
  RiskLikelihood,
} from '@/types';

/** Percentage of the M1-M7 tracker that is complete (in-progress counts as half). */
export function milestoneProgress(project: Project): number {
  const score = project.milestones.reduce((sum, m) => {
    if (m.status === 'complete') return sum + 1;
    if (m.status === 'in-progress') return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((score / MILESTONES.length) * 100);
}

export function completedMilestones(project: Project): number {
  return project.milestones.filter((m) => m.status === 'complete').length;
}

/** The milestone a project is currently working towards, if any. */
export function currentMilestone(project: Project) {
  return (
    project.milestones.find((m) => m.status === 'in-progress') ??
    project.milestones.find((m) => m.status === 'not-started')
  );
}

/** A milestone is late when its target has passed and it is not complete. */
export function isMilestoneOverdue(
  milestone: Project['milestones'][number],
  now = new Date(),
): boolean {
  return milestone.status !== 'complete' && new Date(milestone.targetDate) < now;
}

export function overdueMilestoneCount(project: Project, now = new Date()): number {
  return project.milestones.filter((m) => isMilestoneOverdue(m, now)).length;
}

export function lifecycleIndex(stage: LifecycleStage): number {
  return LIFECYCLE_STAGES.findIndex((s) => s.stage === stage);
}

export function lifecycleProgress(stage: LifecycleStage): number {
  return Math.round(((lifecycleIndex(stage) + 1) / LIFECYCLE_STAGES.length) * 100);
}

const SEVERITY_SCORE: Record<RiskLikelihood | RiskImpact, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/** Likelihood x impact, 1-9. */
export function riskScore(risk: Risk): number {
  return SEVERITY_SCORE[risk.likelihood] * SEVERITY_SCORE[risk.impact];
}

export function riskSeverity(risk: Risk): 'low' | 'medium' | 'high' {
  const score = riskScore(risk);
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

export function openRisks(risks: Risk[]): Risk[] {
  return risks.filter((r) => r.status === 'open' || r.status === 'monitoring');
}

/* ---------- Financial derivations ---------- */

export function totalProjectCost(project: Project): number {
  return project.financials.landCost + project.financials.developmentBudget;
}

export function projectedProfit(project: Project): number {
  return project.financials.projectedRevenue - totalProjectCost(project);
}

export function projectedMarginPct(project: Project): number {
  const cost = totalProjectCost(project);
  return cost === 0 ? 0 : (projectedProfit(project) / cost) * 100;
}

export function budgetUsedPct(project: Project): number {
  const { developmentBudget, developmentSpendToDate } = project.financials;
  return developmentBudget === 0 ? 0 : (developmentSpendToDate / developmentBudget) * 100;
}

export function capitalRaisedPct(project: Project): number {
  const { investorCapitalRaised, investorCapitalTarget } = project.financials;
  return investorCapitalTarget === 0 ? 0 : (investorCapitalRaised / investorCapitalTarget) * 100;
}

/* ---------- Feasibility derivations ---------- */

export function feasibilityTotalCost(feasibility: Feasibility): number {
  return feasibility.costLines.reduce((sum, line) => sum + line.amount, 0);
}

export function feasibilitySellingCosts(feasibility: Feasibility): number {
  return feasibility.grossRealisation * (feasibility.sellingCostsPct / 100);
}

export function feasibilityNetRealisation(feasibility: Feasibility): number {
  return feasibility.grossRealisation - feasibilitySellingCosts(feasibility);
}

export function feasibilityProfit(feasibility: Feasibility): number {
  return feasibilityNetRealisation(feasibility) - feasibilityTotalCost(feasibility);
}

export function feasibilityMarginPct(feasibility: Feasibility): number {
  const cost = feasibilityTotalCost(feasibility);
  return cost === 0 ? 0 : (feasibilityProfit(feasibility) / cost) * 100;
}
