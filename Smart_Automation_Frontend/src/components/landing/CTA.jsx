import { Link } from 'react-router-dom'
import cubeImage from '../../assets/cube.svg'

export default function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] px-8 py-12 sm:px-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--color-accent)]/25 blur-[100px]" />

        <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
          <div className="max-w-md text-center lg:text-left">
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Ready to simplify compliance?
            </h2>
            <p className="mt-3 text-sm text-[var(--color-text-dim)]">
              Join businesses and regulators using AI to ensure accuracy, save time, and stay compliant.
            </p>
            <Link
              to="/scan"
              className="mt-6 inline-block rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(59,130,246,0.65)] hover:bg-[var(--color-accent-light)] transition-colors"
            >
              Get Started for Free →
            </Link>
          </div>

          <div className="relative hidden sm:block">
            <div className="absolute inset-0 m-auto h-32 w-32 rounded-full bg-[var(--color-accent)]/30 blur-2xl" />
            <img src={cubeImage} alt="" className="relative h-80 w-80 object-contain" />
          </div>
        </div>
      </div>
    </section>
  )
}