// Admin-only broadcast composer — post an update to all investors or to a
// specific project's investors. Posts appear in the investor Broadcasts feed.

import { useState } from 'react'
import { useData } from '../../context/DataContext'
import type { Broadcast } from '../../types'

export default function BroadcastComposer() {
  const { broadcasts, projects, addBroadcast, getProject } = useData()
  const [form, setForm] = useState<{ title: string; body: string; audience: Broadcast['audience']; projectId: string }>({
    title: '',
    body: '',
    audience: 'All investors',
    projectId: '',
  })
  const [sent, setSent] = useState(false)

  const post = (e: React.FormEvent) => {
    e.preventDefault()
    addBroadcast({
      id: `bc-${Date.now()}`,
      title: form.title,
      body: form.body,
      audience: form.audience,
      projectId: form.audience === 'Project investors' ? form.projectId || null : null,
      date: new Date().toISOString().slice(0, 10),
    })
    setForm({ title: '', body: '', audience: 'All investors', projectId: '' })
    setSent(true)
  }

  return (
    <div className="dashboard-stack">
      <section className="content-panel">
        <h3>Compose broadcast</h3>
        {sent && <div className="form-success inline">Broadcast posted to the investor feed.</div>}
        <form className="admin-form" onSubmit={post}>
          <label>Title<input required value={form.title} onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setSent(false) }} /></label>
          <label>Message<textarea rows={4} required value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} /></label>
          <div className="form-two-col">
            <label>Audience
              <select value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value as Broadcast['audience'] }))}>
                <option value="All investors">All investors</option>
                <option value="Project investors">Project investors</option>
              </select>
            </label>
            {form.audience === 'Project investors' && (
              <label>Project
                <select required value={form.projectId} onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}>
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
            )}
          </div>
          <div className="modal-actions">
            <button type="submit" className="button button-solid">Post broadcast</button>
          </div>
        </form>
      </section>

      <section className="content-panel">
        <h3>Sent broadcasts</h3>
        <div className="broadcast-feed">
          {broadcasts.map((b) => {
            const project = b.projectId ? getProject(b.projectId) : null
            return (
              <article key={b.id} className="broadcast-item">
                <div className="broadcast-meta">
                  <span className="chip">{b.audience}</span>
                  {project && <span className="chip chip-muted">{project.name}</span>}
                  <small>{b.date}</small>
                </div>
                <h4>{b.title}</h4>
                <p>{b.body}</p>
              </article>
            )
          })}
          {broadcasts.length === 0 && <p className="empty-note">No broadcasts sent yet.</p>}
        </div>
      </section>
    </div>
  )
}
