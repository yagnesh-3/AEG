// Investor portal shell with sub-navigation. Child pages render via <Outlet />.

import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const portalNav = [
  { to: '/portal', label: 'Dashboard', end: true },
  { to: '/portal/documents', label: 'Documents' },
  { to: '/portal/broadcasts', label: 'Updates' },
  { to: '/portal/enquiries', label: 'My Enquiries' },
]

export default function PortalLayout() {
  const { currentUser } = useAuth()

  return (
    <div className="page-shell">
      <section className="page-hero compact-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">Investor portal</span>
            <h1>Welcome back, {currentUser?.name.split(' ')[0]}.</h1>
          </div>
        </div>
      </section>

      <div className="container workspace-layout">
        <nav className="workspace-nav">
          {portalNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'workspace-link active' : 'workspace-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="workspace-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
