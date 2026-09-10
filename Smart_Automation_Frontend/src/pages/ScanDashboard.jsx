// src/pages/ScanDashboard.jsx
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, PlusCircle, Loader2, AlertCircle, ImageOff } from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import UploadedImagePanel from '../components/scan/UploadedImagePanel.jsx'
import ExtractedInfoTable from '../components/scan/ExtractedInfoTable.jsx'
import ComplianceAlert from '../components/scan/ComplienceAlert.jsx'
import apiClient from '../lib/apiClient.js'

const CATEGORIES = ['Food & Beverages', 'FMCG', 'Pharmaceuticals', 'Agri Products', 'Others']

export default function ScanDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const selectedFile = location.state?.file

  const [fields, setFields] = useState(null)
  const [inspectionId, setInspectionId] = useState(null)
  const [status, setStatus] = useState('idle') // idle | details | loading | done | error | empty
  const [error, setError] = useState('')

  const [meta, setMeta] = useState({ productName: '', brand: '', category: 'Food & Beverages', location: '' })

  useEffect(() => {
    if (!selectedFile) {
      setStatus('empty')
      return
    }
    // Ask for product details before scanning, instead of scanning immediately
    setStatus('details')
  }, [selectedFile])

  async function runScan(e) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      if (meta.productName.trim()) formData.append('productName', meta.productName.trim())
      if (meta.brand.trim()) formData.append('brand', meta.brand.trim())
      if (meta.category) formData.append('category', meta.category)
      if (meta.location.trim()) formData.append('location', meta.location.trim())

      const { data } = await apiClient.post('/inspections/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setFields(data.extractedFields)
      setInspectionId(data.inspectionId)
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Scan failed. Please try again.')
      setStatus('error')
    }
  }

  const reportUrl = inspectionId
    ? `${import.meta.env.VITE_API_BASE_URL}/inspections/${inspectionId}/report?token=${localStorage.getItem('packcheck_token')}`
    : null

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        <DashboardHeader
          title="Scan Result"
          onMenuClick={() => setMobileOpen(true)}
          badge={
            status === 'loading' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-warn)]/12 px-2.5 py-1 text-xs font-medium text-[var(--color-warn)]">
                <Loader2 size={12} className="animate-spin" /> Processing
              </span>
            ) : status === 'error' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bad)]/12 px-2.5 py-1 text-xs font-medium text-[var(--color-bad)]">
                <AlertCircle size={12} /> Failed
              </span>
            ) : status === 'done' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-good)]/12 px-2.5 py-1 text-xs font-medium text-[var(--color-good)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-good)]" /> Completed
              </span>
            ) : null
          }
        >
          {status === 'done' && reportUrl ? (
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-dim)] hover:bg-white/5"
            >
              Export PDF <ChevronDown size={14} />
            </a>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-faint)] opacity-50 cursor-not-allowed"
            >
              Export <ChevronDown size={14} />
            </button>
          )}
          <button
            onClick={() => navigate('/scan', { replace: true, state: {} })}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-light)]"
          >
            <PlusCircle size={15} /> New Scan
          </button>
        </DashboardHeader>

        <div className="grid gap-5 p-6 md:p-8 lg:grid-cols-[1fr_1.15fr]">
          {status === 'empty' ? (
            <div className="lg:col-span-2 flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
              <ImageOff size={28} className="text-[var(--color-text-faint)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">No image to scan</p>
                <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
                  Start a new scan from the upload panel to see results here.
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="mt-1 flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-light)]"
              >
                <PlusCircle size={13} /> Go to Upload
              </button>
            </div>
          ) : (
            <>
              <UploadedImagePanel file={selectedFile} />

              <div className="flex flex-col gap-5">
                {status === 'details' && (
                  <form onSubmit={runScan} className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <p className="text-xs font-medium text-[var(--color-text-dim)]">Product details (optional, helps with reporting)</p>

                    <input
                      type="text"
                      placeholder="Product name"
                      value={meta.productName}
                      onChange={(e) => setMeta((m) => ({ ...m, productName: e.target.value }))}
                      className="rounded-lg border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm text-[var(--color-text)]"
                    />
                    <input
                      type="text"
                      placeholder="Brand"
                      value={meta.brand}
                      onChange={(e) => setMeta((m) => ({ ...m, brand: e.target.value }))}
                      className="rounded-lg border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm text-[var(--color-text)]"
                    />
                    <select
                      value={meta.category}
                      onChange={(e) => setMeta((m) => ({ ...m, category: e.target.value }))}
                      className="rounded-lg border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm text-[var(--color-text)]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-[var(--color-surface)]">{c}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Inspection location (e.g. Mumbai, MH)"
                      value={meta.location}
                      onChange={(e) => setMeta((m) => ({ ...m, location: e.target.value }))}
                      className="rounded-lg border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm text-[var(--color-text)]"
                    />

                    <button
                      type="submit"
                      className="mt-1 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-light)]"
                    >
                      Run Scan
                    </button>
                  </form>
                )}

                {status === 'loading' && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-sm text-[var(--color-text-dim)]">
                    <Loader2 size={16} className="animate-spin" /> Extracting label details…
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex items-start gap-3 rounded-xl border border-[var(--color-bad)]/35 bg-[var(--color-bad)]/8 p-4">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-[var(--color-bad)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-bad)]">Scan failed</p>
                      <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">{error}</p>
                    </div>
                  </div>
                )}

                {status === 'done' && fields && (
                  <>
                    <ExtractedInfoTable fields={fields} />
                    <ComplianceAlert fields={fields} />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}