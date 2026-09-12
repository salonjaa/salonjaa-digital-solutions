/**
 * Slow-moving diffuse light blobs behind the hero — pure CSS (radial
 * gradients + blur + `@keyframes drift-*` from globals.css), no canvas or
 * external images. Animation is removed entirely under
 * `prefers-reduced-motion` via the media query in globals.css.
 */
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow" />
      <div
        className="hero-blob-a absolute left-[10%] top-[8%] h-[42vw] w-[42vw] max-w-[560px] max-h-[560px] rounded-full opacity-40 blur-3xl"
        style={{ backgroundImage: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))" }}
      />
      <div
        className="hero-blob-b absolute right-[6%] top-[28%] h-[34vw] w-[34vw] max-w-[440px] max-h-[440px] rounded-full opacity-30 blur-3xl"
        style={{ backgroundImage: "linear-gradient(135deg, var(--accent-violet), var(--accent-emerald))" }}
      />
      {/* Faint grid — reads as premium/technical texture without a real image asset */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]">
        <defs>
          <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void" />
    </div>
  );
}
