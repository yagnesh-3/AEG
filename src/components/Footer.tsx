// Site footer, extracted from the original single-file app.

import { Link } from 'react-router-dom'

const serviceLinks = [
  'Project Development for Housing',
  'Investor-Focused Opportunities',
  'Construction & Project Management',
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand-wrap footer-brand">
            <span className="brand-mark">AEG</span>
            <span className="brand-text">
              <strong>Alliance Estate</strong>
              <small>Group</small>
            </span>
          </div>
          <p>Thoughtful property development, project delivery and lasting places across Australian and select international markets.</p>
          <div className="socials footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">f</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">in</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">◎</a>
          </div>
        </div>

        <div>
          <h3>Quick links</h3>
          <ul>
            <li><Link className="footer-link" to="/">Home</Link></li>
            <li><Link className="footer-link" to="/about">About</Link></li>
            <li><Link className="footer-link" to="/projects">Our Projects</Link></li>
            <li><Link className="footer-link" to="/track-record">Track Record</Link></li>
            <li><Link className="footer-link" to="/blog">Blog</Link></li>
            <li><Link className="footer-link" to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3>Our services</h3>
          <ul>
            {serviceLinks.map((service) => (
              <li key={service}><Link className="footer-link" to="/projects">{service}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Contact info</h3>
          <ul className="contact-list">
            <li>Phone: +61 2 0000 0000</li>
            <li>Address: 18/160 Pacific Hwy, Sydney NSW</li>
            <li>Email: hello@allianceestate.com.au</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <span>© 2026 Alliance Estate Group. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
