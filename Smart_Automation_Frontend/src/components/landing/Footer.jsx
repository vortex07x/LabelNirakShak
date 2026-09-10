import { ShieldCheck } from 'lucide-react'

const columns = [
  { title: 'Product', links: ['Features', 'Solutions', 'Pricing', 'Industries'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact'] },
  { title: 'Resources', links: ['Documentation', 'API', 'Support'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Compliance'] },
]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent-light)]">
                <ShieldCheck size={17} strokeWidth={2.25} />
              </span>
              <span className="font-display text-sm font-bold">LabelNirakShak AI</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[var(--color-text-faint)]">
              AI-powered compliance scanning for packaged commodities, built for brands and regulators alike.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-xs font-bold text-[var(--color-text)]">{col.title}</h4>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13px] text-[var(--color-text-faint)] hover:text-[var(--color-text-dim)] transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-center text-xs text-[var(--color-text-faint)]">
          © {new Date().getFullYear()} LabelNirakShak AI. Demo interface — not a real regulatory service.
        </div>
      </div>
    </footer>
  )
}