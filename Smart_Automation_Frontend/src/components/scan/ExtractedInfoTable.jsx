// src/components/scan/ExtractedInfoTable.jsx
import { Check, X, AlertTriangle } from 'lucide-react'

const statusConfig = {
  valid: {
    label: 'Valid',
    icon: Check,
    textClass: 'text-[var(--color-good)]',
    badgeClass: 'bg-[var(--color-good)]/12 text-[var(--color-good)]',
  },
  low_confidence: {
    label: 'Low Confidence',
    icon: AlertTriangle,
    textClass: 'text-[var(--color-warn)]',
    badgeClass: 'bg-[var(--color-warn)]/12 text-[var(--color-warn)]',
  },
  missing: {
    label: 'Missing',
    icon: X,
    textClass: 'text-[var(--color-bad)] font-medium',
    badgeClass: 'bg-[var(--color-bad)]/12 text-[var(--color-bad)]',
  },
}

export default function ExtractedInfoTable({ fields }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="mb-3 text-xs font-medium text-[var(--color-text-dim)]">Extracted Information</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-faint)]">
              <th className="py-2.5 font-medium">Field</th>
              <th className="py-2.5 font-medium">Extracted Data</th>
              <th className="py-2.5 font-medium">Confidence</th>
              <th className="py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => {
              const cfg = statusConfig[f.status] || statusConfig.missing
              const Icon = cfg.icon
              return (
                <tr key={f.field} className="border-b border-[var(--color-border)]/60 last:border-0">
                  <td className={`py-2.5 pr-4 ${f.status === 'missing' ? cfg.textClass : 'text-[var(--color-text)]'}`}>
                    {f.field}
                  </td>
                  <td className={`py-2.5 pr-4 ${f.status === 'missing' ? cfg.textClass : 'text-[var(--color-text-dim)]'}`}>
                    {f.value}
                  </td>
                  <td className="py-2.5 pr-4 text-[var(--color-text-dim)]">
                    {f.status === 'missing' ? '0%' : `${f.confidence}%`}
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.badgeClass}`}>
                      <Icon size={12} strokeWidth={3} /> {cfg.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}