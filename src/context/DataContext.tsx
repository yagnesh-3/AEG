// Client-side mock data store. Seeds from data/seed.ts on first load, then
// mirrors all state to localStorage so demo mutations survive a refresh.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  Broadcast,
  Contact,
  Enquiry,
  Feedback,
  Investor,
  Milestone,
  Project,
  Risk,
  UnitTrustEntry,
} from '../types'
import {
  seedBroadcasts,
  seedContacts,
  seedEnquiries,
  seedFeedback,
  seedInvestors,
  seedProjects,
  seedUnitTrust,
} from '../data/seed'

type Store = {
  projects: Project[]
  investors: Investor[]
  contacts: Contact[]
  unitTrust: UnitTrustEntry[]
  enquiries: Enquiry[]
  broadcasts: Broadcast[]
  feedback: Feedback[]
}

function seedStore(): Store {
  return {
    projects: seedProjects,
    investors: seedInvestors,
    contacts: seedContacts,
    unitTrust: seedUnitTrust,
    enquiries: seedEnquiries,
    broadcasts: seedBroadcasts,
    feedback: seedFeedback,
  }
}

type DataContextValue = Store & {
  getProject: (id: string) => Project | undefined
  addProject: (project: Project) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  updateMilestone: (projectId: string, milestoneId: string, patch: Partial<Milestone>) => void
  addRisk: (projectId: string, risk: Risk) => void
  updateRisk: (projectId: string, riskId: string, patch: Partial<Risk>) => void
  updateFeasibility: (projectId: string, patch: Partial<Project['feasibility']>) => void
  updateUnitTrust: (projectId: string, patch: Partial<UnitTrustEntry>) => void
  addEnquiry: (enquiry: Enquiry) => void
  respondEnquiry: (id: string) => void
  addBroadcast: (broadcast: Broadcast) => void
  addFeedback: (feedback: Feedback) => void
  addContact: (contact: Contact) => void
  resetDemo: () => void
}

const DataContext = createContext<DataContextValue | null>(null)
const STORAGE_KEY = 'aeg-demo-data'

function loadStore(): Store {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as Store
  } catch {
    // fall through to seed
  }
  return seedStore()
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(loadStore)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  const patchProject = useCallback((id: string, updater: (p: Project) => Project) => {
    setStore((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? updater(p) : p)),
    }))
  }, [])

  const value = useMemo<DataContextValue>(() => ({
    ...store,
    getProject: (id) => store.projects.find((p) => p.id === id),
    addProject: (project) => setStore((prev) => ({ ...prev, projects: [project, ...prev.projects] })),
    updateProject: (id, patch) => patchProject(id, (p) => ({ ...p, ...patch })),
    updateMilestone: (projectId, milestoneId, patch) =>
      patchProject(projectId, (p) => ({
        ...p,
        milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, ...patch } : m)),
      })),
    addRisk: (projectId, risk) =>
      patchProject(projectId, (p) => ({ ...p, risks: [...p.risks, risk] })),
    updateRisk: (projectId, riskId, patch) =>
      patchProject(projectId, (p) => ({
        ...p,
        risks: p.risks.map((r) => (r.id === riskId ? { ...r, ...patch } : r)),
      })),
    updateFeasibility: (projectId, patch) =>
      patchProject(projectId, (p) => ({ ...p, feasibility: { ...p.feasibility, ...patch } })),
    updateUnitTrust: (projectId, patch) =>
      setStore((prev) => ({
        ...prev,
        unitTrust: prev.unitTrust.map((u) => (u.projectId === projectId ? { ...u, ...patch } : u)),
      })),
    addEnquiry: (enquiry) => setStore((prev) => ({ ...prev, enquiries: [enquiry, ...prev.enquiries] })),
    respondEnquiry: (id) =>
      setStore((prev) => ({
        ...prev,
        enquiries: prev.enquiries.map((e) => (e.id === id ? { ...e, status: 'Responded' } : e)),
      })),
    addBroadcast: (broadcast) => setStore((prev) => ({ ...prev, broadcasts: [broadcast, ...prev.broadcasts] })),
    addFeedback: (feedback) => setStore((prev) => ({ ...prev, feedback: [feedback, ...prev.feedback] })),
    addContact: (contact) => setStore((prev) => ({ ...prev, contacts: [contact, ...prev.contacts] })),
    resetDemo: () => {
      localStorage.removeItem(STORAGE_KEY)
      setStore(seedStore())
    },
  }), [store, patchProject])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
