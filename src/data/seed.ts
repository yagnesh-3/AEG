// Mock seed data for the AEG demo platform. No backend — this is the source of
// truth that DataContext loads on first run and then mirrors to localStorage.

import type {
  Broadcast,
  Contact,
  DemoAccount,
  Enquiry,
  Feedback,
  Investor,
  Milestone,
  MilestoneStatus,
  Project,
  ProjectCategory,
  ProjectStatus,
  Risk,
  RiskCategory,
  UnitTrustEntry,
} from '../types'

// Canonical M1–M7 milestone definitions from the requirements brief.
const MILESTONE_DEFS: { id: Milestone['id']; name: string; description: string }[] = [
  { id: 'M1', name: 'Land Settlement', description: 'Purchase completed, site secured' },
  { id: 'M2', name: 'Feasibility Sign-off', description: 'Budget & returns approved by investors' },
  { id: 'M3', name: 'DA Approval', description: 'Council consent granted' },
  { id: 'M4', name: 'Construction Certificate', description: 'Engineering & works approved' },
  { id: 'M5', name: 'Civil Works Complete', description: 'Roads, drainage, services installed' },
  { id: 'M6', name: 'Subdivision Registration', description: 'New titles issued by NSW Land Registry Services' },
  { id: 'M7', name: 'Lots Sold & Settled', description: 'Sales proceeds realised' },
]

// Build a milestone set given how many are complete and which one is in progress.
function makeMilestones(completed: number, targets: string[], actuals: (string | null)[]): Milestone[] {
  return MILESTONE_DEFS.map((def, index) => {
    let status: MilestoneStatus = 'not-started'
    if (index < completed) status = 'complete'
    else if (index === completed) status = 'in-progress'
    return {
      ...def,
      status,
      targetDate: targets[index] ?? 'TBC',
      actualDate: index < completed ? actuals[index] ?? null : null,
    }
  })
}

let riskCounter = 0
function risk(category: RiskCategory, description: string, status: Risk['status'], mitigation: string): Risk {
  riskCounter += 1
  return { id: `risk-${riskCounter}`, category, description, status, mitigation }
}

const IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=900&q=80',
]

type SeedProject = {
  name: string
  location: string
  category: ProjectCategory
  status: ProjectStatus
  completed: number
  budget: string
  progress: number
  returnRate: string
  headlineMilestone: string
  stats: string
  description: string
}

// 25 projects across every category in the brief.
const SEED_PROJECTS: SeedProject[] = [
  { name: 'Willowbank Estate', location: 'Adelaide, SA', category: 'Residential Land', status: 'In Development', completed: 2, budget: '$18.4m', progress: 42, returnRate: '18.5%', headlineMilestone: 'DA approval in progress', stats: '25 lots • 6.8% projected yield', description: 'A considered residential community shaped by land, landscape and a clear delivery plan for long-term housing demand in Adelaide.' },
  { name: 'North Harbour Trade', location: 'Newcastle, NSW', category: 'Commercial Land', status: 'New', completed: 1, budget: '$11.8m', progress: 24, returnRate: '15.2%', headlineMilestone: 'Feasibility sign-off underway', stats: '9,200 sqm • Leasing opportunity', description: 'A connected trade precinct positioned for the next generation of local enterprise and freight-led activity.' },
  { name: 'Mallee Fields', location: 'Murray Bridge, SA', category: 'Farming Land', status: 'In Development', completed: 4, budget: '$9.2m', progress: 68, returnRate: '19.4%', headlineMilestone: 'Civil works in progress', stats: '420 acres • Water access', description: 'Productive rural land with a long-term strategy around agriculture, water stewardship and value creation.' },
  { name: 'Palm Jumeirah Residences', location: 'Dubai, UAE', category: 'Dubai Property', status: 'In Development', completed: 3, budget: '$24.6m', progress: 55, returnRate: '17.8%', headlineMilestone: 'Construction milestones tracking', stats: 'Luxury villas • High demand', description: 'A premium Dubai residential opportunity supported by a disciplined delivery partner and high-demand market profile.' },
  { name: 'Bengaluru Tech Park Land', location: 'Bengaluru, India', category: 'Property – India', status: 'New', completed: 1, budget: '$14.2m', progress: 18, returnRate: '21.0%', headlineMilestone: 'Feasibility sign-off underway', stats: '6.5 acres • IT corridor', description: 'A strategic land holding in a fast-growing technology corridor, positioned for commercial development and long-term capital growth.' },
  { name: 'Riverstone Rise', location: 'Riverstone, NSW', category: 'Residential Land', status: 'In Development', completed: 5, budget: '$32.0m', progress: 74, returnRate: '16.4%', headlineMilestone: 'Subdivision registration next', stats: '48 lots • Rail-linked', description: 'A master-planned release delivering family lots close to transport, schools and the North West growth corridor.' },
  { name: 'Gawler Green', location: 'Gawler, SA', category: 'Residential Land', status: 'Completed', completed: 7, budget: '$21.5m', progress: 100, returnRate: '20.2%', headlineMilestone: 'Lots sold & settled', stats: '38 lots • Fully sold', description: 'A completed residential subdivision delivered on budget with strong investor returns and full lot settlement.' },
  { name: 'Parkside Commercial Hub', location: 'Parramatta, NSW', category: 'Commercial Land', status: 'In Development', completed: 3, budget: '$28.9m', progress: 51, returnRate: '14.6%', headlineMilestone: 'Construction certificate stage', stats: '12,000 sqm • Mixed-use', description: 'A mixed-use commercial hub anchoring a revitalised precinct with retail, office and service tenancies.' },
  { name: 'Coorong Pastoral', location: 'Coorong, SA', category: 'Farming Land', status: 'In Development', completed: 2, budget: '$7.4m', progress: 38, returnRate: '17.1%', headlineMilestone: 'DA / land-use approval', stats: '1,100 acres • Grazing', description: 'Extensive grazing land with diversified pastoral income and long-term land banking upside.' },
  { name: 'Downtown Dubai Suites', location: 'Dubai, UAE', category: 'Dubai Property', status: 'New', completed: 1, budget: '$19.8m', progress: 15, returnRate: '18.9%', headlineMilestone: 'Feasibility sign-off underway', stats: 'Serviced apartments', description: 'A serviced-apartment opportunity in Downtown Dubai targeting strong short-stay yields and capital appreciation.' },
  { name: 'Hyderabad Green Acres', location: 'Hyderabad, India', category: 'Property – India', status: 'In Development', completed: 2, budget: '$10.6m', progress: 34, returnRate: '22.4%', headlineMilestone: 'DA / planning approval', stats: '9 acres • Residential', description: 'A residential land parcel on the Hyderabad growth fringe, positioned for plotted development and phased release.' },
  { name: 'Seaford Meadows Stage 3', location: 'Seaford, SA', category: 'Residential Land', status: 'In Development', completed: 4, budget: '$26.3m', progress: 63, returnRate: '15.9%', headlineMilestone: 'Civil works in progress', stats: '54 lots • Coastal', description: 'The next stage of a proven coastal community, extending an established masterplan with high buyer demand.' },
  { name: 'Logistics Park West', location: 'Melbourne, VIC', category: 'Commercial Land', status: 'New', completed: 0, budget: '$41.2m', progress: 8, returnRate: '13.8%', headlineMilestone: 'Land settlement pending', stats: '18 ha • Industrial', description: 'A large-format industrial and logistics land holding aligned to freight infrastructure and last-mile demand.' },
  { name: 'Barossa Vineyard Estate', location: 'Barossa Valley, SA', category: 'Farming Land', status: 'In Development', completed: 3, budget: '$12.9m', progress: 49, returnRate: '18.3%', headlineMilestone: 'Construction certificate stage', stats: '85 acres • Viticulture', description: 'Premium viticultural land combining agricultural yield with tourism and cellar-door development potential.' },
  { name: 'Marina Bay Towers', location: 'Dubai, UAE', category: 'Dubai Property', status: 'Completed', completed: 7, budget: '$36.5m', progress: 100, returnRate: '19.7%', headlineMilestone: 'Sold & settled', stats: 'Waterfront apartments', description: 'A completed waterfront residential tower delivered with a premium partner and fully realised investor exits.' },
  { name: 'Pune Ridgeview', location: 'Pune, India', category: 'Property – India', status: 'New', completed: 1, budget: '$8.9m', progress: 12, returnRate: '23.1%', headlineMilestone: 'Feasibility sign-off underway', stats: '5 acres • Residential', description: 'A hillside residential parcel near Pune with strong lifestyle appeal and infrastructure momentum.' },
  { name: 'Two Wells Release', location: 'Two Wells, SA', category: 'Residential Land', status: 'In Development', completed: 5, budget: '$29.7m', progress: 71, returnRate: '16.8%', headlineMilestone: 'Subdivision registration next', stats: '62 lots • Growth corridor', description: 'An affordable land release in a designated growth area with staged delivery and strong first-home-buyer demand.' },
  { name: 'Edinburgh Business Park', location: 'Edinburgh, SA', category: 'Commercial Land', status: 'In Development', completed: 4, budget: '$22.4m', progress: 58, returnRate: '15.5%', headlineMilestone: 'Civil works in progress', stats: '7.5 ha • Enterprise', description: 'An enterprise park serving defence, logistics and advanced manufacturing tenants in northern Adelaide.' },
  { name: 'Riverland Orchards', location: 'Renmark, SA', category: 'Farming Land', status: 'Completed', completed: 7, budget: '$6.8m', progress: 100, returnRate: '21.5%', headlineMilestone: 'Realised & distributed', stats: '260 acres • Horticulture', description: 'A completed horticultural holding delivering irrigated orchard income and a successful investor exit.' },
  { name: 'Business Bay Offices', location: 'Dubai, UAE', category: 'Dubai Property', status: 'In Development', completed: 3, budget: '$27.1m', progress: 46, returnRate: '16.9%', headlineMilestone: 'Construction certificate stage', stats: 'Commercial floors', description: 'A commercial office opportunity in Business Bay targeting institutional tenants and stable long-term yield.' },
  { name: 'Chennai Coastal Land', location: 'Chennai, India', category: 'Property – India', status: 'In Development', completed: 2, budget: '$11.3m', progress: 31, returnRate: '20.6%', headlineMilestone: 'DA / planning approval', stats: '7 acres • Mixed-use', description: 'A coastal mixed-use land holding near Chennai positioned for residential and hospitality development.' },
  { name: 'Angle Vale Fields', location: 'Angle Vale, SA', category: 'Residential Land', status: 'New', completed: 1, budget: '$17.6m', progress: 20, returnRate: '17.4%', headlineMilestone: 'Feasibility sign-off underway', stats: '33 lots • Semi-rural', description: 'A semi-rural residential release blending larger allotments with proximity to established township services.' },
  { name: 'Truganina Distribution', location: 'Truganina, VIC', category: 'Commercial Land', status: 'In Development', completed: 3, budget: '$38.9m', progress: 53, returnRate: '14.2%', headlineMilestone: 'Construction certificate stage', stats: '15 ha • Warehousing', description: 'A prime distribution and warehousing precinct in Melbourne’s west with strong pre-commitment interest.' },
  { name: 'Adelaide Hills Retreat', location: 'Stirling, SA', category: 'Other', status: 'New', completed: 0, budget: '$5.9m', progress: 6, returnRate: '19.0%', headlineMilestone: 'Land settlement pending', stats: 'Eco-tourism land', description: 'An eco-tourism and short-stay opportunity in the Adelaide Hills, blending conservation with hospitality income.' },
]

// Target/actual date pools by milestone index for a bit of realism.
const TARGETS = ['May 2024', 'Aug 2024', 'Dec 2024', 'Apr 2025', 'Oct 2025', 'Mar 2026', 'Sep 2026']
const ACTUALS: (string | null)[] = ['May 2024', 'Sep 2024', 'Jan 2025', 'May 2025', 'Nov 2025', 'Apr 2026', 'Sep 2026']

function riskSetFor(category: ProjectCategory): Risk[] {
  const risks: Risk[] = [
    risk('Approvals & Regulatory', 'Potential DA delays or council objections during assessment.', 'Monitoring', 'Early pre-lodgement meetings held; planner engaged to manage RFIs.'),
    risk('Financial & Market', 'Infrastructure costs may exceed initial estimate; interest-rate exposure.', 'Open', 'Contingency held in feasibility; fixed-price contracts where possible.'),
    risk('Programme & Delivery', 'Consultant or contractor delays affecting registration timing.', 'Monitoring', 'Critical-path schedule maintained; key contractors locked in early.'),
  ]
  if (category === 'Residential Land' || category === 'Farming Land') {
    risks.push(risk('Technical & Design', 'Unexpected site conditions or easements limiting layout.', 'Open', 'Geotechnical and survey investigations completed pre-design.'))
  }
  return risks
}

function feasibilityFor(p: SeedProject) {
  const cost = p.budget
  return {
    totalCost: cost,
    projectedRevenue: p.budget.replace(/[\d.]+/, (n) => (Number(n) * 1.32).toFixed(1)),
    netReturn: p.returnRate,
    irr: p.returnRate,
    timeline: p.status === 'Completed' ? 'Delivered' : '24–36 months',
    keyRisks: 'Approvals timing, infrastructure cost, market conditions at sales.',
    summary: `Feasibility assessment for ${p.name} indicates a viable return profile of ${p.returnRate} supported by strong demand fundamentals and a disciplined delivery plan.`,
    attachedFile: `${p.name.replace(/[^a-z0-9]+/gi, '_')}_Feasibility.pdf`,
    signedOff: p.completed >= 2,
  }
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const seedProjects: Project[] = SEED_PROJECTS.map((p, index) => ({
  id: slug(p.name),
  name: p.name,
  location: p.location,
  category: p.category,
  status: p.status,
  image: IMAGES[index % IMAGES.length],
  description: p.description,
  stats: p.stats,
  budget: p.budget,
  progress: p.progress,
  returnRate: p.returnRate,
  headlineMilestone: p.headlineMilestone,
  documents: [
    { name: 'Feasibility summary', type: 'PDF', date: 'Jun 2025' },
    { name: 'Investor update pack', type: 'PDF', date: 'Aug 2026' },
    { name: 'Site & planning overview', type: 'PDF', date: 'Mar 2026' },
  ],
  milestones: makeMilestones(p.completed, TARGETS, ACTUALS),
  risks: riskSetFor(p.category),
  feasibility: feasibilityFor(p),
}))

export const seedInvestors: Investor[] = [
  {
    id: 'inv-1',
    name: 'Priya Sharma',
    email: 'investor@aeg.demo',
    joined: 'Mar 2023',
    holdings: [
      { projectId: 'willowbank-estate', units: 40, amount: '$400,000' },
      { projectId: 'riverstone-rise', units: 25, amount: '$250,000' },
      { projectId: 'gawler-green', units: 30, amount: '$300,000' },
    ],
  },
  {
    id: 'inv-2',
    name: 'James Whitfield',
    email: 'james@aeg.demo',
    joined: 'Jul 2022',
    holdings: [
      { projectId: 'palm-jumeirah-residences', units: 60, amount: '$600,000' },
      { projectId: 'marina-bay-towers', units: 45, amount: '$450,000' },
    ],
  },
  {
    id: 'inv-3',
    name: 'Meera Nair',
    email: 'meera@aeg.demo',
    joined: 'Jan 2024',
    holdings: [
      { projectId: 'bengaluru-tech-park-land', units: 20, amount: '$200,000' },
      { projectId: 'hyderabad-green-acres', units: 15, amount: '$150,000' },
    ],
  },
]

export const demoAccounts: DemoAccount[] = [
  { id: 'acc-admin', name: 'Alex Morgan', email: 'admin@aeg.demo', role: 'admin' },
  { id: 'acc-staff', name: 'Sam Taylor', email: 'staff@aeg.demo', role: 'staff' },
  { id: 'acc-investor', name: 'Priya Sharma', email: 'investor@aeg.demo', role: 'investor', investorId: 'inv-1' },
]

export const seedContacts: Contact[] = [
  { id: 'c-1', name: 'Rebecca Lawson', role: 'Legal / Lawyer', organisation: 'Lawson & Co Legal', email: 'rebecca@lawsonlegal.au', phone: '+61 2 8000 1001', visibleTo: ['admin', 'staff'] },
  { id: 'c-2', name: 'David Chen', role: 'Accountant (Corporate)', organisation: 'Chen Advisory', email: 'david@chenadvisory.au', phone: '+61 2 8000 1002', visibleTo: ['admin', 'staff'] },
  { id: 'c-3', name: 'Michael OBrien', role: 'Project Manager', organisation: 'AEG Delivery', email: 'michael@allianceestate.com.au', phone: '+61 2 8000 1003', visibleTo: ['admin', 'staff', 'investor'] },
  { id: 'c-4', name: 'Territory Civil Pty Ltd', role: 'Contractor — Civil', organisation: 'Territory Civil', email: 'ops@territorycivil.au', phone: '+61 2 8000 1004', visibleTo: ['admin', 'staff'] },
  { id: 'c-5', name: 'Ashford Surveyors', role: 'Surveyor', organisation: 'Ashford Survey Group', email: 'survey@ashford.au', phone: '+61 2 8000 1005', visibleTo: ['admin', 'staff'] },
  { id: 'c-6', name: 'Baseline Engineering', role: 'Engineer', organisation: 'Baseline Eng', email: 'hello@baselineeng.au', phone: '+61 2 8000 1006', visibleTo: ['admin', 'staff'] },
  { id: 'c-7', name: 'Anil Kapoor', role: 'India Admin', organisation: 'AEG India Support', email: 'anil@aeg-india.in', phone: '+91 80 4000 2001', visibleTo: ['admin', 'staff'] },
  { id: 'c-8', name: 'Sarah Bank (NAB)', role: 'Banker', organisation: 'National Australia Bank', email: 'sarah.b@nab.com.au', phone: '+61 2 8000 1008', visibleTo: ['admin'] },
]

export const seedUnitTrust: UnitTrustEntry[] = [
  { projectId: 'gawler-green', totalUnits: 200, unitPrice: '$10,000', exitStatus: 'Signed off', exitTiming: 'Completed Q1 2026', distributions: '$2.4m distributed', signOff: 'Trustee signed 12 Feb 2026' },
  { projectId: 'marina-bay-towers', totalUnits: 320, unitPrice: '$12,000', exitStatus: 'Distributing', exitTiming: 'Q3 2026', distributions: '$1.8m of $3.6m', signOff: 'Pending final distribution' },
  { projectId: 'riverland-orchards', totalUnits: 150, unitPrice: '$9,000', exitStatus: 'Signed off', exitTiming: 'Completed Q4 2025', distributions: '$1.1m distributed', signOff: 'Trustee signed 08 Dec 2025' },
  { projectId: 'riverstone-rise', totalUnits: 280, unitPrice: '$10,000', exitStatus: 'In progress', exitTiming: 'Est. Q2 2027', distributions: 'Not yet commenced', signOff: 'Not started' },
  { projectId: 'willowbank-estate', totalUnits: 180, unitPrice: '$10,000', exitStatus: 'Not started', exitTiming: 'Est. 2028', distributions: 'Not yet commenced', signOff: 'Not started' },
]

export const seedEnquiries: Enquiry[] = [
  { id: 'enq-1', name: 'Priya Sharma', email: 'investor@aeg.demo', subject: 'Willowbank timeline', message: 'Could you share an updated timeline for the DA approval on Willowbank Estate?', projectId: 'willowbank-estate', source: 'investor-portal', status: 'New', date: '2026-09-15' },
  { id: 'enq-2', name: 'Tom Alberts', email: 'tom@example.com', subject: 'New investor interest', message: 'I would like to learn more about upcoming residential opportunities in SA.', projectId: null, source: 'public-contact', status: 'New', date: '2026-09-18' },
]

export const seedBroadcasts: Broadcast[] = [
  { id: 'bc-1', title: 'Q3 2026 Portfolio Update', body: 'Across the portfolio we have progressed civil works on three residential releases and completed the Marina Bay Towers exit. Full reporting is available in your documents area.', audience: 'All investors', projectId: null, date: '2026-09-10' },
  { id: 'bc-2', title: 'Gawler Green fully settled', body: 'Gawler Green has now reached final lot settlement with an investor return of 20.2%. Distribution statements have been issued.', audience: 'Project investors', projectId: 'gawler-green', date: '2026-08-22' },
  { id: 'bc-3', title: 'Riverstone Rise nearing subdivision', body: 'Riverstone Rise is approaching subdivision registration, with new titles expected next quarter.', audience: 'Project investors', projectId: 'riverstone-rise', date: '2026-07-30' },
]

export const seedFeedback: Feedback[] = [
  { id: 'fb-1', name: 'Meera Nair', rating: 5, comment: 'Clear reporting and transparent communication throughout. Very confident in the process.', date: '2026-09-02' },
  { id: 'fb-2', name: 'James Whitfield', rating: 4, comment: 'Strong project pipeline and good milestone visibility. Would like even more frequent updates.', date: '2026-08-14' },
]
