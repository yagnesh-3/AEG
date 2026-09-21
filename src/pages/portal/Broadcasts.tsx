// Broadcast/update feed for investors. Shows group-wide broadcasts plus those
// targeting the investor's specific projects.

import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function Broadcasts() {
  const { currentUser } = useAuth()
  const { investors, broadcasts, getProject } = useData()
  const investor = investors.find((i) => i.id === currentUser?.investorId)
  const myProjectIds = new Set(investor?.holdings.map((h) => h.projectId) ?? [])

  const visible = broadcasts.filter(
    (b) => b.audience === 'All investors' || (b.projectId && myProjectIds.has(b.projectId)),
  )

  return (
    <div className="content-panel">
      <h3>Updates & announcements</h3>
      <p className="track-intro">Group-wide broadcasts and milestone updates for your projects.</p>
      <div className="broadcast-feed">
        {visible.map((b) => {
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
        {visible.length === 0 && <p className="empty-note">No updates yet.</p>}
      </div>
    </div>
  )
}
