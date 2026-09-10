import { projects } from '@/data/projects';
import type { Feasibility, FeasibilityStatus } from '@/types';

/**
 * One feasibility per project, structured on the standard AEG template:
 * costs, returns, timeline and risk. Figures are derived from the project's
 * financials so the report always reconciles to the project record.
 */

const COST_SPLIT: { label: string; share: number }[] = [
  { label: 'Land acquisition', share: 0 }, // filled from project.landCost
  { label: 'Stamp duty & acquisition costs', share: 0.055 },
  { label: 'Civil works & infrastructure', share: 0.46 },
  { label: 'Professional fees & consultants', share: 0.11 },
  { label: 'Council contributions & headworks', share: 0.14 },
  { label: 'Finance & holding costs', share: 0.12 },
  { label: 'Project management', share: 0.045 },
  { label: 'Contingency', share: 0.07 },
];

function statusFor(project: (typeof projects)[number]): FeasibilityStatus {
  const m2 = project.milestones[1]!;
  if (m2.status === 'complete') return 'approved';
  if (m2.status === 'in-progress') return 'under-review';
  return 'draft';
}

function monthsBetween(a: string, b: string): number {
  const start = new Date(a);
  const end = new Date(b);
  return Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
  );
}

const RISK_SUMMARIES: Record<string, string> = {
  'residential-land':
    'Principal risks are approval timing and civil cost escalation. Programme carries three months of float to absorb council assessment delays, and civil rates have been market-tested with two contractors. Sell-down is modelled at a conservative absorption rate with a 5% price sensitivity applied.',
  'commercial-land':
    'Returns are sensitive to tenant covenant strength and capitalisation rate movement at exit. A pre-commitment strategy is in place to de-risk the leasing assumption, and finance costs have been sensitised at +150bps over the construction period.',
  'farming-land':
    'Income is exposed to seasonal yield variability and water allocation pricing. The holding is leased to an established operator on a fixed-rent basis, which insulates the base case; upside depends on a rezoning pathway that is not assumed in this feasibility.',
  'dubai-property':
    'Exposure is to off-plan handover timing, AED/AUD currency movement and resale depth at handover. The exit is staged across two tranches to reduce concentration, and no capital growth beyond contract price is assumed in the base case.',
  'india-property':
    'Approval pathways through the local development authority carry timing uncertainty. Local counsel and the India-based admin team maintain a weekly approvals register; currency movement is modelled at a 4% annual depreciation assumption.',
  other:
    'The planning pathway is untested and represents the dominant risk. The site is held under option so that exposure is limited until the planning proposal is supported, with all costs to that point treated as sunk in the downside case.',
};

const ASSUMPTIONS: Record<string, string[]> = {
  'residential-land': [
    'Lot pricing based on comparable sales within a 3km radius, held flat in real terms',
    'Civil works priced from a competitive two-contractor tender',
    'Council assessment period of 120 days from lodgement',
    'Sell-down of 4 lots per month from title registration',
    'Finance drawn progressively at 6.85% p.a. over the construction period',
  ],
  'commercial-land': [
    'Net face rent supported by three comparable leasing deals in the precinct',
    'Exit capitalisation rate of 5.75%, unchanged from acquisition',
    'Twelve-month leasing period allowed post practical completion',
    'Outgoings fully recoverable under net lease terms',
    'Finance drawn progressively at 6.95% p.a. over the construction period',
  ],
  'farming-land': [
    'Lease income fixed with annual CPI escalation',
    'Water entitlement value held at acquisition cost',
    'No rezoning uplift assumed in the base case',
    'Exit at a 4.5% capitalisation rate on passing income',
  ],
  'dubai-property': [
    'Handover on the developer schedule with a three-month allowance for delay',
    'AED/AUD held at the acquisition rate; sensitivity run at ±8%',
    'Resale at contract price plus market movement, staged across two tranches',
    'Service charges and DLD transfer fees allowed in full',
  ],
  'india-property': [
    'Approvals obtained within 18 months of lodgement',
    'INR/AUD depreciation of 4% per annum applied to repatriated proceeds',
    'Plot pricing benchmarked to two comparable layouts in the corridor',
    'Local statutory charges and RERA compliance costs allowed in full',
  ],
  other: [
    'Planning proposal supported by council within 24 months',
    'Site held under option until the planning pathway is confirmed',
    'End-value benchmarked against mixed-use comparables in regional NSW',
  ],
};

export const feasibilities: Feasibility[] = projects.map((project, i) => {
  const status = statusFor(project);
  const budget = project.financials.developmentBudget;

  const costLines = COST_SPLIT.map((line) =>
    line.label === 'Land acquisition'
      ? { label: line.label, amount: project.financials.landCost }
      : { label: line.label, amount: Math.round(budget * line.share) },
  );

  const sellingCostsPct = project.category === 'commercial-land' ? 2.2 : 3.4;
  const totalCost = costLines.reduce((sum, line) => sum + line.amount, 0);
  const netRealisation =
    project.financials.projectedRevenue * (1 - sellingCostsPct / 100);
  const targetMarginPct = ((netRealisation - totalCost) / totalCost) * 100;

  const prepared = new Date(project.startedOn);
  prepared.setDate(prepared.getDate() + 21);
  const approvedMilestone = project.milestones[1]!;

  return {
    id: `f-${project.id}`,
    projectId: project.id,
    version: status === 'draft' ? 'v0.9' : status === 'under-review' ? 'v1.0' : `v${1 + (i % 3)}.${i % 2}`,
    status,
    preparedBy: project.projectManager,
    preparedOn: prepared.toISOString().slice(0, 10),
    approvedOn: status === 'approved' ? approvedMilestone.actualDate : null,
    costLines,
    grossRealisation: project.financials.projectedRevenue,
    sellingCostsPct,
    durationMonths: monthsBetween(project.startedOn, project.targetCompletion),
    targetMarginPct: Math.round(targetMarginPct * 10) / 10,
    targetIrrPct: project.financials.targetIrrPct,
    riskSummary: RISK_SUMMARIES[project.category] ?? RISK_SUMMARIES.other!,
    assumptions: ASSUMPTIONS[project.category] ?? ASSUMPTIONS.other!,
  };
});
