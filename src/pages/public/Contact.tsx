// Public contact page. Three working, mock-data features:
//  1. Enquiry form  -> writes to the admin enquiry inbox
//  2. AI project matcher -> ranks projects client-side
//  3. Feedback form -> writes to the admin feedback list

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { matchProjects, type MatchResult } from '../../ai/mockAssistant'
import AiAssistant from '../../components/AiAssistant'

const CATEGORY_OPTIONS = ['Any', 'Residential Land', 'Commercial Land', 'Farming Land', 'Dubai Property', 'Property – India', 'Other']

export default function Contact() {
  const { projects, addEnquiry, addFeedback } = useData()
  const navigate = useNavigate()

  const [enquiry, setEnquiry] = useState({ name: '', email: '', subject: '', message: '' })
  const [enquirySent, setEnquirySent] = useState(false)

  const [match, setMatch] = useState({ category: 'Any', budget: 30, goal: 'growth' as 'growth' | 'income' | 'balanced' })
  const [matches, setMatches] = useState<MatchResult[] | null>(null)

  const [feedback, setFeedback] = useState({ name: '', rating: 5, comment: '' })
  const [feedbackSent, setFeedbackSent] = useState(false)

  const submitEnquiry = (e: React.FormEvent) => {
    e.preventDefault()
    addEnquiry({
      id: `enq-${Date.now()}`,
      name: enquiry.name || 'Anonymous',
      email: enquiry.email,
      subject: enquiry.subject || 'General enquiry',
      message: enquiry.message,
      projectId: null,
      source: 'public-contact',
      status: 'New',
      date: new Date().toISOString().slice(0, 10),
    })
    setEnquirySent(true)
    setEnquiry({ name: '', email: '', subject: '', message: '' })
  }

  const runMatch = (e: React.FormEvent) => {
    e.preventDefault()
    setMatches(matchProjects(match, projects))
  }

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    addFeedback({
      id: `fb-${Date.now()}`,
      name: feedback.name || 'Anonymous',
      rating: feedback.rating,
      comment: feedback.comment,
      date: new Date().toISOString().slice(0, 10),
    })
    setFeedbackSent(true)
    setFeedback({ name: '', rating: 5, comment: '' })
  }

  return (
    <div className="page-shell">
      <section className="page-hero compact-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">Contact us</span>
            <h1>Let’s discuss your next opportunity.</h1>
          </div>
        </div>
      </section>

      <div className="container contact-grid">
        <section className="content-panel contact-form-panel">
          <h3>Send an enquiry</h3>
          {enquirySent ? (
            <div className="form-success">
              <p>Thanks — your enquiry has been received and sent to the AEG team.</p>
              <button type="button" className="button button-outline-dark" onClick={() => setEnquirySent(false)}>Send another</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submitEnquiry}>
              <input type="text" placeholder="Full name" value={enquiry.name} onChange={(e) => setEnquiry((p) => ({ ...p, name: e.target.value }))} />
              <input type="email" required placeholder="Email address" value={enquiry.email} onChange={(e) => setEnquiry((p) => ({ ...p, email: e.target.value }))} />
              <input type="text" placeholder="Subject" value={enquiry.subject} onChange={(e) => setEnquiry((p) => ({ ...p, subject: e.target.value }))} />
              <textarea rows={5} required placeholder="Your message" value={enquiry.message} onChange={(e) => setEnquiry((p) => ({ ...p, message: e.target.value }))} />
              <button type="submit" className="button button-solid">Submit enquiry</button>
            </form>
          )}
        </section>

        <section className="content-panel contact-info-panel">
          <h3>Meet our team</h3>
          <ul>
            <li><strong>Phone:</strong> +61 2 0000 0000</li>
            <li><strong>Email:</strong> hello@allianceestate.com.au</li>
            <li><strong>Address:</strong> 18/160 Pacific Hwy, Sydney NSW</li>
            <li><strong>Hours:</strong> Monday – Friday, 9am – 5pm</li>
          </ul>
        </section>
      </div>

      <div className="container matcher-section">
        <section className="content-panel">
          <div className="section-heading">
            <span className="eyebrow">AI project matcher</span>
            <h2 className="matcher-heading">Find opportunities that fit your goals.</h2>
          </div>
          <form className="matcher-form" onSubmit={runMatch}>
            <label>
              Category
              <select value={match.category} onChange={(e) => setMatch((p) => ({ ...p, category: e.target.value }))}>
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Max budget: ${match.budget}m
              <input type="range" min={5} max={45} value={match.budget} onChange={(e) => setMatch((p) => ({ ...p, budget: Number(e.target.value) }))} />
            </label>
            <label>
              Goal
              <select value={match.goal} onChange={(e) => setMatch((p) => ({ ...p, goal: e.target.value as typeof match.goal }))}>
                <option value="growth">Capital growth</option>
                <option value="income">Steady income</option>
                <option value="balanced">Balanced</option>
              </select>
            </label>
            <button type="submit" className="button button-solid">Match me</button>
          </form>

          {matches && (
            <div className="match-results">
              {matches.map((m) => (
                <div key={m.project.id} className="match-card">
                  <div className="match-score">{m.score}</div>
                  <div className="match-body">
                    <strong>{m.project.name}</strong>
                    <span>{m.project.location} • {m.project.category} • {m.project.returnRate}</span>
                    <small>Why: {m.reason}</small>
                  </div>
                  <button type="button" className="card-link" onClick={() => navigate(`/projects/${m.project.id}`)}>View →</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="container matcher-section">
        <section className="content-panel">
          <div className="section-heading">
            <span className="eyebrow">Ask AEG</span>
            <h2 className="matcher-heading">Chat with our AI assistant.</h2>
          </div>
          <AiAssistant />
        </section>
      </div>

      <div className="container matcher-section">
        <section className="content-panel">
          <div className="section-heading">
            <span className="eyebrow">Customer feedback</span>
            <h2 className="matcher-heading">Tell us about your experience.</h2>
          </div>
          {feedbackSent ? (
            <div className="form-success">
              <p>Thank you for your feedback — it helps us improve.</p>
              <button type="button" className="button button-outline-dark" onClick={() => setFeedbackSent(false)}>Leave more feedback</button>
            </div>
          ) : (
            <form className="feedback-form" onSubmit={submitFeedback}>
              <input type="text" placeholder="Your name" value={feedback.name} onChange={(e) => setFeedback((p) => ({ ...p, name: e.target.value }))} />
              <label className="rating-label">
                Rating
                <select value={feedback.rating} onChange={(e) => setFeedback((p) => ({ ...p, rating: Number(e.target.value) }))}>
                  {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</option>)}
                </select>
              </label>
              <textarea rows={4} required placeholder="Your feedback" value={feedback.comment} onChange={(e) => setFeedback((p) => ({ ...p, comment: e.target.value }))} />
              <button type="submit" className="button button-solid">Submit feedback</button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
