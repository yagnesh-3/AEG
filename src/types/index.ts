/**
 * Domain vocabulary for the AEG platform.
 * Terms follow the AEG Platform Requirements brief (sections 2-4).
 */

/* ---------- Access ---------- */

export type Role = 'admin' | 'staff' | 'partner' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  /** Investor users are linked to an Investor record. */
  investorId?: string;
  initials: string;
}

/* ---------- Projects ---------- */

export type ProjectCategory =
  | 'residential-land'
  | 'commercial-land'
  | 'farming-land'
  | 'dubai-property'
  | 'india-property'
  | 'other';

export type ProjectStatus = 'new' | 'in-development' | 'completed';

/** Step order of the end-to-end delivery flow (brief section 3). */
export type LifecycleStage =
  | 'land-identification'
  | 'feasibility'
  | 'purchase'
  | 'survey'
  | 'planning-da'
  | 'engineering'
  | 'council-approvals'
  | 'construction-certificate'
  | 'civil-works'
  | 'subdivision-registration'
  | 'marketing'
  | 'sales'
  | 'settlement';

export type MilestoneCode = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7';
export type MilestoneStatus = 'not-started' | 'in-progress' | 'complete';

export interface Milestone {
  code: MilestoneCode;
  status: MilestoneStatus;
  /** ISO date strings. `actualDate` is null until the milestone completes. */
  targetDate: string;
  actualDate: string | null;
  note?: string;
}

export type RiskCategory =
  | 'approvals-regulatory'
  | 'technical-design'
  | 'financial-market'
  | 'programme-delivery';

export type RiskLikelihood = 'low' | 'medium' | 'high';
export type RiskImpact = 'low' | 'medium' | 'high';
export type RiskStatus = 'open' | 'monitoring' | 'mitigated' | 'closed';

export interface Risk {
  id: string;
  projectId: string;
  category: RiskCategory;
  title: string;
  description: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  status: RiskStatus;
  /** Internal-only mitigation notes — never surfaced in the investor portal. */
  mitigation: string;
  owner: string;
  raisedOn: string;
}

export type DocumentKind =
  | 'feasibility'
  | 'da-submission'
  | 'contract'
  | 'survey'
  | 'engineering'
  | 'financial'
  | 'title'
  | 'investor-update'
  | 'marketing';

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  kind: DocumentKind;
  sizeKb: number;
  uploadedOn: string;
  uploadedBy: string;
  /** Controls whether the document appears in the investor portal library. */
  investorVisible: boolean;
}

export interface ProjectFinancials {
  landCost: number;
  developmentBudget: number;
  developmentSpendToDate: number;
  projectedRevenue: number;
  /** Realised revenue; 0 until lots begin settling. */
  realisedRevenue: number;
  investorCapitalRaised: number;
  investorCapitalTarget: number;
  targetIrrPct: number;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  body: string;
  postedOn: string;
  postedBy: string;
  investorVisible: boolean;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  category: ProjectCategory;
  status: ProjectStatus;
  location: string;
  state: string;
  country: string;
  summary: string;
  description: string;
  /** Total lots for subdivision projects; undefined for non-subdivision holdings. */
  lots?: number;
  areaHectares: number;
  startedOn: string;
  targetCompletion: string;
  lifecycleStage: LifecycleStage;
  projectManager: string;
  milestones: Milestone[];
  financials: ProjectFinancials;
  /** Gradient pair used for the branded presentation header. */
  imageTone: [string, string];
  featured: boolean;
}

/* ---------- Feasibility ---------- */

export type FeasibilityStatus = 'draft' | 'under-review' | 'approved';

export interface FeasibilityCostLine {
  label: string;
  amount: number;
}

export interface Feasibility {
  id: string;
  projectId: string;
  version: string;
  status: FeasibilityStatus;
  preparedBy: string;
  preparedOn: string;
  approvedOn: string | null;
  costLines: FeasibilityCostLine[];
  grossRealisation: number;
  sellingCostsPct: number;
  /** Development period in months, used for the timeline section. */
  durationMonths: number;
  targetMarginPct: number;
  targetIrrPct: number;
  riskSummary: string;
  assumptions: string[];
}

/* ---------- Investors, trusts, exits ---------- */

export type InvestorType = 'individual' | 'smsf' | 'company' | 'trust';
export type InvestorStatus = 'active' | 'prospective' | 'exited';

export interface Investor {
  id: string;
  name: string;
  type: InvestorType;
  status: InvestorStatus;
  email: string;
  phone: string;
  location: string;
  joinedOn: string;
  relationshipManager: string;
  initials: string;
}

export interface UnitHolding {
  id: string;
  trustId: string;
  investorId: string;
  units: number;
  /** Capital committed, in AUD. */
  committed: number;
  distributionsPaid: number;
  issuedOn: string;
}

export type TrustStatus = 'forming' | 'active' | 'winding-up' | 'closed';

export interface UnitTrust {
  id: string;
  name: string;
  abn: string;
  status: TrustStatus;
  trustee: string;
  establishedOn: string;
  projectIds: string[];
  totalUnits: number;
  unitPrice: number;
}

export type ExitStage =
  | 'not-started'
  | 'valuation'
  | 'sale-settlement'
  | 'distribution'
  | 'sign-off'
  | 'complete';

export interface ExitStep {
  stage: ExitStage;
  status: MilestoneStatus;
  targetDate: string;
  actualDate: string | null;
}

export interface ExitProcess {
  id: string;
  trustId: string;
  projectId: string;
  stage: ExitStage;
  openedOn: string;
  targetCompletion: string;
  distributionPool: number;
  distributionPaid: number;
  steps: ExitStep[];
  note: string;
}

/* ---------- Communications ---------- */

export type BroadcastChannel = 'email' | 'sms' | 'portal';
export type BroadcastAudience = 'all-investors' | 'project-investors' | 'prospective';

export interface Broadcast {
  id: string;
  subject: string;
  body: string;
  audience: BroadcastAudience;
  projectId?: string;
  channels: BroadcastChannel[];
  sentOn: string;
  sentBy: string;
  recipientCount: number;
  openRatePct: number;
}

export type EnquiryStatus = 'new' | 'in-progress' | 'answered' | 'closed';
export type EnquirySource = 'portal' | 'website' | 'ai-assistant' | 'phone';

export interface EnquiryMessage {
  id: string;
  author: string;
  authorRole: 'investor' | 'aeg' | 'visitor';
  body: string;
  sentOn: string;
}

export interface Enquiry {
  id: string;
  subject: string;
  investorId?: string;
  contactName: string;
  contactEmail: string;
  projectId?: string;
  source: EnquirySource;
  status: EnquiryStatus;
  raisedOn: string;
  messages: EnquiryMessage[];
}

/* ---------- Resources (brief section 4) ---------- */

export type ResourceRole =
  | 'legal'
  | 'accountant'
  | 'project-manager'
  | 'contractor-civil'
  | 'contractor-survey'
  | 'contractor-engineering'
  | 'india-admin'
  | 'banker';

export type ResourceEngagement = 'in-house' | 'outsourced' | 'partner';

export interface Resource {
  id: string;
  name: string;
  organisation: string;
  role: ResourceRole;
  engagement: ResourceEngagement;
  email: string;
  phone: string;
  location: string;
  /** Platform access level granted to this resource. */
  accessLevel: Role | 'none';
  projectIds: string[];
  initials: string;
}

/* ---------- Website feedback & launch event ---------- */

export interface FeedbackEntry {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  submittedOn: string;
}

export type RsvpChannel =
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'paid'
  | 'seo'
  | 'direct';

export type RsvpStatus = 'confirmed' | 'waitlist' | 'declined' | 'checked-in';

export interface EventRsvp {
  id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  channel: RsvpChannel;
  status: RsvpStatus;
  ticketCode: string;
  rsvpOn: string;
  investorId?: string;
}

export interface LaunchEvent {
  name: string;
  dateLabel: string;
  venue: string;
  address: string;
  capacityMin: number;
  capacityMax: number;
  description: string;
}
