// Admin feasibility — pick a project, edit the feasibility record, toggle sign-off.
// The editor is keyed by project id so its draft state resets on project change
// (no effect-driven syncing).

import { useState } from 'react'
import { useData } from '../../context/DataContext'
import type { FeasibilityReport, Project } from '../../types'

export default function Feasibility() {
  const { projects } = useData()
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '')

  const project = projects.find((p) => p.id === selectedId) ?? projects[0]

  return (
    <div className="dashboard-stack">
      <section className="content-panel">
        <div className="panel-head-row">
          <h3>Feasibility report</h3>
          <label className="inline-select">
            Project
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>

        {project && <FeasibilityEditor key={project.id} project={project} />}
      </section>
    </div>
  )
}

function FeasibilityEditor({ project }: { project: Project }) {
  const { updateFeasibility } = useData()
  const [draft, setDraft] = useState<FeasibilityReport>(project.feasibility)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof FeasibilityReport, val: string) => {
    setDraft((prev) => ({ ...prev, [key]: val }))
    setSaved(false)
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    updateFeasibility(project.id, draft)
    setSaved(true)
  }

  return (
    <>
      {saved && <div className="form-success inline">Feasibility saved.</div>}
      <form className="admin-form" onSubmit={save}>
        <div className="form-two-col">
          <label>Total cost<input value={draft.totalCost} onChange={(e) => set('totalCost', e.target.value)} /></label>
          <label>Projected revenue<input value={draft.projectedRevenue} onChange={(e) => set('projectedRevenue', e.target.value)} /></label>
        </div>
        <div className="form-two-col">
          <label>Net return<input value={draft.netReturn} onChange={(e) => set('netReturn', e.target.value)} /></label>
          <label>IRR<input value={draft.irr} onChange={(e) => set('irr', e.target.value)} /></label>
        </div>
        <label>Timeline<input value={draft.timeline} onChange={(e) => set('timeline', e.target.value)} /></label>
        <label>Key risks<textarea rows={2} value={draft.keyRisks} onChange={(e) => set('keyRisks', e.target.value)} /></label>
        <label>Summary<textarea rows={3} value={draft.summary} onChange={(e) => set('summary', e.target.value)} /></label>
        <label>Attached document<input value={draft.attachedFile} onChange={(e) => set('attachedFile', e.target.value)} placeholder="e.g. feasibility-v2.pdf" /></label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={draft.signedOff}
            onChange={(e) => { setDraft((prev) => ({ ...prev, signedOff: e.target.checked })); setSaved(false) }}
          />
          Feasibility signed off by investment committee
        </label>

        <div className="modal-actions">
          <button type="submit" className="button button-solid">Save feasibility</button>
        </div>
      </form>
    </>
  )
}
