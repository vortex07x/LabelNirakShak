import { ScanLine, ShieldCheck, Zap, FileBarChart2 } from 'lucide-react'

const icons = [ScanLine, ShieldCheck, Zap, FileBarChart2]

export default function WhyChoose({ features }) {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="text-center font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
        Why choose <span className="text-[var(--color-accent-light)]">LabelNirakShak AI</span>?
      </h2>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => {
          const Icon = icons[i]
          return (
            <div
              key={f.title}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors hover:border-[var(--color-border-strong)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/12 text-[var(--color-accent-light)]">
                <Icon size={19} strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 font-display text-sm font-bold">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-dim)]">{f.desc}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}