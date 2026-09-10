import { ScanLine, AlertTriangle, ShieldCheck, Clock, ArrowUp, ArrowDown } from 'lucide-react'

const icons = [ScanLine, AlertTriangle, ShieldCheck, Clock]
const tints = ['bg-[var(--color-accent)]/12 text-[var(--color-accent-light)]', 'bg-[var(--color-bad)]/12 text-[var(--color-bad)]', 'bg-[var(--color-good)]/12 text-[var(--color-good)]', 'bg-[var(--color-warn)]/12 text-[var(--color-warn)]']

export default function StatCard({ stat, index }) {
  const Icon = icons[index]
  const up = stat.deltaDir === 'up'
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tints[index]}`}>
          <Icon size={17} strokeWidth={2} />
        </span>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? 'text-[var(--color-good)]' : 'text-[var(--color-bad)]'}`}>
          {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {stat.delta}
        </span>
      </div>
      <p className="mt-4 font-display text-2xl font-extrabold tracking-tight">{stat.value}</p>
      <p className="mt-1 text-xs text-[var(--color-text-faint)]">{stat.label}</p>
      <p className="text-[11px] text-[var(--color-text-faint)]/70">{stat.vs}</p>
    </div>
  )
}