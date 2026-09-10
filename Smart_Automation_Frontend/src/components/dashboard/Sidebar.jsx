// src/components/dashboard/Sidebar.jsx
import {
  LayoutDashboard, ScanLine, History, FileBarChart2, Package,
  BellRing, Settings, LogOut, ShieldCheck, ListChecks, X,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const navItems = [
  { to: '/analytics', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scan', label: 'Scan', icon: ScanLine },
  { to: '/history', label: 'History', icon: History },
  { to: '/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const adminNavItems = [
  { to: '/admin/rules', label: 'Rules', icon: ListChecks },
]

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { user } = useAuth()
  const items = user?.role === 'admin' ? [...navItems, ...adminNavItems] : navItems

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 transition-transform duration-200 md:static md:z-auto md:flex md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="mb-8 flex items-center justify-between px-2">
            <a href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent-light)]">
                <ShieldCheck size={18} strokeWidth={2.25} />
              </span>
              <span className="font-display font-bold text-[15px] tracking-tight">
                LabelNirakShak <span className="text-[var(--color-accent-light)]">AI</span>
              </span>
            </a>
            <button onClick={onClose} className="text-[var(--color-text-dim)] md:hidden" aria-label="Close menu">
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--color-accent)]/12 text-[var(--color-accent-light)] font-medium'
                      : 'text-[var(--color-text-dim)] hover:bg-white/5 hover:text-[var(--color-text)]'
                  }`
                }
              >
                <Icon size={17} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--color-text-dim)] hover:bg-white/5 hover:text-[var(--color-text)] transition-colors">
          <LogOut size={17} strokeWidth={2} />
          Back to Home
        </Link>
      </aside>
    </>
  )
}