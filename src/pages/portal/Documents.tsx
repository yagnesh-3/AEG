// Self-serve document access for the investor's projects (mock downloads).

import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function Documents() {
  const { currentUser } = useAuth()
  const { investors, getProject } = useData()
  const investor = investors.find((i) => i.id === currentUser?.investorId)

  if (!investor) return <p className="empty-note">No investor profile linked to this account.</p>

  return (
    <div className="content-panel">
      <h3>Your project documents</h3>
      <p className="track-intro">Self-serve access to feasibility reports, investor packs and project documentation.</p>
      {investor.holdings.map((holding) => {
        const project = getProject(holding.projectId)
        if (!project) return null
        return (
          <div key={holding.projectId} className="doc-project-group">
            <h4>{project.name}</h4>
            <ul className="document-list">
              <li>
                <span>{project.feasibility.attachedFile}</span>
                <button type="button" className="link-button" onClick={() => alert('Demo: document download')}>Download</button>
              </li>
              {project.documents.map((doc) => (
                <li key={doc.name}>
                  <span>{doc.name} <small>({doc.type} • {doc.date})</small></span>
                  <button type="button" className="link-button" onClick={() => alert('Demo: document download')}>Download</button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
