// Projects CRM — list all projects with status control, plus add/edit via modal.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Modal from '../../components/Modal'
import type { Milestone, Project, ProjectCategory, ProjectStatus } from '../../types'

const CATEGORIES: ProjectCategory[] = ['Residential Land', 'Commercial Land', 'Farming Land', 'Dubai Property', 'Property – India', 'Other']
const STATUSES: ProjectStatus[] = ['New', 'In Development', 'Completed']

const MILESTONE_DEFS: { id: Milestone['id']; name: string; description: string }[] = [
  { id: 'M1', name: 'Land Settlement', description: 'Purchase completed, site secured' },
  { id: 'M2', name: 'Feasibility Sign-off', description: 'Budget & returns approved by investors' },
  { id: 'M3', name: 'DA Approval', description: 'Council consent granted' },
  { id: 'M4', name: 'Construction Certificate', description: 'Engineering & works approved' },
  { id: 'M5', name: 'Civil Works Complete', description: 'Roads, drainage, services installed' },
  { id: 'M6', name: 'Subdivision Registration', description: 'New titles issued by NSW Land Registry Services' },
  { id: 'M7', name: 'Lots Sold & Settled', description: 'Sales proceeds realised' },
]

type FormState = {
  name: string
  location: string
  category: ProjectCategory
  status: ProjectStatus
  budget: string
  returnRate: string
  stats: string
  description: string
}

const EMPTY_FORM: FormState = {
  name: '',
  location: '',
  category: 'Residential Land',
  status: 'New',
  budget: '$10.0m',
  returnRate: '15.0%',
  stats: '',
  description: '',
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `project-${Date.now()}`
}

export default function ProjectsCRM() {
  const { projects, addProject, updateProject } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditingId(project.id)
    setForm({
      name: project.name,
      location: project.location,
      category: project.category,
      status: project.status,
      budget: project.budget,
      returnRate: project.returnRate,
      stats: project.stats,
      description: project.description,
    })
    setModalOpen(true)
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateProject(editingId, { ...form })
    } else {
      const newProject: Project = {
        id: slug(form.name),
        name: form.name,
        location: form.location,
        category: form.category,
        status: form.status,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
        description: form.description || 'New AEG project opportunity.',
        stats: form.stats || 'Details to follow',
        budget: form.budget,
        progress: 5,
        returnRate: form.returnRate,
        headlineMilestone: 'Land settlement pending',
        documents: [{ name: 'Project brief', type: 'PDF', date: new Date().toISOString().slice(0, 10) }],
        milestones: MILESTONE_DEFS.map((d, i) => ({
          ...d,
          status: i === 0 ? 'in-progress' : 'not-started',
          targetDate: 'TBC',
          actualDate: null,
        })),
        risks: [],
        feasibility: {
          totalCost: form.budget,
          projectedRevenue: 'TBC',
          netReturn: form.returnRate,
          irr: form.returnRate,
          timeline: '24–36 months',
          keyRisks: 'To be assessed',
          summary: `Feasibility assessment pending for ${form.name}.`,
          attachedFile: '',
          signedOff: false,
        },
      }
      addProject(newProject)
    }
    setModalOpen(false)
  }

  return (
    <div className="dashboard-stack">
      <section className="content-panel">
        <div className="panel-head-row">
          <h3>Projects ({projects.length})</h3>
          <button type="button" className="button button-solid" onClick={openAdd}>+ Add project</button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>Location</th>
                <th>Value</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td><strong>{project.name}</strong></td>
                  <td>{project.category}</td>
                  <td>{project.location}</td>
                  <td>{project.budget}</td>
                  <td>
                    <select
                      value={project.status}
                      onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}
                      aria-label={`${project.name} status`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="table-actions">
                    <button type="button" className="link-button" onClick={() => openEdit(project)}>Edit</button>
                    <Link className="link-button" to={`/projects/${project.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit project' : 'Add new project'}
        onClose={() => setModalOpen(false)}
      >
        <form className="admin-form" onSubmit={save}>
          <label>Project name<input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></label>
          <label>Location<input required value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="City, State" /></label>
          <div className="form-two-col">
            <label>Category
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ProjectCategory }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>Status
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ProjectStatus }))}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <div className="form-two-col">
            <label>Project value<input value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))} placeholder="$10.0m" /></label>
            <label>Projected return<input value={form.returnRate} onChange={(e) => setForm((p) => ({ ...p, returnRate: e.target.value }))} placeholder="15.0%" /></label>
          </div>
          <label>Highlight stat<input value={form.stats} onChange={(e) => setForm((p) => ({ ...p, stats: e.target.value }))} placeholder="e.g. 25 lots • 6.8% yield" /></label>
          <label>Description<textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></label>
          <div className="modal-actions">
            <button type="button" className="button button-outline-dark" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="button button-solid">{editingId ? 'Save changes' : 'Add project'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
