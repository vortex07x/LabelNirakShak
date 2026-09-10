import { Beef, SprayCan, Pill, Wheat, FlaskConical, ShoppingBag } from 'lucide-react'

const icons = [Beef, SprayCan, Pill, Wheat, FlaskConical, ShoppingBag]

export default function Industries({ industries }) {
  return (
    <section id="industries" className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Built for every industry</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--color-text-dim)]">
          From food &amp; beverages to FMCG and pharmaceuticals, LabelNirakShak AI ensures compliance across the board.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {industries.map((ind, i) => {
          const Icon = icons[i]
          return (
            <div
              key={ind.name}
              className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-8 text-center transition-colors hover:border-[var(--color-border-strong)]"
            >
              <Icon size={22} className="text-[var(--color-accent-light)]" strokeWidth={1.8} />
              <span className="text-[13px] font-medium text-[var(--color-text-dim)]">{ind.name}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}