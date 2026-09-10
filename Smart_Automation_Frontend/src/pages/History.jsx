// src/pages/History.jsx
import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw, X, MapPin, Calendar, Download } from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import ExtractedInfoTable from '../components/scan/ExtractedInfoTable.jsx'
import ComplianceAlert from '../components/scan/ComplienceAlert.jsx'
import apiClient from '../lib/apiClient.js'

const PAGE_SIZE = 15

function scoreColor(score) {
  if (score === null || score === undefined) return 'text-[var(--color-text-faint)]'
  if (score >= 80) return 'text-[var(--color-good)]'
  if (score >= 50) return 'text-[var(--color-warn)]'
  return 'text-[var(--color-bad)]'
}

export default function History() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [inspections, setInspections] = useState([])
  const [status, setStatus] = useState('loading') // loading | done | error
  const [error, setError] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [selected, setSelected] = useState(null)

  async function fetchPage(newOffset = 0, append = false) {
    if (append) setLoadingMore(true)
    else setStatus('loading')
    setError('')

    try {
      const { data } = await apiClient.get('/inspections', {
        params: { limit: PAGE_SIZE, offset: newOffset },
      })

      setInspections((prev) => (append ? [...prev, ...data.inspections] : data.inspections))
      setHasMore(data.inspections.length === PAGE_SIZE)
      setOffset(newOffset)
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inspection history.')
      setStatus('error')
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPage(0, false)
  }, [])

  function reportUrlFor(id) {
    return `${import.meta.env.VITE_API_BASE_URL}/inspections/${id}/report?token=${localStorage.getItem('packcheck_token')}`
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        <DashboardHeader title="Inspection History" onMenuClick={() => setMobileOpen(true)} />

        <div className="flex flex-col gap-5 p-6 md:p-8">
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-sm text-[var(--color-text-dim)]">
              <Loader2 size={18} className="animate-spin" /> Loading history…
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-bad)]/35 bg-[var(--color-bad)]/8 p-10 text-center">
              <AlertCircle size={22} className="text-[var(--color-bad)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-bad)]">Couldn't load history</p>
                <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">{error}</p>
              </div>
              <button
                onClick={() => fetchPage(0, false)}
                className="mt-1 flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-light)]"
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {status === 'done' && (
            <>
              {inspections.length === 0 ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center text-xs text-[var(--color-text-faint)]">
                  No inspections yet — scans you run will show up here.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-faint)]">
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Brand</th>
                        <th className="px-4 py-3 font-medium">Location</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Violations</th>
                        <th className="px-4 py-3 font-medium">Score</th>
                        <th className="px-4 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspections.map((insp) => {
                        const violationCount = Array.isArray(insp.violations) ? insp.violations.length : 0
                        return (
                          <tr
                            key={insp.id}
                            className="border-b border-[var(--color-border)]/60 text-[13px] last:border-0 hover:bg-white/5"
                          >
                            <td
                              onClick={() => setSelected(insp)}
                              className="cursor-pointer px-4 py-3 font-medium text-[var(--color-text)]"
                            >
                              {insp.product_name || 'Unnamed product'}
                            </td>
                            <td onClick={() => setSelected(insp)} className="cursor-pointer px-4 py-3 text-[var(--color-text-dim)]">
                              {insp.product_brand || '—'}
                            </td>
                            <td onClick={() => setSelected(insp)} className="cursor-pointer px-4 py-3 text-[var(--color-text-dim)]">
                              {insp.location || '—'}
                            </td>
                            <td onClick={() => setSelected(insp)} className="cursor-pointer px-4 py-3 text-[var(--color-text-faint)]">
                              {new Date(insp.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                            </td>
                            <td onClick={() => setSelected(insp)} className="cursor-pointer px-4 py-3">
                              {violationCount > 0 ? (
                                <span className="rounded-full bg-[var(--color-bad)]/12 px-2.5 py-1 text-xs font-medium text-[var(--color-bad)]">
                                  {violationCount}
                                </span>
                              ) : (
                                <span className="rounded-full bg-[var(--color-good)]/12 px-2.5 py-1 text-xs font-medium text-[var(--color-good)]">
                                  0
                                </span>
                              )}
                            </td>
                            <td onClick={() => setSelected(insp)} className={`cursor-pointer px-4 py-3 font-semibold ${scoreColor(insp.compliance_score)}`}>
                              {insp.compliance_score !== null ? `${insp.compliance_score}%` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={reportUrlFor(insp.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 rounded-lg p-1.5 text-[var(--color-text-dim)] hover:bg-white/5"
                                aria-label="Download PDF report"
                              >
                                <Download size={15} />
                              </a>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {hasMore && inspections.length > 0 && (
                <button
                  onClick={() => fetchPage(offset + PAGE_SIZE, true)}
                  disabled={loadingMore}
                  className="mx-auto flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-4 py-2 text-xs font-medium text-[var(--color-text-dim)] hover:bg-white/5 disabled:opacity-60"
                >
                  {loadingMore && <Loader2 size={13} className="animate-spin" />}
                  Load more
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
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
                    <Calendar size={12} />
                    {new Date(selected.created_at).toLocaleString('en-IN')}
                  </span>
                  <span className={`font-semibold ${scoreColor(selected.compliance_score)}`}>
                    Score: {selected.compliance_score !== null ? `${selected.compliance_score}%` : '—'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={reportUrlFor(selected.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-dim)] hover:bg-white/5"
                >
                  <Download size={13} /> PDF
                </a>
                <button onClick={() => setSelected(null)} className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]">
                  <X size={18} />
                </button>
              </div>
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
          </div>
        </div>
      )}
    </div>
  )
}