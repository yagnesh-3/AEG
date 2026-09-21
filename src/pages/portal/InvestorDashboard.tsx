// Investor dashboard — holdings snapshot + linked projects with milestone/risk
// visibility. Reads the logged-in investor from auth + data.

import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import MilestoneTracker from '../../components/MilestoneTracker'

function parseAmount(amount: string): number {
  return Number(amount.replace(/[^\d.]/g, ''))
}

export default function InvestorDashboard() {
  const { currentUser } = useAuth()
  const { investors, getProject } = useData()

  const investor = investors.find((i) => i.id === currentUser?.investorId)

  if (!investor) {
    return <p className="empty-note">No investor profile linked to this account.</p>
  }

  const totalInvested = investor.holdings.reduce((sum, h) => sum + parseAmount(h.amount), 0)
  const totalUnits = investor.holdings.reduce((sum, h) => sum + h.units, 0)

  return (
    <div className="dashboard-stack">
      <section className="portal-metrics">
        <div><strong>${totalInvested.toLocaleString()}</strong><span>Total invested</span></div>
        <div><strong>{investor.holdings.length}</strong><span>Active projects</span></div>
        <div><strong>{totalUnits}</strong><span>Units held</span></div>
      </section>

      <section className="content-panel">
        <h3>Your holdings</h3>
        <div className="holdings-list">
          {investor.holdings.map((holding) => {
            const project = getProject(holding.projectId)
            if (!project) return null
            const done = project.milestones.filter((m) => m.status === 'complete').length
            return (
              <div key={holding.projectId} className="holding-card">
                <div className="holding-head">
                  <div>
                    <strong>{project.name}</strong>
                    <span>{project.location} • {project.category}</span>
                  </div>
                  <div className="holding-figures">
                    <span className="status-tag">{project.status}</span>
                    <small>{holding.units} units • {holding.amount}</small>
                  </div>
                </div>
                <p className="holding-progress-label">{done} of 7 milestones complete — {project.headlineMilestone}</p>
                <MilestoneTracker milestones={project.milestones} />
                <Link className="card-link" to={`/projects/${project.id}`}>View full project →</Link>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
