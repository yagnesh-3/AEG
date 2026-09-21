// Admin-only unit trust register + exit tracking (§Step 4).
// Shows unit allocations per project and lets admin advance exit status inline.

import { useData } from '../../context/DataContext'
import type { ExitStatus } from '../../types'

const EXIT_STATUSES: ExitStatus[] = ['Not started', 'In progress', 'Distributing', 'Signed off']

const exitChipClass: Record<ExitStatus, string> = {
  'Not started': 'chip-muted',
  'In progress': 'chip-in-progress',
  Distributing: 'chip-in-progress',
  'Signed off': 'chip-complete',
}

export default function UnitTrust() {
  const { unitTrust, investors, getProject, updateUnitTrust } = useData()

  // Investors holding units in a given project.
  const holdingsByProject = (projectId: string) =>
    investors.flatMap((inv) =>
      inv.holdings
        .filter((h) => h.projectId === projectId)
        .map((h) => ({ investor: inv, holding: h })),
    )

  return (
    <div className="dashboard-stack">
      <section className="content-panel">
        <h3>Unit trust register</h3>
        <p className="track-intro">Unit allocations and exit tracking across the fund.</p>

        <div className="unit-trust-list">
          {unitTrust.map((entry) => {
            const project = getProject(entry.projectId)
            const holders = holdingsByProject(entry.projectId)
            const allocated = holders.reduce((sum, h) => sum + h.holding.units, 0)
            return (
              <article key={entry.projectId} className="unit-trust-card">
                <div className="unit-trust-head">
                  <div>
                    <h4>{project?.name ?? entry.projectId}</h4>
                    <small>
                      {entry.totalUnits.toLocaleString()} units @ {entry.unitPrice} · {allocated.toLocaleString()} allocated
                    </small>
                  </div>
                  <span className={`chip ${exitChipClass[entry.exitStatus]}`}>{entry.exitStatus}</span>
                </div>

                {holders.length > 0 && (
                  <table className="admin-table compact">
                    <thead>
                      <tr><th>Investor</th><th>Units</th><th>Committed</th></tr>
                    </thead>
                    <tbody>
                      {holders.map(({ investor, holding }) => (
                        <tr key={investor.id}>
                          <td>{investor.name}</td>
                          <td>{holding.units.toLocaleString()}</td>
                          <td>{holding.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="unit-trust-exit">
                  <div className="exit-facts">
                    <span><strong>Exit timing</strong> {entry.exitTiming}</span>
                    <span><strong>Distributions</strong> {entry.distributions}</span>
                    <span><strong>Sign-off</strong> {entry.signOff}</span>
                  </div>
                  <label className="inline-select">
                    Exit status
                    <select
                      value={entry.exitStatus}
                      onChange={(e) => updateUnitTrust(entry.projectId, { exitStatus: e.target.value as ExitStatus })}
                    >
                      {EXIT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
              </article>
            )
          })}
          {unitTrust.length === 0 && <p className="empty-note">No unit trust entries yet.</p>}
        </div>
      </section>
    </div>
  )
}
