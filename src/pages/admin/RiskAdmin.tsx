// Admin risk register — pick a project, edit risk statuses inline, add new risks.

import { useState } from 'react'
import { useData } from '../../context/DataContext'
import RiskRegister from '../../components/RiskRegister'
import Modal from '../../components/Modal'
import type { RiskCategory } from '../../types'

const CATEGORIES: RiskCategory[] = [
  'Approvals & Regulatory',
  'Technical & Design',
  'Financial & Market',
  'Programme & Delivery',
]

export default function RiskAdmin() {
  const { projects, updateRisk, addRisk } = useData()
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<{ category: RiskCategory; description: string; mitigation: string }>({
    category: 'Approvals & Regulatory',
    description: '',
    mitigation: '',
  })

  const project = projects.find((p) => p.id === selectedId) ?? projects[0]
  const openRisks = project ? project.risks.filter((r) => r.status === 'Open').length : 0

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    addRisk(project.id, {
      id: `risk-${Date.now()}`,
      category: form.category,
      description: form.description,
      status: 'Open',
      mitigation: form.mitigation || 'Mitigation to be defined',
    })
    setForm({ category: 'Approvals & Regulatory', description: '', mitigation: '' })
    setModalOpen(false)
  }

  return (
    <div className="dashboard-stack">
      <section className="content-panel">
        <div className="panel-head-row">
          <h3>Risk register</h3>
          <div className="head-row-controls">
            <label className="inline-select">
              Project
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <button type="button" className="button button-solid" onClick={() => setModalOpen(true)}>+ Add risk</button>
          </div>
        </div>

        {project && (
          <>
            <p className="milestone-summary">{openRisks} open risk{openRisks === 1 ? '' : 's'} · {project.risks.length} total</p>
            {project.risks.length > 0 ? (
              <RiskRegister
                risks={project.risks}
                editable
                onStatusChange={(riskId, status) => updateRisk(project.id, riskId, { status })}
              />
            ) : (
              <p className="empty-note">No risks logged for this project yet.</p>
            )}
          </>
        )}
      </section>

      <Modal open={modalOpen} title="Add risk" onClose={() => setModalOpen(false)}>
        <form className="admin-form" onSubmit={save}>
          <label>Category
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as RiskCategory }))}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>Risk description<textarea rows={2} required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></label>
          <label>Mitigation<textarea rows={2} value={form.mitigation} onChange={(e) => setForm((p) => ({ ...p, mitigation: e.target.value }))} /></label>
          <div className="modal-actions">
            <button type="button" className="button button-outline-dark" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="button button-solid">Add risk</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
