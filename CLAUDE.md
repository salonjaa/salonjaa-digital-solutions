# CLAUDE.md

Guidance for Claude Code (or any future contributor) working in this repo.

## What this is

The marketing site for **Salonjaa Digital Solutions**, a two-person freelance
web, app, and digital-marketing studio in Bhubaneswar. As of the 2026
rebuild it follows a premium dark-themed "signature scroll" visual language
(see `docs/DESIGN-SYSTEM.md`) — a single long-scrolling page with exactly
9 sections, in order: navbar + hero, about, services, work/portfolio (a
pinned horizontal-scroll interaction), testimonials, plans (pricing), team,
contact, and footer. There is deliberately no separate "domain & hosting"
section or callback-request form anymore — see `docs/CONTENT.md` for what
changed and why.

## Tech stack

- **Next.js** (App Router, TypeScript), deployed to **Vercel**.
- **Tailwind CSS v4** (CSS-first config via `@theme`/`@utility` in
  `globals.css` — there is no `tailwind.config.ts`; design tokens live as
  CSS custom properties).
- **Framer Motion** for scroll-triggered reveal animations (`SectionReveal`/
  `SectionRevealItem`, `whileInView`) on every section except the hero
  (animates in on mount, not on scroll) and the Works section.
- **GSAP** + `ScrollTrigger` for the one thing Framer Motion doesn't do
  here: the Works section's pinned horizontal-scroll interaction. Also
  still used for the custom cursor, magnetic hover buttons, and count-up
  numbers (`StatNumber`).
- **Lenis** for buttery smooth-scroll on desktop (`LenisProvider`), synced
  to GSAP's ticker so `ScrollTrigger.update` stays in lockstep with it —
  see the comment in `LenisProvider.tsx` before touching either. Skipped
  entirely on coarse-pointer (touch) devices and under
  `prefers-reduced-motion`.
- **Resend** for transactional email (contact form submissions), called
  from a Next.js Route Handler — no Netlify Forms, no Server Actions.
- **zod** for form validation (shared shape between client and server).

## Directory map

```
src/
  app/            layout.tsx (fonts, metadata, global chrome), page.tsx (section
                  composition), globals.css (design tokens + gradient-border
                  utilities + marquee/blob keyframes), api/contact/route.ts,
                  robots.ts, sitemap.ts, opengraph-image.tsx (generated OG image)
  components/
    layout/       Navbar, MobileMenu, Footer, BackToTop, BrandMark
    sections/     one component per homepage section (Hero, About, Services,
                  Work, Testimonials, Plans, Team, Contact) + HeroBackground,
                  WorkMockup (the CSS-drawn device-frame graphic)
    ui/           shared atoms: GlassCard, Button, GradientButton,
                  SectionReveal/SectionRevealItem, SectionLabel,
                  SectionHeading, StatNumber, MarqueeStrip, FormStatusMessage
    cursor/       CustomCursor
    forms/        ContactForm (client component, fetch-based)
    providers/    GsapProvider (app-lifetime ScrollTrigger cleanup),
                  LenisProvider (smooth-scroll, synced to the GSAP ticker)
  content/        one .ts file per section's copy (typed data, no JSX) +
                  site.ts (brand name/contact/address — single source of truth)
  lib/            gsap.ts (registers ScrollTrigger — see below), resend.ts,
                  validation.ts, rateLimit.ts, cn.ts, lenisInstance.ts
  hooks/          useMagneticHover, usePrefersReducedMotion, useIsTouchDevice
public/           images/team/*.jpg, images/logo-mark.png, files/*.pdf
docs/             DESIGN-SYSTEM.md, CONTENT.md
```

## Conventions

- **Copy lives in `src/content/*.ts`, never hardcoded in a component.** If
  you're changing wording, pricing, team info, etc., edit the content file —
  components should stay presentational.
- **`src/content/site.ts` is the single source of truth** for the brand name,
  tagline, addresses, and phone/email for both team members. Import from
  there rather than typing contact details inline.
- **New sections should use `<SectionReveal>` / `<SectionRevealItem>`**
  (`src/components/ui/SectionReveal.tsx`) for their scroll-in animation —
  it's a thin Framer Motion wrapper implementing the site-wide convention
  (`initial={{opacity:0,y:40}}`, `whileInView={{opacity:1,y:0}}`,
  `viewport={{once:true,amount:0.2}}`, ~0.1s stagger for grids) and already
  branches on `prefers-reduced-motion` via `usePrefersReducedMotion`, so
  just use it rather than writing a one-off `motion.div`. The hero is the
  one exception — it animates in on mount (`initial`/`animate`, no
  `whileInView`) since above-the-fold content must be visible immediately,
  not wait on a scroll event.
- **The Works section's pinned horizontal scroll is GSAP-only** — see the
  comment block at the top of `src/components/sections/Work.tsx` before
  changing it. It uses `gsap.matchMedia("(min-width: 1024px) and
  (prefers-reduced-motion: no-preference)")` to register the pin/scrub, so
  under that query's complement the panels just sit in their normal
  CSS-driven vertical stack — no separate fallback markup to keep in sync.
- **Interactive elements that should react to the custom cursor** (grow the
  ring on hover) need a `data-cursor-hover` attribute. `Button` and
  `GlassCard` already apply it by default.
- **Always import `gsap`/`ScrollTrigger` from `src/lib/gsap.ts`, never
  directly from the `gsap` package.** That module registers `ScrollTrigger`
  at module-evaluation time (guarded for SSR), which is the one thing that
  reliably runs before every consumer's own code. Registering inside a
  `useEffect` (the previous approach, in `GsapProvider`) raced against any
  descendant using `ScrollTrigger` in its *own* mount-time effect — React
  fires effects bottom-up on initial mount, so `Work.tsx`/`StatNumber.tsx`
  could run before the provider's effect ever did, producing "Missing
  plugin?" and a silently-broken, unpinned/unscrubbed tween. If you add a
  new file that needs GSAP, `import gsap from "@/lib/gsap"` (and/or
  `{ ScrollTrigger }`) rather than `"gsap"` directly.
- **The `.gradient-border` utility** (globals.css) is declared with
  `@utility`, not a plain `@layer components` class — Tailwind v4 can only
  `@apply` real utilities, and `.card-glass`/`.chip` both compose it that
  way. Keep new gradient-bordered classes on the same pattern.
- **Forms** are plain client components (`fetch` to a Route Handler), not
  Server Actions — see `docs/DESIGN-SYSTEM.md` for why. The API route
  validates with zod, checks a honeypot field, then rate-limits before
  calling Resend.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # fill in RESEND_API_KEY etc.
npm run dev
```

Required env vars (see `.env.local.example`): `RESEND_API_KEY`,
`CONTACT_FROM_EMAIL` (must be on a domain verified in Resend for production
delivery), `CONTACT_TO_KUMAR`, `CONTACT_TO_SAROJ`.

`npm run build`, `npm run start`, and `npm run lint` all work as usual.

## How to add a new section

1. Add a content file in `src/content/` (or extend an existing one) with the
   section's copy as typed data.
2. Build the component in `src/components/sections/`, using `GlassCard`,
   `Button`/`GradientButton`, `SectionHeading`, and `SectionReveal` where
   they fit.
3. Import and place it in `src/app/page.tsx`.
4. If it should be reachable from the nav, add an entry to
   `src/content/nav.ts` (shared by `Navbar`, `MobileMenu`, and `Footer`'s
   "Links" column).

## Known follow-ups (not yet done, intentionally)

- **Testimonials are placeholder content**, carried over from the previous
  site — not real client quotes. See `docs/CONTENT.md`.
- **The GIET E-YUVA Centre portfolio panel** links to `#` — the previous
  site referenced a Vercel preview URL that wasn't captured verbatim; fill
  in the real link in `src/content/work.ts` when available.
- **Footer "Company" column placeholders** (Careers, Blog, Privacy Policy,
  Terms of Use) render as inert "(coming soon)" text, not links — build
  those pages and wire up real hrefs in `src/components/layout/Footer.tsx`
  before launch.
- **Rate limiting is in-memory only** (`src/lib/rateLimit.ts`) — fine for
  current traffic, but resets on every serverless cold start. Upgrade to a
  persistent store (e.g. Upstash Redis) if abuse becomes a real problem.
- **`site.url`** in `src/content/site.ts` is a placeholder domain — update
  it once the production domain is confirmed (it feeds `metadataBase`,
  `robots.ts`, and `sitemap.ts`).
