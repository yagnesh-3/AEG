import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as seed from '@/data';
import { makeTicketCode } from '@/data';
import { loadState, saveState, clearState } from '@/store/storage';
import type {
  Broadcast,
  Enquiry,
  EventRsvp,
  Feasibility,
  FeedbackEntry,
  Investor,
  Milestone,
  MilestoneCode,
  Project,
  ProjectDocument,
  ProjectUpdate,
  Resource,
  Risk,
  UnitHolding,
  UnitTrust,
  ExitProcess,
} from '@/types';

interface DataState {
  projects: Project[];
  risks: Risk[];
  documents: ProjectDocument[];
  projectUpdates: ProjectUpdate[];
  investors: Investor[];
  trusts: UnitTrust[];
  holdings: UnitHolding[];
  exitProcesses: ExitProcess[];
  feasibilities: Feasibility[];
  resources: Resource[];
  broadcasts: Broadcast[];
  enquiries: Enquiry[];
  feedbackEntries: FeedbackEntry[];
  eventRsvps: EventRsvp[];
}

const SEED: DataState = {
  projects: seed.projects,
  risks: seed.risks,
  documents: seed.documents,
  projectUpdates: seed.projectUpdates,
  investors: seed.investors,
  trusts: seed.trusts,
  holdings: seed.holdings,
  exitProcesses: seed.exitProcesses,
  feasibilities: seed.feasibilities,
  resources: seed.resources,
  broadcasts: seed.broadcasts,
  enquiries: seed.enquiries,
  feedbackEntries: seed.feedbackEntries,
  eventRsvps: seed.eventRsvps,
};

interface DataValue extends DataState {
  /* Projects */
  addProject: (project: Project) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  setMilestone: (projectId: string, code: MilestoneCode, patch: Partial<Milestone>) => void;
  /* Risks */
  addRisk: (risk: Risk) => void;
  updateRisk: (id: string, patch: Partial<Risk>) => void;
  /* Updates & feasibility */
  addProjectUpdate: (update: ProjectUpdate) => void;
  upsertFeasibility: (feasibility: Feasibility) => void;
  /* Communications */
  addBroadcast: (broadcast: Broadcast) => void;
  addEnquiry: (enquiry: Enquiry) => void;
  replyToEnquiry: (enquiryId: string, body: string, author: string) => void;
  setEnquiryStatus: (enquiryId: string, status: Enquiry['status']) => void;
  /* Website & event */
  addFeedback: (entry: FeedbackEntry) => void;
  addRsvp: (rsvp: Omit<EventRsvp, 'id' | 'ticketCode' | 'rsvpOn' | 'status'>) => EventRsvp;
  setRsvpStatus: (id: string, status: EventRsvp['status']) => void;
  /* Session */
  resetData: () => void;
}

const DataContext = createContext<DataValue | null>(null);

const STORAGE_KEY = 'data';

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(() => {
    const stored = loadState<Partial<DataState> | null>(STORAGE_KEY, null);
    // Merge so a seed file gaining a new collection does not break a stored session.
    return stored ? { ...SEED, ...stored } : SEED;
  });

  useEffect(() => {
    saveState(STORAGE_KEY, state);
  }, [state]);

  const patchList = useCallback(
    <K extends keyof DataState>(key: K, updater: (list: DataState[K]) => DataState[K]) => {
      setState((prev) => ({ ...prev, [key]: updater(prev[key]) }));
    },
    [],
  );

  const value = useMemo<DataValue>(() => {
    const setMilestoneStatus = (milestone: Milestone, patch: Partial<Milestone>): Milestone => {
      const next = { ...milestone, ...patch };
      // Completing a milestone stamps today's date unless one was supplied.
      if (patch.status === 'complete' && !patch.actualDate && !milestone.actualDate) {
        next.actualDate = new Date().toISOString().slice(0, 10);
      }
      if (patch.status && patch.status !== 'complete') next.actualDate = null;
      return next;
    };

    return {
      ...state,

      addProject: (project) => patchList('projects', (list) => [project, ...list]),

      updateProject: (id, patch) =>
        patchList('projects', (list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p))),

      setMilestone: (projectId, code, patch) =>
        patchList('projects', (list) =>
          list.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  milestones: p.milestones.map((m) =>
                    m.code === code ? setMilestoneStatus(m, patch) : m,
                  ),
                }
              : p,
          ),
        ),

      addRisk: (risk) => patchList('risks', (list) => [risk, ...list]),

      updateRisk: (id, patch) =>
        patchList('risks', (list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r))),

      addProjectUpdate: (update) => patchList('projectUpdates', (list) => [update, ...list]),

      upsertFeasibility: (feasibility) =>
        patchList('feasibilities', (list) => {
          const exists = list.some((f) => f.id === feasibility.id);
          return exists ? list.map((f) => (f.id === feasibility.id ? feasibility : f)) : [feasibility, ...list];
        }),

      addBroadcast: (broadcast) => patchList('broadcasts', (list) => [broadcast, ...list]),

      addEnquiry: (enquiry) => patchList('enquiries', (list) => [enquiry, ...list]),

      replyToEnquiry: (enquiryId, body, author) =>
        patchList('enquiries', (list) =>
          list.map((e) =>
            e.id === enquiryId
              ? {
                  ...e,
                  status: 'answered',
                  messages: [
                    ...e.messages,
                    {
                      id: `em-${Date.now()}`,
                      author,
                      authorRole: 'aeg' as const,
                      body,
                      sentOn: new Date().toISOString().slice(0, 10),
                    },
                  ],
                }
              : e,
          ),
        ),

      setEnquiryStatus: (enquiryId, status) =>
        patchList('enquiries', (list) =>
          list.map((e) => (e.id === enquiryId ? { ...e, status } : e)),
        ),

      addFeedback: (entry) => patchList('feedbackEntries', (list) => [entry, ...list]),

      addRsvp: (input) => {
        const rsvp: EventRsvp = {
          ...input,
          id: `rsvp-${Date.now()}`,
          ticketCode: makeTicketCode(`${input.email}-${Date.now()}`),
          rsvpOn: new Date().toISOString().slice(0, 10),
          status: 'confirmed',
        };
        patchList('eventRsvps', (list) => [rsvp, ...list]);
        return rsvp;
      },

      setRsvpStatus: (id, status) =>
        patchList('eventRsvps', (list) => list.map((r) => (r.id === id ? { ...r, status } : r))),

      resetData: () => {
        clearState();
        setState(SEED);
      },
    };
  }, [state, patchList]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

/* ---------- Focused selector hooks ---------- */

export function useProject(idOrSlug: string | undefined) {
  const { projects } = useData();
  return projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export function useProjectRisks(projectId: string | undefined) {
  const { risks } = useData();
  return useMemo(() => risks.filter((r) => r.projectId === projectId), [risks, projectId]);
}

export function useProjectDocuments(projectId: string | undefined) {
  const { documents } = useData();
  return useMemo(() => documents.filter((d) => d.projectId === projectId), [documents, projectId]);
}

export function useProjectUpdates(projectId: string | undefined) {
  const { projectUpdates } = useData();
  return useMemo(
    () =>
      projectUpdates
        .filter((u) => u.projectId === projectId)
        .sort((a, b) => b.postedOn.localeCompare(a.postedOn)),
    [projectUpdates, projectId],
  );
}

export function useProjectFeasibility(projectId: string | undefined) {
  const { feasibilities } = useData();
  return feasibilities.find((f) => f.projectId === projectId);
}

/** Every project an investor is exposed to, via their trust holdings. */
export function useInvestorProjects(investorId: string | undefined) {
  const { holdings, trusts, projects } = useData();
  return useMemo(() => {
    if (!investorId) return [];
    const trustIds = holdings.filter((h) => h.investorId === investorId).map((h) => h.trustId);
    const projectIds = new Set(
      trusts.filter((t) => trustIds.includes(t.id)).flatMap((t) => t.projectIds),
    );
    return projects.filter((p) => projectIds.has(p.id));
  }, [investorId, holdings, trusts, projects]);
}

/** Investors exposed to a project, with the units they hold in the relevant trust. */
export function useProjectInvestors(projectId: string | undefined) {
  const { holdings, trusts, investors } = useData();
  return useMemo(() => {
    if (!projectId) return [];
    const trustIds = trusts.filter((t) => t.projectIds.includes(projectId)).map((t) => t.id);
    return holdings
      .filter((h) => trustIds.includes(h.trustId))
      .map((h) => ({ holding: h, investor: investors.find((i) => i.id === h.investorId) }))
      .filter((row): row is { holding: UnitHolding; investor: Investor } => Boolean(row.investor));
  }, [projectId, holdings, trusts, investors]);
}
