// Shared domain types for the AEG demo platform.
// All data is mock/client-side — no backend.

export type ProjectCategory =
  | 'Residential Land'
  | 'Commercial Land'
  | 'Farming Land'
  | 'Dubai Property'
  | 'Property – India'
  | 'Other'

export type ProjectStatus = 'New' | 'In Development' | 'Completed'

export type MilestoneStatus = 'not-started' | 'in-progress' | 'complete'

// The seven canonical AEG milestones (M1–M7) from the requirements brief.
export type MilestoneId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7'

export type Milestone = {
  id: MilestoneId
  name: string
  description: string
  status: MilestoneStatus
  targetDate: string
  actualDate: string | null
}

export type RiskCategory =
  | 'Approvals & Regulatory'
  | 'Technical & Design'
  | 'Financial & Market'
  | 'Programme & Delivery'

export type RiskStatus = 'Open' | 'Monitoring' | 'Mitigated' | 'Closed'

export type Risk = {
  id: string
  category: RiskCategory
  description: string
  status: RiskStatus
  mitigation: string
}

export type FeasibilityReport = {
  totalCost: string
  projectedRevenue: string
  netReturn: string
  irr: string
  timeline: string
  keyRisks: string
  summary: string
  attachedFile: string
  signedOff: boolean
}

export type ProjectDocument = {
  name: string
  type: string
  date: string
}

export type Project = {
  id: string
  name: string
  location: string
  category: ProjectCategory
  status: ProjectStatus
  image: string
  description: string
  stats: string
  budget: string
  progress: number
  returnRate: string
  headlineMilestone: string
  documents: ProjectDocument[]
  milestones: Milestone[]
  risks: Risk[]
  feasibility: FeasibilityReport
}

// ---- People / access -------------------------------------------------------

export type Role = 'admin' | 'staff' | 'investor'

export type DemoAccount = {
  id: string
  name: string
  email: string
  role: Role
  investorId?: string
}

export type ContactRole =
  | 'Legal / Lawyer'
  | 'Accountant (Corporate)'
  | 'Project Manager'
  | 'Contractor — Civil'
  | 'Surveyor'
  | 'Engineer'
  | 'India Admin'
  | 'Banker'

export type Contact = {
  id: string
  name: string
  role: ContactRole
  organisation: string
  email: string
  phone: string
  visibleTo: Role[]
}

// ---- Investors / unit trust ------------------------------------------------

export type Holding = {
  projectId: string
  units: number
  amount: string
}

export type Investor = {
  id: string
  name: string
  email: string
  joined: string
  holdings: Holding[]
}

export type ExitStatus = 'Not started' | 'In progress' | 'Distributing' | 'Signed off'

export type UnitTrustEntry = {
  projectId: string
  totalUnits: number
  unitPrice: string
  exitStatus: ExitStatus
  exitTiming: string
  distributions: string
  signOff: string
}

// ---- Communications --------------------------------------------------------

export type Enquiry = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  projectId: string | null
  source: 'investor-portal' | 'public-contact'
  status: 'New' | 'Responded'
  date: string
}

export type Broadcast = {
  id: string
  title: string
  body: string
  audience: 'All investors' | 'Project investors'
  projectId: string | null
  date: string
}

export type Feedback = {
  id: string
  name: string
  rating: number
  comment: string
  date: string
}
