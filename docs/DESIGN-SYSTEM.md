# Design System

**2026 rebuild note:** this replaces the site's original "Soft & Friendly"
pastel-glassmorphism theme with a dark, premium-enterprise visual language
("Signal") — near-black surfaces, an electric cyan→violet gradient, and a
signature pinned horizontal-scroll section. If you're looking for the old
teal/blue/violet-on-white tokens, they no longer exist; everything below is
current.

The visual direction is dark and technical: a near-black background, a
single accent gradient (cyan → violet) reserved for headline highlights,
button borders, and glow accents, and thin 1px/1.5px gradient-hairline
borders on every card, chip, and pill button instead of a filled surface.

All tokens live as CSS custom properties in `src/app/globals.css` (Tailwind
v4 uses CSS-first config — there's no `tailwind.config.ts`; the `@theme
inline` block maps these variables into Tailwind utility classes).

## Color tokens

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| Void | `#07080B` | `bg-void` | Page background |
| Charcoal | `#0D0F14` | `bg-charcoal` | Alternating section backgrounds (About, Work, Team) |
| Surface | `#12141B` | `bg-surface` | Default card/chip fill |
| Surface raised | `#171A22` | `bg-surface-raised` | "Featured" card fill (e.g. the popular plan) |
| Cyan | `#22D3EE` | `text-cyan` / `border-cyan` | Gradient stop, micro-labels, links |
| Violet | `#8B5CF6` | `text-violet` | Gradient stop |
| Emerald | `#2DD4BF` | `text-emerald` | Secondary accent — success states, check icons, stats |
| Text primary | `#F5F7FB` (`text-white` in practice) | — | Headings, high-emphasis text |
| Text secondary | `rgba(245,247,251,.72)` | `text-text-secondary` | Body copy |
| Text muted | `rgba(245,247,251,.5)` | `text-text-muted` | Captions, footnotes |

Accent gradient: `--gradient-accent: linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%)`,
exposed as `.text-gradient-accent` and `.bg-gradient-accent`. Use it for
headline highlight words, the primary button's hover glow, active-tab
underlines, and count-up numbers — never as a large background fill (that's
what keeps the theme reading as premium/technical rather than garish).

## Typography

- **Space Grotesk** (weights 500/600/700) — headings, the brand wordmark,
  numbers/stats. Applied via the `.font-display` utility and automatically
  on `h1`–`h4`.
- **Inter** (weights 400–900) — body text, the default.
- Both are loaded via `next/font/google` in `src/app/layout.tsx`
  (self-hosted, no runtime request to Google Fonts).
- The hero headline runs up to `text-[5rem]` on desktop with tight,
  slightly negative letter-spacing (`-0.02em`, set globally on headings) —
  everything else uses the more modest 3xl/4xl scale via `SectionHeading`.

## Spacing & radius

- `--radius-sm: 8px`, `--radius: 16px`, `--radius-lg: 24px` — cards use
  `rounded-2xl`; pills/chips/buttons use fully-rounded (`rounded-full`).
- `--container: 1200px` — the shared max content width, applied via the
  `.container-app` utility class (`max-width` + centered + side padding).

## Gradient-border system

Defined in `globals.css`:

| Class | Use |
|---|---|
| `.gradient-border` | The 1px cyan→violet hairline ring (mask/`exclude` trick — no extra wrapper element needed). Declared with `@utility` (not a plain `@layer components` class) specifically so `.card-glass`/`.chip` can `@apply` it — Tailwind v4 only allows `@apply`-ing real utilities. |
| `.gradient-border-btn` | Modifier: widens the ring to 1.5px via the `--gb-width` custom property, for the signature pill CTA. |
| `.card-glass` | `.gradient-border` + `rounded-2xl` + `bg-surface` + drop shadow — the base dark card surface (forms, mobile menu). |
| `.card-glass-hover` | Hover state: lifts `-translate-y-1` and brightens the shadow. `GlassCard` applies this by default (`hover` prop). |
| `.chip` | Small gradient-bordered pill (badges, tag lists, plan tags). |
| `.glass-nav` | Sticky nav backdrop — blurred, translucent void background; gains a stronger background once `data-scrolled="true"` is set by `Navbar`'s scroll listener. |
| `.bg-hero-glow` | Multi-color radial-gradient wash behind the hero (see `HeroBackground.tsx`). |

**Rule of thumb**: any card, chip, or pill in this design gets a gradient
hairline border, not a solid-color border — reach for `.gradient-border`
(or `GlassCard`/`chip`, which already include it) rather than a plain
`border`.

## Motion: Framer Motion (reveals) vs. GSAP (everything else)

- **Scroll-reveal**: use `<SectionReveal>` / `<SectionRevealItem>`
  (`src/components/ui/SectionReveal.tsx`) — a thin wrapper around Framer
  Motion implementing the site-wide convention: `initial={{opacity:0,
  y:40}}`, `whileInView={{opacity:1, y:0}}`, `viewport={{once:true,
  amount:0.2}}`, ~0.1s `staggerChildren` for grids (wrap each grid item in
  `<SectionRevealItem>` to pick up the stagger). It branches on
  `prefers-reduced-motion` via `usePrefersReducedMotion` and renders
  statically (no animation) when it's set.
- **The hero is the one exception**: it animates in on mount
  (`initial`/`animate`, not `whileInView`) since above-the-fold content
  must be visible immediately, not wait on a scroll-into-view event.
- **The Works section's pinned horizontal scroll is GSAP + ScrollTrigger
  only** (see `Work.tsx`) — Framer Motion doesn't do scroll-scrubbed
  pinning. It's gated behind `gsap.matchMedia("(min-width: 1024px) and
  (prefers-reduced-motion: no-preference)")`, so on touch/tablet or under
  reduced motion, no JS runs at all and the panels render as a normal
  vertical stack via plain responsive Tailwind classes.
- **Lenis smooth-scroll** (`LenisProvider.tsx`) wraps the whole app and is
  synced to GSAP's ticker (`lenis.on('scroll', ScrollTrigger.update)` +
  `gsap.ticker.add`) so it doesn't fight the Works section's pin/scrub.
  Skipped on coarse-pointer devices and under reduced motion — touch
  scrolling stays native.
- **Count-up numbers**: use `<StatNumber value={...} />`
  (`src/components/ui/StatNumber.tsx`) — GSAP-driven, scroll-triggered,
  reduced-motion aware.
- **Plugin registration**: happens once, at module-evaluation time in
  `src/lib/gsap.ts` (guarded by `typeof window !== "undefined"`) — every
  file that needs `gsap`/`ScrollTrigger` imports them from there, never
  from the `gsap` package directly. A `useEffect`-based registration (the
  original approach) races against any descendant component that uses
  `ScrollTrigger` in its own mount-time effect, since React fires effects
  bottom-up: a child can run before the registering provider's effect
  does, silently breaking its `scrollTrigger` config. Don't call
  `gsap.registerPlugin` anywhere else.
- **Cleanup**: every GSAP hook/effect in this codebase kills its own
  tweens/triggers on unmount or media-query change (`ctx.revert()`,
  `ScrollTrigger.getAll().forEach(t => t.kill())`, `mm.revert()`). Follow
  the same pattern in new code — otherwise Fast Refresh in dev accumulates
  duplicate ScrollTriggers.

## Custom cursor & magnetic hover

- Any element that should react to the custom cursor (the ring grows on
  hover) needs a `data-cursor-hover` attribute — `Button` and `GlassCard`
  set it automatically; add it manually to bespoke interactive elements.
- `useMagneticHover` (used inside `Button`) pulls the element gently toward
  the pointer while hovered. Disabled on touch devices (`pointer: coarse`)
  and when `prefers-reduced-motion: reduce` is set.
- `CustomCursor` itself renders nothing on touch devices, checked via
  `useIsTouchDevice`.

## OG image

`src/app/opengraph-image.tsx` generates the social preview image at
request time using `next/og`'s `ImageResponse` (brand name in the accent
gradient + tagline on the void background) — there's no static
`public/og-image.png` to keep in sync manually.
