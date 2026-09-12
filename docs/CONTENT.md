# Content Migration

## 2026 rebuild: dark theme, 9-section structure

The site was rebuilt against a new prompt calling for a premium dark-themed
visual language, a Framer Motion + GSAP/Lenis motion stack, and a page
restructured into **exactly 9 sections**: navbar+hero, about, services,
work (pinned horizontal-scroll), testimonials, plans, team, contact,
footer. All existing real content (team bios, contact details, the 3 real
portfolio projects, the 5-tier INR pricing) was **preserved**, restyled and
reorganized rather than replaced — the only invented/placeholder copy is
the hero's marketing language, the testimonials, and the client wordmark
strip, each flagged below.

Two things that existed before were deliberately dropped, not carried
forward in any form, per the site owner's decision:

| Removed | Was | Why |
|---|---|---|
| **Domain & Hosting** section | `src/content/domain.ts`, `DomainHosting.tsx` | Not one of the prompt's 9 sections. The service itself is still mentioned — folded into the Services section's first pillar ("Web & App Development") as a tag/description line — only the dedicated section is gone. |
| **Callback request form** | `Callback.tsx`, `CallbackForm.tsx`, `TimeChipGroup.tsx`, `callbackSchema`/`sendCallbackEmail`, `/api/callback` | Not one of the prompt's 9 sections; the Contact section's form covers the same lead-capture need. |

Also merged rather than dropped: the old standalone **"Why Us"** section
(`WhyUs.tsx`) is now a value-card row under the About section
(`about.whyCards` in `src/content/about.ts`), matching the prompt's
structure for section 2. The old **stat strip** band
(`StatStrip.tsx`/`stats.ts`) became the hero's small credibility-badge row
(`hero.badges` in `src/content/hero.ts`).

| Section | Content file | Component | Notes |
|---|---|---|---|
| Nav | `src/content/nav.ts` | `Navbar.tsx`, `MobileMenu.tsx`, `Footer.tsx` (Links column) | Trimmed to the prompt's 5 links (Services, Works, Plans, Team, Contact); About is reachable from the footer's Company column instead. |
| Hero | `src/content/hero.ts` | `Hero.tsx`, `HeroBackground.tsx` | Rewritten copy; trust-row number claims avoided (see below) in favor of qualitative, defensible statements. |
| About | `src/content/about.ts` | `About.tsx` | Story + stat panel preserved; `whyCards` merged in from the old WhyUs section. |
| Services | `src/content/services.ts` | `Services.tsx` | Consolidated from 6 items into the prompt's exact 3 pillars (Web & App Development / Product & UI/UX Design / Digital Marketing & Growth); domain & hosting folded in as a tag. |
| Work | `src/content/work.ts` | `Work.tsx`, `WorkMockup.tsx` | 3 real, live projects — Dr. G. Rajeswari Patra's practice site, the GIET E-YUVA Centre, and Kumar Prasannajit's personal portfolio — restructured into the pinned-panel format (added an `outcome` line per project, stack tags pulled from each site's actual markup/meta tags). Renders as 3 panels, not the prompt's example 4 — there's no 4th real project to show, and inventing one for a real client-facing site wasn't an option. |
| Testimonials | `src/content/testimonials.ts` | `Testimonials.tsx` | **Placeholder, see below.** Expanded from 3 to 4 quotes for the carousel; added an invented, clearly-fictional client-wordmark strip. |
| Plans (pricing) | `src/content/plans.ts` (renamed from `pricing.ts`) | `Plans.tsx` (renamed from `Pricing.tsx`) | The real 5-tier INR pricing (Bronze/Silver/Gold/Platinum/Diamond) is preserved as-is — not replaced with the prompt's illustrative 3-tier example. Gold is flagged "Most Popular". |
| Team | `src/content/team.ts` (derives from `site.ts`) | `Team.tsx` | Real photos kept (`public/images/team/*.jpg`) rather than switching to the prompt's suggested gradient-initial placeholder avatars — real, non-stock photos already existed, so there was nothing to placeholder. |
| Contact | `src/content/contact.ts` | `Contact.tsx`, `ContactForm.tsx` | Added the "Project Type" select the prompt calls for. Backend unchanged — still a real Resend-backed Route Handler (`/api/contact`), not the prompt's "wire this up yourself" placeholder, since a working integration already existed. |
| Footer | `src/content/site.ts`, `nav.ts` | `Footer.tsx` | Rebuilt to the prompt's 4-column layout (Brand / Links / Company / Contact). "Careers", "Blog", "Privacy Policy", "Terms of Use" are inert placeholder labels — no pages exist yet. |

## Testimonials — placeholder, not real

The four testimonials (Priya Sharma, Rohit Verma, Ananya Das, Debasish
Patra) are invented/placeholder content, carried over and extended from the
previous site, where they were already explicitly marked as sample content
pending real client quotes. They are **not real reviews**, and the
client-wordmark strip below them (Nimbus, Verafield, Arklyne, Havendesk,
Grovemark) is invented logotypes, not real client logos. Replace both in
`src/content/testimonials.ts` as soon as genuine material is available —
until then, the `// NOTE:` comment at the top of that file (and of
`Testimonials.tsx`) should stay in place as a reminder.

## Trust claims — no fabricated numbers

The prompt's example hero copy ("Trusted by 40+ growing brands", "98%
client retention") calls for invented-but-specific numeric claims. For a
real two-person studio with 3 documented projects, a specific fabricated
count would be a false, checkable claim, not a stylistic placeholder — so
the hero's trust row and badge chips use qualitative, defensible statements
instead ("Real products shipped, not just mockups", "Custom-Built, Not
Templated", "Domain & Hosting Included", etc.), each grounded in something
actually true about the studio.

## Known gaps carried forward

- **GIET E-YUVA Centre** portfolio link (`src/content/work.ts`) points to
  `#` — the previous site referenced a Vercel preview URL that wasn't
  captured verbatim during the original migration. Fill in the real URL
  when available.
- **Brand mark**: the Salonjaa "S" mark (`public/images/logo-mark.png`,
  rendered via `BrandMark.tsx`) already reads well on the new dark
  background unmodified — no rework needed.
- **Og-image**: generated dynamically (`src/app/opengraph-image.tsx`),
  recolored to the dark theme's void background + accent gradient.
