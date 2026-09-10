import { investors } from '@/data/investors';
import type { ExitProcess, ExitStage, ExitStep, MilestoneStatus, UnitHolding, UnitTrust } from '@/types';

export const trusts: UnitTrust[] = [
  {
    id: 't-01',
    name: 'AEG Northwest Land Trust No.1',
    abn: '48 217 604 331',
    status: 'active',
    trustee: 'AEG Trustee Services Pty Ltd',
    establishedOn: '2021-11-02',
    projectIds: ['p-01', 'p-02', 'p-09'],
    totalUnits: 14_100,
    unitPrice: 1_000,
  },
  {
    id: 't-02',
    name: 'AEG Adelaide Growth Trust',
    abn: '62 449 118 207',
    status: 'active',
    trustee: 'AEG Trustee Services Pty Ltd',
    establishedOn: '2022-06-14',
    projectIds: ['p-05', 'p-07'],
    totalUnits: 8_400,
    unitPrice: 1_000,
  },
  {
    id: 't-03',
    name: 'AEG Commercial Holdings Trust',
    abn: '71 302 885 490',
    status: 'active',
    trustee: 'AEG Trustee Services Pty Ltd',
    establishedOn: '2023-02-20',
    projectIds: ['p-11', 'p-12', 'p-15'],
    totalUnits: 23_300,
    unitPrice: 1_000,
  },
  {
    id: 't-04',
    name: 'AEG Rural Land Trust',
    abn: '35 776 210 664',
    status: 'active',
    trustee: 'AEG Trustee Services Pty Ltd',
    establishedOn: '2022-09-08',
    projectIds: ['p-16', 'p-17', 'p-18'],
    totalUnits: 18_300,
    unitPrice: 1_000,
  },
  {
    id: 't-05',
    name: 'AEG International Trust',
    abn: '19 508 337 142',
    status: 'active',
    trustee: 'AEG Trustee Services Pty Ltd',
    establishedOn: '2023-04-11',
    projectIds: ['p-21', 'p-22', 'p-24', 'p-25'],
    totalUnits: 29_700,
    unitPrice: 1_000,
  },
  {
    id: 't-06',
    name: 'AEG Riverstone Trust',
    abn: '84 663 029 517',
    status: 'winding-up',
    trustee: 'AEG Trustee Services Pty Ltd',
    establishedOn: '2021-08-30',
    projectIds: ['p-03'],
    totalUnits: 3_200,
    unitPrice: 1_000,
  },
  {
    id: 't-07',
    name: 'AEG Legacy Trust No.1',
    abn: '27 194 552 806',
    status: 'closed',
    trustee: 'AEG Trustee Services Pty Ltd',
    establishedOn: '2020-05-19',
    projectIds: ['p-06', 'p-14', 'p-19'],
    totalUnits: 13_800,
    unitPrice: 1_000,
  },
  {
    id: 't-08',
    name: 'AEG Leppington Trust',
    abn: '56 811 470 923',
    status: 'forming',
    trustee: 'AEG Trustee Services Pty Ltd',
    establishedOn: '2025-01-15',
    projectIds: ['p-04', 'p-08'],
    totalUnits: 16_500,
    unitPrice: 1_000,
  },
];

function hash(value: string): number {
  let h = 11;
  for (let i = 0; i < value.length; i += 1) h = (h * 37 + value.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Allocate each trust's units across a deterministic slice of the investor
 * register, so unit counts always reconcile to `totalUnits`.
 */
export const holdings: UnitHolding[] = trusts.flatMap((trust, ti) => {
  const eligible = investors.filter((inv) => inv.status !== 'prospective');
  const count = 6 + (hash(trust.id) % 7); // 6-12 holders per trust
  const picked = Array.from({ length: count }, (_, i) => eligible[(ti * 5 + i * 3) % eligible.length]!);
  const unique = Array.from(new Map(picked.map((p) => [p.id, p])).values());

  const weights = unique.map((inv, i) => 1 + ((hash(inv.id + trust.id) + i) % 5));
  const weightTotal = weights.reduce((a, b) => a + b, 0);

  let allocated = 0;
  return unique.map((investor, i) => {
    const isLast = i === unique.length - 1;
    const units = isLast
      ? trust.totalUnits - allocated
      : Math.round((trust.totalUnits * weights[i]!) / weightTotal / 100) * 100;
    allocated += units;

    const committed = units * trust.unitPrice;
    // Only active/closing trusts have paid distributions.
    const distributionRate =
      trust.status === 'closed' ? 1.28 : trust.status === 'winding-up' ? 0.62 : 0.08;

    const issued = new Date(trust.establishedOn);
    issued.setDate(issued.getDate() + 20 + ((hash(investor.id) + i * 17) % 210));

    return {
      id: `h-${trust.id}-${investor.id}`,
      trustId: trust.id,
      investorId: investor.id,
      units,
      committed,
      distributionsPaid: Math.round(committed * distributionRate),
      issuedOn: issued.toISOString().slice(0, 10),
    };
  });
});

/* ---------- Exit processes ---------- */

const EXIT_ORDER: ExitStage[] = ['valuation', 'sale-settlement', 'distribution', 'sign-off', 'complete'];

function buildSteps(stage: ExitStage, openedOn: string, target: string): ExitStep[] {
  const reached = EXIT_ORDER.indexOf(stage);
  const start = new Date(openedOn).getTime();
  const end = new Date(target).getTime();

  return EXIT_ORDER.map((s, i) => {
    const status: MilestoneStatus = i < reached ? 'complete' : i === reached ? 'in-progress' : 'not-started';
    const targetDate = new Date(start + ((end - start) * (i + 1)) / EXIT_ORDER.length)
      .toISOString()
      .slice(0, 10);
    return {
      stage: s,
      status,
      targetDate,
      actualDate: status === 'complete' ? targetDate : null,
    };
  });
}

interface ExitSeed {
  id: string;
  trustId: string;
  projectId: string;
  stage: ExitStage;
  openedOn: string;
  targetCompletion: string;
  pool: number;
  paidPct: number;
  note: string;
}

const EXIT_SEEDS: ExitSeed[] = [
  {
    id: 'x-01',
    trustId: 't-06',
    projectId: 'p-03',
    stage: 'distribution',
    openedOn: '2024-05-06',
    targetCompletion: '2026-02-27',
    pool: 4_640_000,
    paidPct: 62,
    note: 'All 26 lots settled. Second distribution tranche scheduled once the final tax position is confirmed by the corporate accountant.',
  },
  {
    id: 'x-02',
    trustId: 't-07',
    projectId: 'p-06',
    stage: 'complete',
    openedOn: '2023-06-12',
    targetCompletion: '2024-09-30',
    pool: 3_712_000,
    paidPct: 100,
    note: 'Exit finalised. Units cancelled and final distribution statements issued to all holders.',
  },
  {
    id: 'x-03',
    trustId: 't-07',
    projectId: 'p-14',
    stage: 'complete',
    openedOn: '2024-02-05',
    targetCompletion: '2025-01-31',
    pool: 5_304_000,
    paidPct: 100,
    note: 'Institutional sale settled and proceeds distributed in full.',
  },
  {
    id: 'x-04',
    trustId: 't-07',
    projectId: 'p-19',
    stage: 'sign-off',
    openedOn: '2024-09-10',
    targetCompletion: '2026-03-31',
    pool: 2_988_000,
    paidPct: 88,
    note: 'Divestment to agri-fund complete. Awaiting trustee sign-off on the final accounts before unit cancellation.',
  },
  {
    id: 'x-05',
    trustId: 't-02',
    projectId: 'p-05',
    stage: 'sale-settlement',
    openedOn: '2025-06-02',
    targetCompletion: '2026-12-18',
    pool: 6_120_000,
    paidPct: 14,
    note: 'Stage one lots settling progressively. Stage two sell-down must complete before the distribution stage can open.',
  },
  {
    id: 'x-06',
    trustId: 't-05',
    projectId: 'p-22',
    stage: 'valuation',
    openedOn: '2025-08-18',
    targetCompletion: '2027-11-30',
    pool: 7_800_000,
    paidPct: 0,
    note: 'Independent valuations commissioned for all six villas ahead of the staged 2027 exit.',
  },
];

export const exitProcesses: ExitProcess[] = EXIT_SEEDS.map((seed) => ({
  id: seed.id,
  trustId: seed.trustId,
  projectId: seed.projectId,
  stage: seed.stage,
  openedOn: seed.openedOn,
  targetCompletion: seed.targetCompletion,
  distributionPool: seed.pool,
  distributionPaid: Math.round(seed.pool * (seed.paidPct / 100)),
  steps: buildSteps(seed.stage, seed.openedOn, seed.targetCompletion),
  note: seed.note,
}));
