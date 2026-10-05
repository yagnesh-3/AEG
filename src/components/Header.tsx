// Public navigation does not include links to the private portal or admin area.

import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const publicNav = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/track-record', label: 'Track Record' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [navOpen, setNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setNavOpen(false)

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <NavLink to="/" className="brand-wrap" onClick={close}>
          <span className="brand-mark">AEG</span>
          <span className="brand-text">
            <strong>Alliance Estate</strong>
            <small>Group</small>
          </span>
        </NavLink>

        <nav className={`main-nav ${navOpen ? 'open' : ''}`}>
          {publicNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={close}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <div className="socials" aria-label="Social media links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>
          </div>
          <button type="button" className="nav-toggle" aria-label="Toggle navigation" aria-expanded={navOpen} onClick={() => setNavOpen((p) => !p)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
