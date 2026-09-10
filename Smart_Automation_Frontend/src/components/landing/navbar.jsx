import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, ChevronDown, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const links = ['Features', 'Industries']

function AnimatedNavText({ children }) {
  const label = String(children)

  const characters = (className) => (
    <span className={`nav-link-label ${className}`} aria-hidden="true">
      {label.split('').map((character, index) => (
        <span key={`${character}-${index}`}>{character === ' ' ? '\u00a0' : character}</span>
      ))}
    </span>
  )

  return (
    <>
      {characters('nav-link-label-current')}
      {characters('nav-link-label-hover')}
      <span className="sr-only">{label}</span>
    </>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLinkClick = () => {
    setOpen(false)
  }

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)]/70 bg-[var(--color-bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent-light)]">
            <ShieldCheck size={19} strokeWidth={2.25} />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[15px] font-bold tracking-tight">
              LabelNirakShak <span className="text-[var(--color-accent-light)]">AI</span>
            </span>
            <span className="block text-[10px] font-medium tracking-wide text-[var(--color-text-faint)]">
              Compliance. Simplified.
            </span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8 text-sm text-[var(--color-text-dim)]">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="nav-link-animated hover:text-[var(--color-text)] transition-colors"
            >
              <AnimatedNavText>{l}</AnimatedNavText>
            </a>
          ))}
          <button
            className="nav-link-animated flex items-center gap-1 hover:text-[var(--color-text)] transition-colors"
          >
            <AnimatedNavText>Resources</AnimatedNavText> <ChevronDown size={14} />
          </button>
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          {user ? (
            <>
              <span className="text-sm text-[var(--color-text-faint)]">
                {user.email || user.name}
              </span>
              <button
                onClick={handleLogout}
                className="nav-link-animated text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors"
              >
                <AnimatedNavText>Logout</AnimatedNavText>
              </button>
              <Link
                to="/analytics"
                className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.6)] hover:bg-[var(--color-accent-light)] transition-colors"
              >
                Dashboard →
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link-animated flex items-center gap-1 text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors">
                <AnimatedNavText>Login</AnimatedNavText>
              </Link>
              <Link
                to="/scan"
                className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.6)] hover:bg-[var(--color-accent-light)] transition-colors"
              >
                Get Started →
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden text-[var(--color-text)]" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[var(--color-border)] px-6 py-4 flex flex-col gap-4 text-sm text-[var(--color-text-dim)]">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              onClick={handleLinkClick}
              className="nav-link-animated w-fit"
            >
              <AnimatedNavText>{l}</AnimatedNavText>
            </a>
          ))}
          {user ? (
            <>
              <Link to="/analytics" onClick={handleLinkClick} className="rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-center font-semibold text-white">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="w-fit text-left">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={handleLinkClick} className="w-fit">
                Login
              </Link>
              <Link to="/scan" onClick={handleLinkClick} className="rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-center font-semibold text-white">
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}