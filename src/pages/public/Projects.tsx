import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import type { ProjectCategory } from '../../types'

const CATEGORIES: (ProjectCategory | 'All')[] = [
  'All',
  'Residential Land',
  'Commercial Land',
  'Farming Land',
  'Dubai Property',
  'Property – India',
  'Other',
]

export default function Projects() {
  const { projects } = useData()
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ category: 'All', status: 'All', search: '' })

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory = filters.category === 'All' || project.category === filters.category
      const matchesStatus = filters.status === 'All' || project.status === filters.status
      const query = filters.search.trim().toLowerCase()
      const matchesSearch = !query || `${project.name} ${project.location} ${project.category}`.toLowerCase().includes(query)
      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [projects, filters])

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">Our Projects</span>
            <h1>Opportunities across residential, commercial and growth markets.</h1>
          </div>
          <div className="hero-pill">{projects.length} projects</div>
        </div>
      </section>

      <div className="container project-page-shell">
        <div className="filter-bar">
          <input
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            placeholder="Search by project, location or category"
          />
          <select value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option>All</option>
            <option>New</option>
            <option>In Development</option>
            <option>Completed</option>
          </select>
        </div>

        <p className="result-count">{filtered.length} {filtered.length === 1 ? 'project' : 'projects'} shown</p>

        <div className="directory-grid">
          {filtered.map((project) => (
            <article key={project.id} className="project-directory-card">
              <img src={project.image} alt={project.name} />
              <div className="directory-card-body">
                <div className="meta-row">
                  <span className="status-tag">{project.status}</span>
                  <span>{project.category}</span>
                </div>
                <h3>{project.name}</h3>
                <p>{project.location}</p>
                <button type="button" className="card-link" onClick={() => navigate(`/projects/${project.id}`)}>View details →</button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <p className="empty-note">No projects match your filters yet.</p>}
        </div>
      </div>
    </div>
  )
}
