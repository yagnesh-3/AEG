// Admin overview — portfolio KPIs, open risks, new enquiries, category split.

import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'

export default function AdminDashboard() {
  const { projects, enquiries, feedback, unitTrust, broadcasts } = useData()

  const inDev = projects.filter((p) => p.status === 'In Development').length
  const completed = projects.filter((p) => p.status === 'Completed').length
  const newEnquiries = enquiries.filter((e) => e.status === 'New').length
  const openRisks = projects.reduce((sum, p) => sum + p.risks.filter((r) => r.status === 'Open').length, 0)
  const activeExits = unitTrust.filter((u) => u.exitStatus !== 'Not started' && u.exitStatus !== 'Signed off').length

  const byCategory = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="dashboard-stack">
      <section className="admin-kpi-grid">
        <div className="kpi-card"><strong>{projects.length}</strong><span>Total projects</span></div>
        <div className="kpi-card"><strong>{inDev}</strong><span>In development</span></div>
        <div className="kpi-card"><strong>{completed}</strong><span>Completed</span></div>
        <div className="kpi-card alert"><strong>{newEnquiries}</strong><span>New enquiries</span></div>
        <div className="kpi-card alert"><strong>{openRisks}</strong><span>Open risks</span></div>
        <div className="kpi-card"><strong>{activeExits}</strong><span>Active exits</span></div>
      </section>

      <div className="admin-two-col">
        <section className="content-panel">
          <h3>Portfolio by category</h3>
          <div className="category-bars">
            {Object.entries(byCategory).map(([category, count]) => (
              <div key={category} className="category-bar-row">
                <span>{category}</span>
                <div className="category-bar-track">
                  <div className="category-bar-fill" style={{ width: `${(count / projects.length) * 100}%` }} />
                </div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="content-panel">
          <h3>Quick actions</h3>
          <div className="quick-actions">
            <Link className="button button-solid" to="/admin/projects">Manage projects</Link>
            <Link className="button button-outline-dark" to="/admin/enquiries">Review enquiries ({newEnquiries})</Link>
            <Link className="button button-outline-dark" to="/admin/broadcasts">Post a broadcast</Link>
            <Link className="button button-outline-dark" to="/admin/risks">Review risk register</Link>
          </div>
          <div className="mini-summary">
            <p>{broadcasts.length} broadcasts sent • {feedback.length} feedback entries received</p>
          </div>
        </section>
      </div>
    </div>
  )
}
