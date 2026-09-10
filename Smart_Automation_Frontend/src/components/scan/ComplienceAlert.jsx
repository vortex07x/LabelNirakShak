// src/components/scan/ComplienceAlert.jsx
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ComplianceAlert({ fields = [] }) {
  const missingFields = fields.filter((f) => f.status === 'missing')
  const lowConfidenceFields = fields.filter((f) => f.status === 'low_confidence')

  if (missingFields.length === 0 && lowConfidenceFields.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-good)]/35 bg-[var(--color-good)]/8 p-4">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--color-good)]" />
        <div>
          <p className="text-sm font-semibold text-[var(--color-good)]">Compliance Passed</p>
          <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
            All mandatory declarations were detected on this package with high confidence.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {missingFields.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-bad)]/35 bg-[var(--color-bad)]/8 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--color-bad)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-bad)]">
              Compliance Failed: {missingFields.length} mandatory {missingFields.length === 1 ? 'detail' : 'details'} missing
            </p>
            <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
              Please ensure the following are present on the package: {missingFields.map((f) => f.field).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {lowConfidenceFields.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-warn)]/35 bg-[var(--color-warn)]/8 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-[var(--color-warn)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-warn)]">
              {lowConfidenceFields.length} {lowConfidenceFields.length === 1 ? 'field needs' : 'fields need'} manual verification
            </p>
            <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">
              These were detected but with low OCR confidence — please visually confirm: {lowConfidenceFields.map((f) => f.field).join(', ')}.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}