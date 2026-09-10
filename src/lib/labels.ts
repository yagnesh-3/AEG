import type {
  BroadcastAudience,
  DocumentKind,
  ExitStage,
  InvestorType,
  LifecycleStage,
  MilestoneCode,
  MilestoneStatus,
  ProjectCategory,
  ProjectStatus,
  ResourceRole,
  RiskCategory,
  RiskStatus,
  Role,
  RsvpChannel,
  RsvpStatus,
  TrustStatus,
} from '@/types';

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  'residential-land': 'Residential Land',
  'commercial-land': 'Commercial Land',
  'farming-land': 'Farming Land',
  'dubai-property': 'Dubai Property',
  'india-property': 'Property — India',
  other: 'Other Property',
};

export const CATEGORY_ORDER: ProjectCategory[] = [
  'residential-land',
  'commercial-land',
  'farming-land',
  'dubai-property',
  'india-property',
  'other',
];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  new: 'New',
  'in-development': 'In Development',
  completed: 'Completed',
};

/** The seven key milestones from the brief, in order. */
export const MILESTONES: { code: MilestoneCode; name: string; description: string }[] = [
  { code: 'M1', name: 'Land Settlement', description: 'Purchase completed, site secured' },
  { code: 'M2', name: 'Feasibility Sign-off', description: 'Budget & returns approved by investors' },
  { code: 'M3', name: 'DA Approval', description: 'Council consent granted' },
  { code: 'M4', name: 'Construction Certificate', description: 'Engineering & works approved' },
  { code: 'M5', name: 'Civil Works Complete', description: 'Roads, drainage, services installed' },
  { code: 'M6', name: 'Subdivision Registration', description: 'New titles issued by NSW Land Registry Services' },
  { code: 'M7', name: 'Lots Sold & Settled', description: 'Sales proceeds realised' },
];

export const MILESTONE_BY_CODE = Object.fromEntries(
  MILESTONES.map((m) => [m.code, m]),
) as Record<MilestoneCode, (typeof MILESTONES)[number]>;

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  complete: 'Complete',
};

/** End-to-end project flow, in delivery order. */
export const LIFECYCLE_STAGES: { stage: LifecycleStage; name: string }[] = [
  { stage: 'land-identification', name: 'Land Identification' },
  { stage: 'feasibility', name: 'Feasibility' },
  { stage: 'purchase', name: 'Purchase' },
  { stage: 'survey', name: 'Survey' },
  { stage: 'planning-da', name: 'Planning / DA' },
  { stage: 'engineering', name: 'Engineering' },
  { stage: 'council-approvals', name: 'Council Approvals' },
  { stage: 'construction-certificate', name: 'Construction Certificate' },
  { stage: 'civil-works', name: 'Civil Works' },
  { stage: 'subdivision-registration', name: 'Subdivision Approval & Registration' },
  { stage: 'marketing', name: 'Marketing' },
  { stage: 'sales', name: 'Investor / Buyer Sales' },
  { stage: 'settlement', name: 'Settlement' },
];

export const LIFECYCLE_LABELS = Object.fromEntries(
  LIFECYCLE_STAGES.map((s) => [s.stage, s.name]),
) as Record<LifecycleStage, string>;

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  'approvals-regulatory': 'Approvals & Regulatory',
  'technical-design': 'Technical & Design',
  'financial-market': 'Financial & Market',
  'programme-delivery': 'Programme & Delivery',
};

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  open: 'Open',
  monitoring: 'Monitoring',
  mitigated: 'Mitigated',
  closed: 'Closed',
};

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  feasibility: 'Feasibility',
  'da-submission': 'DA Submission',
  contract: 'Contract',
  survey: 'Survey',
  engineering: 'Engineering',
  financial: 'Financial',
  title: 'Title',
  'investor-update': 'Investor Update',
  marketing: 'Marketing',
};

export const INVESTOR_TYPE_LABELS: Record<InvestorType, string> = {
  individual: 'Individual',
  smsf: 'SMSF',
  company: 'Company',
  trust: 'Trust',
};

export const TRUST_STATUS_LABELS: Record<TrustStatus, string> = {
  forming: 'Forming',
  active: 'Active',
  'winding-up': 'Winding Up',
  closed: 'Closed',
};

export const EXIT_STAGES: { stage: ExitStage; name: string; description: string }[] = [
  { stage: 'valuation', name: 'Valuation', description: 'Independent valuation of remaining assets' },
  { stage: 'sale-settlement', name: 'Sale & Settlement', description: 'Final lots sold and settled' },
  { stage: 'distribution', name: 'Distribution', description: 'Proceeds distributed to unit holders' },
  { stage: 'sign-off', name: 'Sign-off', description: 'Investor and trustee sign-off obtained' },
  { stage: 'complete', name: 'Complete', description: 'Exit finalised, units cancelled' },
];

export const EXIT_STAGE_LABELS: Record<ExitStage, string> = {
  'not-started': 'Not Started',
  valuation: 'Valuation',
  'sale-settlement': 'Sale & Settlement',
  distribution: 'Distribution',
  'sign-off': 'Sign-off',
  complete: 'Complete',
};

export const RESOURCE_ROLE_LABELS: Record<ResourceRole, string> = {
  legal: 'Legal / Lawyer',
  accountant: 'Accountant (Corporate)',
  'project-manager': 'Project Manager',
  'contractor-civil': 'Contractor — Civil',
  'contractor-survey': 'Contractor — Surveyor',
  'contractor-engineering': 'Contractor — Engineer',
  'india-admin': 'India-based Resource',
  banker: 'Banker',
};

export const RESOURCE_ROLE_FUNCTIONS: Record<ResourceRole, string> = {
  legal: 'Legal advisory, contracts, licensing support',
  accountant: 'Company and project accounting',
  'project-manager': 'Day-to-day project delivery oversight',
  'contractor-civil': 'On-ground civil construction works',
  'contractor-survey': 'Boundary, contour and site survey work',
  'contractor-engineering': 'Civil and stormwater engineering design',
  'india-admin': 'Admin support and follow-up (outsourced)',
  banker: 'Banking partner working exclusively on AEG projects',
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  staff: 'AEG Staff',
  partner: 'Outsourced Partner',
  investor: 'Investor',
};

export const BROADCAST_AUDIENCE_LABELS: Record<BroadcastAudience, string> = {
  'all-investors': 'All investors',
  'project-investors': 'Project investors',
  prospective: 'Prospective investors',
};

export const RSVP_CHANNEL_LABELS: Record<RsvpChannel, string> = {
  email: 'Email marketing',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  paid: 'Paid promotion',
  seo: 'SEO / search',
  direct: 'Direct invite',
};

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  confirmed: 'Confirmed',
  waitlist: 'Waitlist',
  declined: 'Declined',
  'checked-in': 'Checked in',
};
