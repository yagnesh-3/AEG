// Investor enquiry channel — submit a question (writes to the admin inbox) and
// see the enquiries this investor has raised.

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function Enquiries() {
  const { currentUser } = useAuth()
  const { investors, enquiries, addEnquiry, getProject } = useData()
  const investor = investors.find((i) => i.id === currentUser?.investorId)

  const [form, setForm] = useState({ subject: '', projectId: '', message: '' })
  const [sent, setSent] = useState(false)

  const myEnquiries = enquiries.filter((e) => e.email === currentUser?.email)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addEnquiry({
      id: `enq-${Date.now()}`,
      name: currentUser?.name ?? 'Investor',
      email: currentUser?.email ?? '',
      subject: form.subject || 'Investor enquiry',
      message: form.message,
      projectId: form.projectId || null,
      source: 'investor-portal',
      status: 'New',
      date: new Date().toISOString().slice(0, 10),
    })
    setForm({ subject: '', projectId: '', message: '' })
    setSent(true)
  }

  return (
    <div className="dashboard-stack">
      <section className="content-panel">
        <h3>Raise an enquiry</h3>
        {sent && <div className="form-success inline">Your enquiry has been sent to the AEG team.</div>}
        <form className="contact-form" onSubmit={submit}>
          <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
          <select value={form.projectId} onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}>
            <option value="">General / not project-specific</option>
            {investor?.holdings.map((h) => (
              <option key={h.projectId} value={h.projectId}>{getProject(h.projectId)?.name ?? h.projectId}</option>
            ))}
          </select>
          <textarea rows={4} required placeholder="Your question" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
          <button type="submit" className="button button-solid">Send enquiry</button>
        </form>
      </section>

      <section className="content-panel">
        <h3>Your enquiries</h3>
        <div className="enquiry-list">
          {myEnquiries.map((e) => (
            <div key={e.id} className="enquiry-row">
              <div>
                <strong>{e.subject}</strong>
                <p>{e.message}</p>
                <small>{e.date}</small>
              </div>
              <span className={`chip ${e.status === 'Responded' ? 'chip-complete' : 'chip-in-progress'}`}>{e.status}</span>
            </div>
          ))}
          {myEnquiries.length === 0 && <p className="empty-note">You haven’t raised any enquiries yet.</p>}
        </div>
      </section>
    </div>
  )
}
