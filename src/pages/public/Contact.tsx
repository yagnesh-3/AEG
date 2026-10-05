// Public contact page with enquiry and feedback forms.

import { useState } from 'react'
import { useData } from '../../context/DataContext'

export default function Contact() {
  const { addEnquiry, addFeedback } = useData()

  const [enquiry, setEnquiry] = useState({ name: '', email: '', subject: '', message: '' })
  const [enquirySent, setEnquirySent] = useState(false)

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
