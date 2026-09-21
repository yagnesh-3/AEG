// Admin/staff workspace shell with sub-navigation. Some sections are admin-only.

import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

import type { Role } from '../../types'

type NavItem = { to: string; label: string; roles: Role[]; end?: boolean }

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Overview', end: true, roles: ['admin', 'staff'] },
  { to: '/admin/projects', label: 'Projects CRM', roles: ['admin', 'staff'] },
  { to: '/admin/milestones', label: 'Milestones', roles: ['admin', 'staff'] },
  { to: '/admin/risks', label: 'Risk register', roles: ['admin', 'staff'] },
  { to: '/admin/feasibility', label: 'Feasibility', roles: ['admin', 'staff'] },
  { to: '/admin/unit-trust', label: 'Unit trust', roles: ['admin'] },
  { to: '/admin/contacts', label: 'Contacts', roles: ['admin', 'staff'] },
  { to: '/admin/enquiries', label: 'Enquiries', roles: ['admin', 'staff'] },
  { to: '/admin/broadcasts', label: 'Broadcasts', roles: ['admin'] },
  { to: '/admin/feedback', label: 'Feedback', roles: ['admin'] },
]

export default function AdminLayout() {
  const { currentUser, role } = useAuth()
  const { resetDemo } = useData()

  const items = adminNav.filter((item) => role && (item.roles as readonly string[]).includes(role))

  return (
    <div className="page-shell">
      <section className="page-hero compact-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">Admin workspace</span>
            <h1>{currentUser?.name} · {role}</h1>
          </div>
          <button
            type="button"
            className="button button-outline light"
            onClick={() => {
              if (confirm('Reset all demo data back to the seed set? This clears any demo changes.')) resetDemo()
            }}
          >
            Reset demo data
          </button>
        </div>
      </section>

      <div className="container workspace-layout">
        <nav className="workspace-nav">
          {items.map((item) => (
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
