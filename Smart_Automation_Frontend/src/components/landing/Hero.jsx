import { Link } from 'react-router-dom'
import { Sparkles, Play, ScanLine, ShieldCheck as RuleIcon, FileCheck2, Lock } from 'lucide-react'
import heroImage from '../../assets/hero_section.png'

const badges = [
  { icon: ScanLine, label: 'AI-Powered OCR' },
  { icon: RuleIcon, label: 'Rule-Based Compliance Engine' },
  { icon: FileCheck2, label: 'Regulation Ready' },
  { icon: Lock, label: 'Secure & Private' },
]

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-grid">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--color-accent)]/18 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-16 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-white/5 px-3 py-1.5 text-xs font-medium text-[var(--color-accent-light)]">
            <Sparkles size={13} /> AI-Powered Compliance Scanner
          </span>

          <h1 className="font-display mt-6 max-w-xl text-[2.6rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            Ensure packaged commodity compliance with{' '}
            <span className="text-[var(--color-accent-light)]">LabelNirakShak AI</span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--color-text-dim)]">
            Instantly scan, extract, and validate critical details like MRP, expiry date,
            net quantity, batch number, and FSSAI information in seconds. Ensure accuracy.
            Stay compliant.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/scan"
              className="rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(59,130,246,0.65)] hover:bg-[var(--color-accent-light)] transition-colors"
            >
              Start Scanning Now →
            </Link>
            <button className="flex items-center gap-2 rounded-lg border border-[var(--color-border-strong)] px-5 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-white/5 transition-colors">
              <Play size={14} /> See How It Works
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {badges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[13px] text-[var(--color-text-dim)]">
                <Icon size={15} className="text-[var(--color-accent-light)]" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-0 m-auto h-72 w-72 rounded-full bg-[var(--color-accent)]/25 blur-[90px]" />
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <img
                src={heroImage}
                alt="Label compliance scanning dashboard"
                className="h-64 w-auto object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]"
              />
              <span className="absolute -right-3 top-6 h-2.5 w-2.5 rounded-full bg-[var(--color-good)] shadow-[0_0_12px_2px_rgba(34,197,94,0.7)]" />
            </div>
            <div className="relative mt-6 h-3 w-48 rounded-full bg-[var(--color-accent)]/25 blur-md" />
            <div className="relative -mt-2 h-40 w-56 rounded-[50%] border border-[var(--color-border-strong)]/60" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
          </div>
        </div>
      </div>
    </section>
  )
}