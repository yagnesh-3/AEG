// Fake login. One-click demo account buttons (no real credential check) plus a
// decorative email/password form that matches against the seed accounts.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { DemoAccount } from '../../types'

const roleBlurb: Record<string, string> = {
  admin: 'Full platform: project CRM, milestones, risk, feasibility, unit trust, enquiries, broadcasts.',
  staff: 'Delivery tools: projects, milestones, risk register and contacts directory.',
  investor: 'Investor portal: holdings, documents, broadcasts and enquiries.',
}

export default function Login() {
  const { accounts, login, loginByEmail } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const go = (account: DemoAccount | null) => {
    if (!account) {
      setError('No demo account matches that email. Use one of the quick-login accounts below.')
      return
    }
    navigate(account.role === 'investor' ? '/portal' : '/admin')
  }

  return (
    <div className="page-shell">
      <section className="page-hero compact-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">Secure access</span>
            <h1>Log in to the AEG platform.</h1>
          </div>
        </div>
      </section>

      <div className="container login-layout">
        <section className="content-panel login-panel">
          <h3>Login</h3>
          <p className="login-note">Demo prototype — enter any password. Or use a one-click account on the right.</p>
          <form
            className="portal-form"
            onSubmit={(e) => {
              e.preventDefault()
              setError('')
              go(loginByEmail(email))
            }}
          >
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password (any)" />
            <button type="submit" className="button button-solid">Access platform</button>
          </form>
          {error && <p className="login-error">{error}</p>}
        </section>

        <section className="content-panel demo-accounts">
          <h3>Quick demo login</h3>
          <div className="demo-account-list">
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                className="demo-account-card"
                onClick={() => go(login(account.id))}
              >
                <div className="demo-account-role">{account.role}</div>
                <strong>{account.name}</strong>
                <span>{account.email}</span>
                <small>{roleBlurb[account.role]}</small>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
