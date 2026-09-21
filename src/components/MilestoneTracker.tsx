// Visual M1–M7 milestone stepper. Read-only by default; admin passes onChange
// to make each milestone's status editable inline.

import type { Milestone, MilestoneStatus } from '../types'

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  complete: 'Complete',
}

type Props = {
  milestones: Milestone[]
  editable?: boolean
  onChange?: (milestoneId: string, status: MilestoneStatus) => void
}

export default function MilestoneTracker({ milestones, editable = false, onChange }: Props) {
  return (
    <div className="milestone-tracker">
      {milestones.map((m) => (
        <div key={m.id} className={`milestone-row ${m.status}`}>
          <div className="milestone-badge">{m.id}</div>
          <div className="milestone-main">
            <strong>{m.name}</strong>
            <small>{m.description}</small>
            <div className="milestone-dates">
              <span>Target: {m.targetDate}</span>
              <span>Actual: {m.actualDate ?? '—'}</span>
            </div>
          </div>
          <div className="milestone-status">
            {editable && onChange ? (
              <select
                value={m.status}
                onChange={(e) => onChange(m.id, e.target.value as MilestoneStatus)}
                aria-label={`${m.name} status`}
              >
                <option value="not-started">Not started</option>
                <option value="in-progress">In progress</option>
                <option value="complete">Complete</option>
              </select>
            ) : (
              <span className={`chip chip-${m.status}`}>{STATUS_LABEL[m.status]}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
