import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-3 py-2 text-xs shadow-lg">
      <p style={{ color: d.payload.color }} className="font-semibold">{d.name}</p>
      <p className="text-[var(--color-text-faint)]">{d.value}% of scans</p>
    </div>
  )
}

export default function CategoryDonut({ data, total }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="font-display text-sm font-bold">Product Categories</p>

      <div className="relative mt-2 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={2} stroke="none">
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-extrabold">{total}</span>
          <span className="text-[11px] text-[var(--color-text-faint)]">Total Scans</span>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[var(--color-text-dim)]">
              <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="font-medium text-[var(--color-text-faint)]">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}