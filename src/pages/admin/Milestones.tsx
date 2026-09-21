// Admin milestone management — pick a project, edit its M1–M7 statuses inline.
// Changes persist through DataContext -> localStorage.

import { useState } from 'react'
import { useData } from '../../context/DataContext'
import MilestoneTracker from '../../components/MilestoneTracker'
import type { MilestoneStatus } from '../../types'

export default function Milestones() {
  const { projects, updateMilestone } = useData()
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '')

  const project = projects.find((p) => p.id === selectedId) ?? projects[0]

  const completed = project ? project.milestones.filter((m) => m.status === 'complete').length : 0

  return (
    <div className="dashboard-stack">
      <section className="content-panel">
        <div className="panel-head-row">
          <h3>Milestone tracking</h3>
          <label className="inline-select">
            Project
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>

        {project && (
          <>
            <p className="milestone-summary">
              {completed} of 7 milestones complete · {project.location}
            </p>
            <MilestoneTracker
              milestones={project.milestones}
              editable
              onChange={(milestoneId, status: MilestoneStatus) => {
                updateMilestone(project.id, milestoneId, {
                  status,
                  actualDate: status === 'complete' ? new Date().toISOString().slice(0, 10) : null,
                })
              }}
            />
          </>
        )}
      </section>
    </div>
  )
}
