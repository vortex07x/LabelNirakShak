import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ranges = ['Daily', 'Weekly', 'Monthly']

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-3 py-2 text-xs shadow-lg">
      <p className="text-[var(--color-text-faint)]">{label}</p>
      <p className="mt-0.5 font-semibold text-[var(--color-accent-light)]">{payload[0].value.toLocaleString()} violations</p>
    </div>
  )
}

export default function ViolationsChart({ data }) {
  const [range, setRange] = useState('Daily')

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold">Violations Over Time</p>
        <div className="flex items-center rounded-lg border border-[var(--color-border)] p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent-light)]' : 'text-[var(--color-text-faint)] hover:text-[var(--color-text-dim)]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="violationFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293e" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#5c6a84', fontSize: 11 }} axisLine={{ stroke: '#1e293e' }} tickLine={false} />
            <YAxis tick={{ fill: '#5c6a84', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.25} fill="url(#violationFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}