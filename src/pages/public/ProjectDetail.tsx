// Public-facing project presentation. Internal delivery and feasibility data
// remains available only within the protected admin and investor areas.

import { useParams, useNavigate, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'

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
            <div><strong>{project.category}</strong><span>Project type</span></div>
            <div><strong>{project.location.split(',').at(-1)?.trim()}</strong><span>Region</span></div>
            <div><strong>{project.status}</strong><span>Current stage</span></div>
          </div>
        </div>
      </div>

      <div className="container project-detail-panels-stack">
        <section className="content-panel">
          <h3>About this project</h3>
          <p>{project.description}</p>
          <Link className="button button-outline-dark" to="/contact">Make an enquiry</Link>
        </section>
      </div>
    </div>
  )
}
