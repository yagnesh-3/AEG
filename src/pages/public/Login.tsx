import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="page-shell">
      <section className="page-hero compact-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">Investor access</span>
            <h1>Private account access.</h1>
          </div>
        </div>
      </section>

      <div className="container login-layout">
        <section className="content-panel login-panel">
          <h3>Investor portal</h3>
          <p className="login-note">The investor portal is a private area and is not available through this public preview.</p>
          <Link className="button button-solid" to="/contact">Contact our team</Link>
        </section>
      </div>
    </div>
  )
}
