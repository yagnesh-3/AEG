// Admin enquiry inbox — enquiries from the public contact form and the investor
// portal land here. Admin can mark them responded.

import { useState } from 'react'
import { useData } from '../../context/DataContext'

type Filter = 'all' | 'new' | 'responded'

export default function EnquiryInbox() {
  const { enquiries, respondEnquiry, getProject } = useData()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = enquiries.filter((e) => {
    if (filter === 'new') return e.status === 'New'
    if (filter === 'responded') return e.status === 'Responded'
    return true
  })

  const newCount = enquiries.filter((e) => e.status === 'New').length

  return (
    <div className="dashboard-stack">
      <section className="content-panel">
        <div className="panel-head-row">
          <h3>Enquiry inbox</h3>
          <div className="filter-tabs">
            <button type="button" className={filter === 'all' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('all')}>All ({enquiries.length})</button>
            <button type="button" className={filter === 'new' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('new')}>New ({newCount})</button>
            <button type="button" className={filter === 'responded' ? 'filter-tab active' : 'filter-tab'} onClick={() => setFilter('responded')}>Responded</button>
          </div>
        </div>

        <div className="enquiry-list">
          {filtered.map((e) => {
            const project = e.projectId ? getProject(e.projectId) : null
            return (
              <div key={e.id} className="enquiry-row admin-enquiry">
                <div className="enquiry-body">
                  <div className="enquiry-head">
                    <strong>{e.subject}</strong>
                    <span className={`chip ${e.status === 'Responded' ? 'chip-complete' : 'chip-in-progress'}`}>{e.status}</span>
                  </div>
                  <p>{e.message}</p>
                  <div className="enquiry-meta">
                    <span>{e.name} · {e.email}</span>
                    <span className="chip chip-muted">{e.source === 'investor-portal' ? 'Investor portal' : 'Public contact'}</span>
                    {project && <span className="chip chip-muted">{project.name}</span>}
                    <small>{e.date}</small>
                  </div>
                </div>
                {e.status === 'New' && (
                  <button type="button" className="button button-outline-dark" onClick={() => respondEnquiry(e.id)}>Mark responded</button>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && <p className="empty-note">No enquiries in this view.</p>}
        </div>
      </section>
    </div>
  )
}
