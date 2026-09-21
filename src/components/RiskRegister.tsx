// Per-project risk register grouped by the four brief categories.
// Read-only for investors; admin gets inline status editing + add-risk.

import type { Risk, RiskCategory, RiskStatus } from '../types'

const CATEGORIES: RiskCategory[] = [
  'Approvals & Regulatory',
  'Technical & Design',
  'Financial & Market',
  'Programme & Delivery',
]

const STATUS_OPTIONS: RiskStatus[] = ['Open', 'Monitoring', 'Mitigated', 'Closed']

type Props = {
  risks: Risk[]
  editable?: boolean
  onStatusChange?: (riskId: string, status: RiskStatus) => void
}

export default function RiskRegister({ risks, editable = false, onStatusChange }: Props) {
  return (
    <div className="risk-register">
      {CATEGORIES.map((category) => {
        const items = risks.filter((r) => r.category === category)
        if (!items.length) return null
        return (
          <div key={category} className="risk-group">
            <h4>{category}</h4>
            {items.map((r) => (
              <div key={r.id} className="risk-row">
                <div className="risk-main">
                  <p>{r.description}</p>
                  <small>Mitigation: {r.mitigation}</small>
                </div>
                <div className="risk-status">
                  {editable && onStatusChange ? (
                    <select
                      value={r.status}
                      onChange={(e) => onStatusChange(r.id, e.target.value as RiskStatus)}
                      aria-label="Risk status"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`chip risk-${r.status.toLowerCase()}`}>{r.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
