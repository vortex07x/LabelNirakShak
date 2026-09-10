export default function TrustedBy({ logos }) {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-[var(--color-text-faint)]">
          Trusted by compliance leaders &amp; industry innovators
        </p>
        <div className="trusted-marquee mt-6" aria-label="Trusted companies">
          <div className="trusted-marquee-track">
            {[...logos, ...logos].map((name, index) => (
              <span
                key={`${name}-${index}`}
                className="trusted-marquee-item font-display text-lg font-bold text-[var(--color-text-faint)]/80"
                aria-hidden={index >= logos.length}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}