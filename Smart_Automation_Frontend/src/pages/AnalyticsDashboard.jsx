// src/pages/AnalyticsDashboard.jsx
import { useState, useEffect } from 'react'
import { Calendar, SlidersHorizontal, Loader2, AlertCircle, RefreshCw, X, MapPin, Calendar as CalendarIcon } from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import StatCard from '../components/analytics/StatCard.jsx'
import ViolationsChart from '../components/analytics/ViolationsChart.jsx'
import CategoryDonut from '../components/analytics/CategoryDonut.jsx'
import RecentViolationsTable from '../components/analytics/RecentViolationsTable.jsx'
import ExtractedInfoTable from '../components/scan/ExtractedInfoTable.jsx'
import ComplianceAlert from '../components/scan/ComplienceAlert.jsx'
import apiClient from '../lib/apiClient.js'
import { useAuth } from '../context/AuthContext.jsx'

const tabs = ['Overview', 'Scans', 'Violations', 'Products', 'Reports', 'Alerts', 'Users', 'Settings']

function scoreColor(score) {
  if (score === null || score === undefined) return 'text-[var(--color-text-faint)]'
  if (score >= 80) return 'text-[var(--color-good)]'
  if (score >= 50) return 'text-[var(--color-warn)]'
  return 'text-[var(--color-bad)]'
}

export default function AnalyticsDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading') // loading | done | error
  const [error, setError] = useState('')

  const [selected, setSelected] = useState(null)
  const [modalStatus, setModalStatus] = useState('idle') // idle | loading | error

  async function fetchOverview() {
    setStatus('loading')
    setError('')
    try {
      const { data: response } = await apiClient.get('/analytics/overview')
      setData(response)
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data.')
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  async function handleViolationClick(row) {
    if (!row.inspectionId) return
    setModalStatus('loading')
    try {
      const { data: response } = await apiClient.get(`/inspections/${row.inspectionId}`)
      setSelected(response.inspection)
      setModalStatus('idle')
    } catch (err) {
      setModalStatus('error')
    }
  }

  const totalScansStat = data?.stats?.find((s) => s.label === 'Total Scans')
  const totalScans = totalScansStat ? totalScansStat.value : '—'

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'IA'

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        <DashboardHeader title="Analytics Dashboard" onMenuClick={() => setMobileOpen(true)}>
          <button className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3.5 py-2 text-xs font-medium text-[var(--color-text-dim)] hover:bg-white/5">
            <Calendar size={14} /> Last 31 days
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3.5 py-2 text-xs font-medium text-[var(--color-text-dim)] hover:bg-white/5">
            <SlidersHorizontal size={13} /> Filters
          </button>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-strong)] pl-1.5 pr-3 py-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)]/20 text-xs font-bold text-[var(--color-accent-light)]">
              {initials}
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-medium">{user?.name || 'Inspector'}</span>
              <span className="block text-[10px] text-[var(--color-text-faint)] capitalize">{user?.role || 'inspector'}</span>
            </span>
          </div>
        </DashboardHeader>

        <div className="border-b border-[var(--color-border)] px-4 md:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === t ? 'bg-[var(--color-accent)]/12 text-[var(--color-accent-light)]' : 'text-[var(--color-text-faint)] hover:text-[var(--color-text-dim)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === 'Overview' ? (
          <div className="flex flex-col gap-5 p-6 md:p-8">
            {status === 'loading' && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-sm text-[var(--color-text-dim)]">
                <Loader2 size={18} className="animate-spin" /> Loading analytics…
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-bad)]/35 bg-[var(--color-bad)]/8 p-10 text-center">
                <AlertCircle size={22} className="text-[var(--color-bad)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-bad)]">Couldn't load analytics</p>
                  <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">{error}</p>
                </div>
                <button
                  onClick={fetchOverview}
                  className="mt-1 flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-light)]"
                >
                  <RefreshCw size={13} /> Retry
                </button>
              </div>
            )}

            {status === 'done' && data && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {data.stats.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
                  <ViolationsChart data={data.violationsOverTime} />
                  {data.productCategories.length > 0 ? (
                    <CategoryDonut data={data.productCategories} total={totalScans} />
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-xs text-[var(--color-text-faint)]">
                      No category data yet — run a few scans to populate this chart.
                    </div>
                  )}
                </div>

                {data.recentViolations.length > 0 ? (
                  <RecentViolationsTable rows={data.recentViolations} onRowClick={handleViolationClick} />
                ) : (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-xs text-[var(--color-text-faint)]">
                    No violations recorded yet.
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="font-display text-sm font-bold text-[var(--color-text-dim)]">{tab} is not part of this demo</p>
            <p className="max-w-xs text-xs text-[var(--color-text-faint)]">
              This section isn't built out yet — switch back to Overview to see the working analytics view.
            </p>
          </div>
        )}
      </div>

      {(selected || modalStatus === 'loading' || modalStatus === 'error') && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => { setSelected(null); setModalStatus('idle') }}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {modalStatus === 'loading' && (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-[var(--color-text-dim)]">
                <Loader2 size={16} className="animate-spin" /> Loading inspection…
              </div>
            )}

            {modalStatus === 'error' && (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <AlertCircle size={20} className="text-[var(--color-bad)]" />
                <p className="text-sm text-[var(--color-bad)]">Couldn't load this inspection.</p>
              </div>
            )}

            {selected && modalStatus === 'idle' && (
              <>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-base font-bold">
                      {selected.product_name || 'Unnamed product'}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-faint)]">
                      {selected.location && (
                        <span className="flex items-center gap-1"><MapPin size={12} /> {selected.location}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={12} />
                        {new Date(selected.created_at).toLocaleString('en-IN')}
                      </span>
                      <span className={`font-semibold ${scoreColor(selected.compliance_score)}`}>
                        Score: {selected.compliance_score !== null ? `${selected.compliance_score}%` : '—'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => { setSelected(null); setModalStatus('idle') }} className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {selected.image_url ? (
                    <img
                      src={selected.image_url}
                      alt={selected.product_name || 'Package image'}
                      className="h-56 w-full rounded-lg border border-[var(--color-border)] object-contain bg-[#0a1120]"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--color-border-strong)] text-xs text-[var(--color-text-faint)]">
                      No image available for this inspection
                    </div>
                  )}

                  <ExtractedInfoTable fields={selected.extracted_fields || []} />
                  <ComplianceAlert fields={selected.extracted_fields || []} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}