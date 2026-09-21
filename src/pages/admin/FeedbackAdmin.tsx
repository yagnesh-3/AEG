// Admin-only view of feedback submitted through the public website form (§5).

import { useData } from '../../context/DataContext'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      {'★★★★★'.slice(0, rating)}
      <span className="stars-empty">{'★★★★★'.slice(rating)}</span>
    </span>
  )
}

export default function FeedbackAdmin() {
  const { feedback } = useData()

  const avg = feedback.length
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : '—'

  return (
    <div className="dashboard-stack">
      <section className="content-panel">
        <div className="panel-head-row">
          <h3>Website feedback ({feedback.length})</h3>
          <span className="avg-rating">Average rating: <strong>{avg}</strong> / 5</span>
        </div>

        <div className="feedback-list">
          {feedback.map((f) => (
            <article key={f.id} className="feedback-card">
              <div className="feedback-head">
                <strong>{f.name}</strong>
                <Stars rating={f.rating} />
              </div>
              <p>{f.comment}</p>
              <small>{f.date}</small>
            </article>
          ))}
          {feedback.length === 0 && <p className="empty-note">No feedback received yet.</p>}
        </div>
      </section>
    </div>
  )
}
