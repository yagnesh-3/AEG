import { projects } from '@/data/projects';
import type { DocumentKind, ProjectDocument, ProjectUpdate } from '@/types';

const TODAY = new Date().toISOString().slice(0, 10);
/** Seeded artefacts are never dated in the future. */
const clampToday = (iso: string) => (iso > TODAY ? TODAY : iso);

interface DocTemplate {
  name: string;
  kind: DocumentKind;
  investorVisible: boolean;
  /** Milestone index (0-6) that must be reached before this document exists. */
  after: number;
}

const DOC_TEMPLATES: DocTemplate[] = [
  { name: 'Feasibility Report', kind: 'feasibility', investorVisible: true, after: 0 },
  { name: 'Contract of Sale — Land', kind: 'contract', investorVisible: false, after: 0 },
  { name: 'Title Search & Zoning Certificate', kind: 'title', investorVisible: true, after: 0 },
  { name: 'Detail & Contour Survey', kind: 'survey', investorVisible: false, after: 1 },
  { name: 'Geotechnical Investigation Report', kind: 'survey', investorVisible: false, after: 1 },
  { name: 'Investor Information Memorandum', kind: 'investor-update', investorVisible: true, after: 1 },
  { name: 'DA Submission Package', kind: 'da-submission', investorVisible: true, after: 2 },
  { name: 'Notice of Determination', kind: 'da-submission', investorVisible: true, after: 2 },
  { name: 'Civil Engineering Drawings', kind: 'engineering', investorVisible: false, after: 3 },
  { name: 'Construction Certificate', kind: 'engineering', investorVisible: true, after: 3 },
  { name: 'Civil Works Progress Claim Schedule', kind: 'financial', investorVisible: false, after: 4 },
  { name: 'Practical Completion Certificate', kind: 'engineering', investorVisible: true, after: 4 },
  { name: 'Plan of Subdivision — Registered', kind: 'title', investorVisible: true, after: 5 },
  { name: 'Sales & Marketing Plan', kind: 'marketing', investorVisible: true, after: 5 },
  { name: 'Settlement Statement Summary', kind: 'financial', investorVisible: true, after: 6 },
];

function hash(value: string): number {
  let h = 7;
  for (let i = 0; i < value.length; i += 1) h = (h * 33 + value.charCodeAt(i)) >>> 0;
  return h;
}

const UPLOADERS = ['Daniel Whitmore', 'Priya Raghavan', 'Marcus Chen', 'Sarah Kowalski', 'Anita Desai'];

export const documents: ProjectDocument[] = projects.flatMap((project) => {
  const seed = hash(project.id);
  const reached = project.milestones.reduce(
    (max, m, i) => (m.status !== 'not-started' ? i : max),
    -1,
  );

  return DOC_TEMPLATES.filter((t) => t.after <= reached).map((template, i) => {
    const anchor = project.milestones[template.after]!;
    const uploaded = new Date(anchor.actualDate ?? anchor.targetDate);
    uploaded.setDate(uploaded.getDate() - ((seed + i * 13) % 30));

    return {
      id: `d-${project.id}-${i + 1}`,
      projectId: project.id,
      name: `${project.name} — ${template.name}.pdf`,
      kind: template.kind,
      sizeKb: 180 + ((seed + i * 271) % 5400),
      uploadedOn: clampToday(uploaded.toISOString().slice(0, 10)),
      uploadedBy: UPLOADERS[(seed + i) % UPLOADERS.length]!,
      investorVisible: template.investorVisible,
    };
  });
});

/* ---------- Project updates ---------- */

interface UpdateTemplate {
  title: string;
  body: string;
  after: number;
  investorVisible: boolean;
}

const UPDATE_TEMPLATES: UpdateTemplate[] = [
  {
    title: 'Land settlement completed',
    body: 'Settlement has completed and the site is now secured in the project entity. Survey and geotechnical investigations are being booked, and the project manager has issued the consultant engagement schedule.',
    after: 0,
    investorVisible: true,
  },
  {
    title: 'Feasibility approved by investors',
    body: 'The feasibility report has been signed off, confirming the development budget, forecast returns and delivery programme. A copy is available in your document library.',
    after: 1,
    investorVisible: true,
  },
  {
    title: 'Development application lodged with council',
    body: 'The DA package has been lodged. Council assessment typically runs 90–120 days; we will report on any requests for further information as they arise.',
    after: 2,
    investorVisible: true,
  },
  {
    title: 'Construction certificate issued',
    body: 'Engineering documentation has been approved and the construction certificate issued. The civil contractor has been appointed and mobilisation is scheduled.',
    after: 3,
    investorVisible: true,
  },
  {
    title: 'Civil works progressing on programme',
    body: 'Roads, drainage and service trenching are progressing in line with the construction programme. Weekly site inspections continue with no significant variations recorded this period.',
    after: 4,
    investorVisible: true,
  },
  {
    title: 'Subdivision plan lodged for registration',
    body: 'The final plan of subdivision has been lodged for registration. Once new titles issue, contracted lots move to settlement within 21 days.',
    after: 5,
    investorVisible: true,
  },
  {
    title: 'Lots settling and proceeds realised',
    body: 'Settlements are underway and sales proceeds are being realised. Distribution timing will be confirmed with unit holders once the settlement programme completes.',
    after: 6,
    investorVisible: true,
  },
  {
    title: 'Internal cost review — contingency position',
    body: 'Quarterly internal review of actual versus budget. Contingency drawdown remains within tolerance; variation register reviewed with the quantity surveyor.',
    after: 3,
    investorVisible: false,
  },
];

export const projectUpdates: ProjectUpdate[] = projects.flatMap((project) => {
  const seed = hash(`${project.id}-u`);

  return UPDATE_TEMPLATES.filter((t) => project.milestones[t.after]?.status !== 'not-started').map(
    (template, i) => {
      const anchor = project.milestones[template.after]!;
      const posted = new Date(anchor.actualDate ?? anchor.targetDate);
      posted.setDate(posted.getDate() + ((seed + i * 7) % 14));

      return {
        id: `u-${project.id}-${i + 1}`,
        projectId: project.id,
        title: template.title,
        body: template.body,
        postedOn: clampToday(posted.toISOString().slice(0, 10)),
        postedBy: project.projectManager,
        investorVisible: template.investorVisible,
      };
    },
  );
});
