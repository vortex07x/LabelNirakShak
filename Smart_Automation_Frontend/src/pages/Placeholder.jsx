import Sidebar from '../components/dashboard/Sidebar.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'

export default function Placeholder({ title }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <DashboardHeader title={title} />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="font-display text-sm font-bold text-[var(--color-text-dim)]">{title} is not part of this demo</p>
          <p className="max-w-xs text-xs text-[var(--color-text-faint)]">
            This build focuses on the landing page, Scan dashboard, and Analytics dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}