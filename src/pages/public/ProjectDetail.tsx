// Branded project presentation view — public-facing, read-only. Shows the
// M1–M7 milestone tracker, risk register, feasibility summary and documents.

import { useParams, useNavigate, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import MilestoneTracker from '../../components/MilestoneTracker'
import RiskRegister from '../../components/RiskRegister'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject } = useData()
  const project = id ? getProject(id) : undefined

  if (!project) {
    return (
      <div className="page-shell">
        <section className="page-hero compact-hero">
          <div className="container page-hero-inner">
            <div>
              <span className="eyebrow">Project detail</span>
              <h1>Project not found</h1>
            </div>
          </div>
        </section>
        <div className="container" style={{ paddingTop: 30 }}>
          <Link className="button button-solid" to="/projects">Back to projects</Link>
        </div>
      </div>
    )
  }

  const done = project.milestones.filter((m) => m.status === 'complete').length

  return (
    <div className="page-shell">
      <section className="page-hero compact-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">Project presentation</span>
            <h1>{project.name}</h1>
          </div>
          <button type="button" className="button button-solid" onClick={() => navigate('/projects')}>Back to projects</button>
        </div>
      </section>

      <div className="container project-detail-layout">
        <div className="project-detail-visual">
          <img src={project.image} alt={project.name} />
        </div>
        <div className="detail-copy">
          <div className="detail-status-row">
            <span className="status-tag">{project.status}</span>
            <span>{project.category}</span>
          </div>
          <h2>{project.location}</h2>
          <p>{project.description}</p>
          <div className="metric-row">
            <div><strong>{project.budget}</strong><span>Project value</span></div>
            <div><strong>{project.progress}%</strong><span>Completion</span></div>
            <div><strong>{project.returnRate}</strong><span>Projected return</span></div>
          </div>
          <p className="milestone-summary">{done} of 7 key milestones complete — {project.headlineMilestone}</p>
        </div>
      </div>

      <div className="container project-detail-panels-stack">
        <section className="content-panel">
          <h3>Milestone tracker (M1–M7)</h3>
          <MilestoneTracker milestones={project.milestones} />
        </section>

        <section className="content-panel">
          <h3>Feasibility summary</h3>
          <div className="feasibility-grid">
            <div><span>Total cost</span><strong>{project.feasibility.totalCost}</strong></div>
            <div><span>Projected revenue</span><strong>{project.feasibility.projectedRevenue}</strong></div>
            <div><span>Net return / IRR</span><strong>{project.feasibility.irr}</strong></div>
            <div><span>Timeline</span><strong>{project.feasibility.timeline}</strong></div>
          </div>
          <p className="feasibility-note">{project.feasibility.summary}</p>
          <p className="feasibility-signoff">
            {project.feasibility.signedOff ? '✓ Feasibility signed off by investors' : 'Feasibility sign-off pending'}
          </p>
        </section>

        <section className="content-panel">
          <h3>Risk register</h3>
          <RiskRegister risks={project.risks} />
        </section>

        <section className="content-panel">
          <h3>Documents</h3>
          <ul className="document-list">
            {project.documents.map((doc) => (
              <li key={doc.name}>
                <span>{doc.name}</span>
                <small>{doc.type} • {doc.date}</small>
              </li>
            ))}
          </ul>
          <p className="doc-note">Full documents are available to investors via the portal.</p>
          <Link className="button button-outline-dark" to="/login">Investor login</Link>
        </section>
      </div>
    </div>
  )
}
