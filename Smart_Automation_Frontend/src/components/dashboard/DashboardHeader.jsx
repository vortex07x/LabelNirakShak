import { Menu } from 'lucide-react'

export default function DashboardHeader({ title, badge, onMenuClick, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-4 md:px-8">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-dim)] hover:bg-white/5 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>
        )}
        <h1 className="font-display text-lg font-bold tracking-tight">{title}</h1>
        {badge}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  )
}