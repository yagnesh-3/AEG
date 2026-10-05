import { useData } from '../../context/DataContext'
import { storyStats, timelineMilestones } from '../../data/content'

export default function TrackRecord() {
  const { projects } = useData()
  const completed = projects.filter((p) => p.status === 'Completed')

  const locations = Array.from(new Set(projects.map((p) => p.location.split(',')[1]?.trim() ?? p.location)))

  return (
    <div className="page-shell">
      <section className="page-hero compact-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">Our track record</span>
            <h1>Measured growth across dynamic property cycles.</h1>
          </div>
        </div>
      </section>

      <div className="container page-card-stack">
        <section className="stats-panel content-panel">
          {storyStats.map((stat) => (
            <div key={stat.label} className="stat-box">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="content-panel">
          <h3>Delivery footprint</h3>
          <p className="track-intro">AEG has delivered projects across {locations.length} regions, spanning residential, commercial, farming and international property.</p>
          <div className="footprint-tags">
            {locations.map((loc) => <span key={loc} className="chip">{loc}</span>)}
          </div>
        </section>

        <section className="content-panel">
          <h3>Completed projects & outcomes</h3>
          <div className="completed-grid">
            {completed.map((p) => (
              <div key={p.id} className="completed-card">
                <strong>{p.name}</strong>
                <span>{p.location}</span>
                <small>{p.category}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="content-panel history-panel">
          <h3>Company milestones</h3>
          <div className="history-list">
            {timelineMilestones.map((item) => (
              <div key={item.year} className="history-item">
                <span>{item.year}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
