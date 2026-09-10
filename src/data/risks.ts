import { projects } from '@/data/projects';
import type { Risk, RiskCategory, RiskImpact, RiskLikelihood, RiskStatus } from '@/types';

/**
 * Risk templates drawn from the "Hurdles & Risks to Manage" table in the brief.
 * Assigned deterministically per project so the register is stable across reloads.
 */
interface Template {
  category: RiskCategory;
  title: string;
  description: string;
  mitigation: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
}

const TEMPLATES: Template[] = [
  {
    category: 'approvals-regulatory',
    title: 'DA determination running past programme',
    description:
      'Council assessment has exceeded the statutory timeframe, with further information requested on stormwater detention.',
    mitigation:
      'Fortnightly assessment-officer catch-ups scheduled; consultant engaged to pre-empt the outstanding RFI items and lodge amended plans early.',
    likelihood: 'high',
    impact: 'high',
  },
  {
    category: 'approvals-regulatory',
    title: 'Neighbour objections lodged during exhibition',
    description:
      'Submissions received during public exhibition raise concerns about traffic generation and lot density on the northern boundary.',
    mitigation:
      'Traffic report commissioned and a community information session held; boundary lots re-configured to increase setbacks.',
    likelihood: 'medium',
    impact: 'medium',
  },
  {
    category: 'approvals-regulatory',
    title: 'Bushfire and flooding requirements',
    description:
      'Portions of the site are mapped as bushfire prone, triggering asset protection zone requirements that reduce developable area.',
    mitigation:
      'Bushfire consultant engaged at concept stage; APZ absorbed into the drainage reserve rather than saleable lots.',
    likelihood: 'medium',
    impact: 'high',
  },
  {
    category: 'approvals-regulatory',
    title: 'Potential site contamination from prior use',
    description:
      'Historical agricultural use raises the possibility of residual contamination requiring a remediation action plan.',
    mitigation:
      'Stage 1 and Stage 2 contamination assessments completed; remediation allowance carried in the contingency line.',
    likelihood: 'low',
    impact: 'high',
  },
  {
    category: 'technical-design',
    title: 'Unexpected rock encountered in bulk earthworks',
    description:
      'Geotechnical investigation identified shallow rock across part of the site, increasing excavation cost and programme.',
    mitigation:
      'Additional boreholes commissioned to confirm extent; earthworks re-priced with a rock rate schedule agreed with the contractor.',
    likelihood: 'medium',
    impact: 'high',
  },
  {
    category: 'technical-design',
    title: 'Easement constrains the approved lot layout',
    description:
      'A registered sewer easement crosses the site diagonally, limiting building envelopes on four lots.',
    mitigation:
      'Adjustment application lodged with the water authority; alternative layout prepared that preserves lot yield.',
    likelihood: 'medium',
    impact: 'medium',
  },
  {
    category: 'technical-design',
    title: 'Engineering redesign following authority feedback',
    description:
      'The water authority requested an increase in stormwater detention capacity, requiring redesign of the basin and outlet works.',
    mitigation:
      'Civil engineer instructed to revise the design; cost impact quantified and absorbed within the contingency allowance.',
    likelihood: 'medium',
    impact: 'medium',
  },
  {
    category: 'financial-market',
    title: 'Infrastructure costs exceeding estimate',
    description:
      'Tendered civil rates have come in above the feasibility allowance, driven by material and labour cost escalation.',
    mitigation:
      'Value-engineering workshop held with the civil contractor; scope re-staged and a 7% escalation allowance added to the revised feasibility.',
    likelihood: 'high',
    impact: 'high',
  },
  {
    category: 'financial-market',
    title: 'Interest rate movement affecting finance costs',
    description:
      'Facility is priced on a floating rate; further rate increases would erode the projected margin.',
    mitigation:
      'Fixed-rate hedge discussed with the banking partner over the construction period; sensitivity modelled at +150bps in the feasibility.',
    likelihood: 'medium',
    impact: 'medium',
  },
  {
    category: 'financial-market',
    title: 'Market conditions affecting lot sale rates',
    description:
      'Buyer enquiry has softened in the local market, which may extend the sell-down period beyond the feasibility assumption.',
    mitigation:
      'Release staged into smaller tranches; pricing reviewed monthly against comparable sales, with an agent incentive structure in place.',
    likelihood: 'medium',
    impact: 'high',
  },
  {
    category: 'programme-delivery',
    title: 'Subdivision registration delay at Land Registry',
    description:
      'Plan lodgement queues at NSW Land Registry Services could delay title issue and therefore lot settlements.',
    mitigation:
      'Surveyor lodging the plan ahead of practical completion; settlement notices drafted so buyers can be notified within 48 hours of registration.',
    likelihood: 'medium',
    impact: 'medium',
  },
  {
    category: 'programme-delivery',
    title: 'Civil contractor availability',
    description:
      'The preferred civil contractor has committed crews to another project, putting the mobilisation date at risk.',
    mitigation:
      'Second contractor pre-qualified and held as a fallback; mobilisation date locked into the contract with liquidated damages.',
    likelihood: 'medium',
    impact: 'medium',
  },
  {
    category: 'programme-delivery',
    title: 'Coordination gaps between consultants',
    description:
      'Survey, engineering and planning consultants are working to different revision sets, creating rework risk.',
    mitigation:
      'Single document register maintained by the project manager; weekly coordination meeting with a shared action log.',
    likelihood: 'low',
    impact: 'medium',
  },
  {
    category: 'programme-delivery',
    title: 'Wet weather delays to civil works',
    description:
      'Above-average rainfall has caused lost days on earthworks, eroding programme float.',
    mitigation:
      'Extended working hours approved on fine days; programme re-baselined with the contractor and float reviewed monthly.',
    likelihood: 'high',
    impact: 'medium',
  },
];

const OWNERS = ['Daniel Whitmore', 'Priya Raghavan', 'Marcus Chen', 'Anita Desai', 'Yusuf Al-Rashid'];
const STATUSES: RiskStatus[] = ['open', 'monitoring', 'mitigated', 'open', 'monitoring', 'closed'];

/** Deterministic pseudo-random so the seeded register never shuffles between reloads. */
function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

export const risks: Risk[] = projects.flatMap((project) => {
  const seed = hash(project.id);
  const count = 2 + (seed % 4); // 2-5 risks per project
  const used = new Set<number>();

  return Array.from({ length: count }, (_, i) => {
    let idx = (seed + i * 5 + i * i) % TEMPLATES.length;
    while (used.has(idx)) idx = (idx + 1) % TEMPLATES.length;
    used.add(idx);

    const template = TEMPLATES[idx]!;
    // Completed projects have worked through their register.
    const status: RiskStatus =
      project.status === 'completed' ? 'closed' : STATUSES[(seed + i) % STATUSES.length]!;

    const raised = new Date(project.startedOn);
    raised.setDate(raised.getDate() + 45 + ((seed + i * 29) % 320));

    return {
      id: `r-${project.id}-${i + 1}`,
      projectId: project.id,
      category: template.category,
      title: template.title,
      description: template.description,
      likelihood: template.likelihood as RiskLikelihood,
      impact: template.impact as RiskImpact,
      status,
      mitigation: template.mitigation,
      owner: OWNERS[(seed + i) % OWNERS.length]!,
      raisedOn: raised.toISOString().slice(0, 10),
    };
  });
});
