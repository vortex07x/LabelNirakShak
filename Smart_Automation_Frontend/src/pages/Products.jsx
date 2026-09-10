// src/pages/Products.jsx
import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw, Package } from 'lucide-react'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import apiClient from '../lib/apiClient.js'

function scoreColor(score) {
  if (score === null || score === undefined) return 'text-[var(--color-text-faint)]'
  if (score >= 80) return 'text-[var(--color-good)]'
  if (score >= 50) return 'text-[var(--color-warn)]'
  return 'text-[var(--color-bad)]'
}

export default function Products() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading') // loading | done | error
  const [error, setError] = useState('')

  async function fetchProducts() {
    setStatus('loading')
    setError('')
    try {
      const { data } = await apiClient.get('/products')
      setProducts(data.products)
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products.')
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        <DashboardHeader title="Products" onMenuClick={() => setMobileOpen(true)} />

        <div className="flex flex-col gap-5 p-6 md:p-8">
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-sm text-[var(--color-text-dim)]">
              <Loader2 size={18} className="animate-spin" /> Loading products…
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-bad)]/35 bg-[var(--color-bad)]/8 p-10 text-center">
              <AlertCircle size={22} className="text-[var(--color-bad)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-bad)]">Couldn't load products</p>
                <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">{error}</p>
              </div>
              <button
                onClick={fetchProducts}
                className="mt-1 flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--color-accent-light)]"
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {status === 'done' && (
            products.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
                <Package size={22} className="text-[var(--color-text-faint)]" />
                <p className="text-xs text-[var(--color-text-faint)]">
                  No products yet — products are created automatically when you enter a product name during a scan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-faint)]">
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Brand</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Total Scans</th>
                      <th className="px-4 py-3 font-medium">Avg. Score</th>
                      <th className="px-4 py-3 font-medium">Last Scanned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-[var(--color-border)]/60 text-[13px] last:border-0">
                        <td className="px-4 py-3 font-medium text-[var(--color-text)]">{p.name}</td>
                        <td className="px-4 py-3 text-[var(--color-text-dim)]">{p.brand || '—'}</td>
                        <td className="px-4 py-3 text-[var(--color-text-dim)]">{p.category || '—'}</td>
                        <td className="px-4 py-3 text-[var(--color-text-dim)]">{p.scan_count}</td>
                        <td className={`px-4 py-3 font-semibold ${scoreColor(p.avg_score)}`}>
                          {p.avg_score !== null ? `${p.avg_score}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-faint)]">
                          {p.last_scanned
                            ? new Date(p.last_scanned).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}