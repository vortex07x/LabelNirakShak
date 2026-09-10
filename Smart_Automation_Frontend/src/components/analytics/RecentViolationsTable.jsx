// src/components/analytics/RecentViolationsTable.jsx
const severityTint = {
  High: 'bg-[var(--color-bad)]/12 text-[var(--color-bad)]',
  Medium: 'bg-[var(--color-warn)]/12 text-[var(--color-warn)]',
  Low: 'bg-[var(--color-good)]/12 text-[var(--color-good)]',
}

export default function RecentViolationsTable({ rows, onRowClick }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold">Recent Violations</p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-faint)]">
              <th className="py-2.5 pr-4 font-medium">#</th>
              <th className="py-2.5 pr-4 font-medium">Product Name</th>
              <th className="py-2.5 pr-4 font-medium">Brand</th>
              <th className="py-2.5 pr-4 font-medium">Violation Type</th>
              <th className="py-2.5 pr-4 font-medium">Location</th>
              <th className="py-2.5 pr-4 font-medium">Date</th>
              <th className="py-2.5 pr-4 font-medium">Severity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => onRowClick?.(r)}
                className="cursor-pointer border-b border-[var(--color-border)]/60 text-[13px] last:border-0 hover:bg-white/5"
              >
                <td className="py-2.5 pr-4 text-[var(--color-text-faint)]">{r.id}</td>
                <td className="py-2.5 pr-4 font-medium text-[var(--color-text)]">{r.product}</td>
                <td className="py-2.5 pr-4 text-[var(--color-text-dim)]">{r.brand}</td>
                <td className="py-2.5 pr-4 text-[var(--color-text-dim)]">{r.type}</td>
                <td className="py-2.5 pr-4 text-[var(--color-text-dim)]">{r.location}</td>
                <td className="py-2.5 pr-4 text-[var(--color-text-faint)]">{r.date}</td>
                <td className="py-2.5 pr-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityTint[r.severity]}`}>{r.severity}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}