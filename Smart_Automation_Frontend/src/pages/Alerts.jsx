// src/pages/Alerts.jsx
import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw, TriangleAlert, MapPin } from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import apiClient from '../lib/apiClient.js'

export default function Alerts() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [status, setStatus] = useState('loading') // loading | done | error
  const [error, setError] = useState('')

  async function fetchAlerts() {
    setStatus('loading')
    setError('')
    try {
      const { data } = await apiClient.get('/analytics/alerts', { params: { days: 7 } })
      setAlerts(data.alerts)
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load alerts.')
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        <DashboardHeader title="High Severity Alerts" onMenuClick={() => setMobileOpen(true)} />

        <div className="flex flex-col gap-4 p-6 md:p-8">
          <p className="text-xs text-[var(--color-text-faint)]">
            High-severity compliance violations detected in the last 7 days.
          </p>

          {status === 'loading' && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-sm text-[var(--color-text-dim)]">
              <Loader2 size={18} className="animate-spin" /> Loading alerts…
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-bad)]/35 bg-[var(--color-bad)]/8 p-10 text-center">
              <AlertCircle size={22} className="text-[var(--color-bad)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-bad)]">Couldn't load alerts</p>
                <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">{error}</p>
              </div>
              <button
                onClick={fetchAlerts}
                className="mt-1 flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-light)]"
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {status === 'done' && (
            alerts.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center text-xs text-[var(--color-text-faint)]">
                No high-severity violations in the last 7 days.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {alerts.map((a) => (
                  <div
                    key={a.inspectionId}
                    className="flex items-start gap-3 rounded-xl border border-[var(--color-bad)]/35 bg-[var(--color-bad)]/8 p-4"
                  >
                    <TriangleAlert size={18} className="mt-0.5 shrink-0 text-[var(--color-bad)]" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          {a.product} {a.brand !== '—' && <span className="font-normal text-[var(--color-text-dim)]">({a.brand})</span>}
                        </p>
                        <span className="text-xs text-[var(--color-text-faint)]">
                          {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {a.location !== '—' && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-text-faint)]">
                          <MapPin size={11} /> {a.location}
                        </p>
                      )}
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {a.violations.map((v, i) => (
                          <li
                            key={i}
                            className="rounded-full bg-[var(--color-bad)]/15 px-2.5 py-1 text-xs font-medium text-[var(--color-bad)]"
                          >
                            {v.type}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}