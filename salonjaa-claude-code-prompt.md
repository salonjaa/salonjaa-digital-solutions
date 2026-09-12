# Claude Code Prompt — Salonjaa Digital Solutions Website

Copy everything in the code block below into Claude Code as your build instruction.

---

## What I saw on engineersmind.com (reference site)

Before the prompt, here's the structural breakdown the prompt is based on, so you know what you're asking for:

- **Look**: near-black background, thin gradient-bordered pill buttons (cyan→violet), bold uppercase tracked micro-labels, big tight-leading headline type with a two-tone gradient on key words, glassy cards with a single-pixel gradient border, generous negative space.
- **Hero**: animated flowing light-trail background (canvas/SVG), trust badges row (certifications), CTA pill button, and — right at the bottom edge of the hero — an **infinite horizontal auto-scrolling marquee** of keyword chips separated by ◆, looping forever, pausing on hover.
- **Sticky navbar**: blurred glass background, stays fixed on scroll, thin bottom border.
- **Signature interaction (the "horizontal scrolling" you noticed)**: a section is **pinned** in the viewport while you scroll vertically — that vertical scroll is translated into **horizontal movement between panels**. Each panel = a product/service (two-column: copy + bullet list on one side, a floating device/dashboard mockup on the other). A top tab-strip lets you jump to a panel directly (active tab gets an underline), and a bottom progress bar shows "01/04 → 04/04" with a "↔ scroll to explore" hint. The section only releases the scroll once you've moved through every panel.
- **Everything else scrolls normally (vertically)** and animates in on scroll: cards fade/slide up, numbers count up, tab-switching content panels (click a label on the left, content + image crossfades on the right), a quote carousel with prev/next circular arrow buttons, a client-logo strip, and a stats/results carousel.
- **Motion**: every section reveals with a subtle fade + upward slide as it enters the viewport; hover states glow/lift; buttons have a gradient border that brightens on hover.

The prompt below asks Claude Code to reproduce this *mechanic and visual language*, rebuilt from scratch with original content for your own company, restructured into exactly the 9 sections you want.

---

## The prompt to paste into Claude Code

```
Build a single-page marketing website for "Salonjaa Digital Solutions," a web,
app development, and digital marketing agency. Recreate the visual language
and scroll mechanics of a premium dark-themed enterprise site (described
below) — but every word of copy, every color choice detail, and every image
must be original to Salonjaa, not copied from anywhere.

STACK
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS for styling
- Framer Motion for scroll-triggered reveal animations
- GSAP + ScrollTrigger for the pinned horizontal-scroll section (see Section 4)
- Lenis for buttery smooth-scroll on desktop
- Keep everything in one project, componentized under /components, one
  component per section, imported into a single page (app/page.tsx)

GLOBAL DESIGN LANGUAGE
- Background: near-black (#07080B) with a slightly lighter charcoal
  (#0D0F14) for alternating sections
- Accent gradient: electric cyan (#22D3EE) → violet (#8B5CF6), used on
  headline highlight words, button borders, underlines, and glow accents
- Secondary accent: emerald/teal (#2DD4BF) for stats and success states
- Typography: a bold geometric sans for headings (use "Space Grotesk" or
  "Sora" from next/font/google), a clean sans for body text (use "Inter")
- Headings are large (3.5–5rem on desktop), tight line-height, with one
  or two words in the site rendered in the cyan→violet gradient via
  `background-clip: text`
- Micro-labels above headings: small, uppercase, letter-spaced, often
  preceded by 2-3 small star or dot icons
- Buttons: pill-shaped, 1.5px gradient border (cyan→violet), transparent
  fill, uppercase letter-spaced label, on hover the border glows brighter
  and the button gets a soft outer glow (box-shadow)
- Cards: dark surface slightly lighter than background, 1px border that's
  a subtle gradient, rounded-xl corners, hover state lifts the card
  (translateY -4px) and brightens the border
- Respect `prefers-reduced-motion`: disable GSAP pin/scrub and marquee
  animation, fall back to simple fades, when the user has it set
- Fully responsive: below 1024px, the pinned horizontal-scroll section in
  Section 4 must degrade to a normal vertical stack (no scroll-jacking on
  touch/mobile — detect via matchMedia and disable GSAP pin there)

BUILD EXACTLY THESE 9 SECTIONS, IN THIS ORDER:

1. NAVBAR + HERO (landing)
   - Fixed/sticky navbar, translucent dark background with backdrop-blur,
     thin bottom border. Logo left ("Salonjaa" wordmark + small "Digital
     Solutions" subtext or icon mark). Center or right nav links: Services,
     Works, Plans, Team, Contact. A gradient-border pill button "Book A
     Free Call" on the far right.
   - Hero fills the viewport: animated background of slow-moving diffuse
     light streaks or a subtle particle/gradient-blob canvas in dark blue/
     violet tones (pure CSS/SVG/canvas, no external images required).
   - Small trust row above the headline: "★ ★ ★ Trusted by 40+ growing
     brands" (or similar, invented — do not use real client names/logos
     unless the user supplies them).
   - Big two-line headline, one line in gradient text, e.g. "Websites And
     Apps That Actually Convert — Built, Launched, Grown."
   - One-paragraph subhead about what Salonjaa does (web design, app
     development, performance marketing).
   - Gradient-border CTA button ("Start Your Project" / "Book A Free
     Call") plus a secondary ghost-style text link ("See our work ↓").
   - Small badge row (invented, generic credibility marks like "5-Star
     Rated", "100+ Projects Delivered", "24/7 Support" — as text/icon
     chips, not fake certification logos).
   - At the very bottom edge of the hero: an infinite auto-scrolling
     horizontal marquee strip (two duplicated tracks animated with
     CSS keyframes translateX, seamless loop) of service keyword chips
     separated by a ◆ or • character, e.g. "UI/UX DESIGN ◆ REACT & NEXT.JS
     ◆ MOBILE APPS ◆ SEO ◆ PAID ADS ◆ BRANDING ◆ E-COMMERCE ◆ AUTOMATION".
     Pause the animation on hover.

2. ABOUT US
   - Two-column layout: left = short story/mission copy about Salonjaa
     Digital Solutions (invented: founding story, what makes the agency
     different, e.g. "engineering-grade execution with marketer's
     instincts"), right = a stat block or a stacked pair of image
     placeholders with a floating glass card overlay showing a stat
     (e.g. "40+ Products Shipped", "98% Client Retention").
   - Below that, a row of 3-4 small "why us" value cards with icon,
     title, one-line description (fade/slide-up on scroll, staggered).

3. SERVICES
   - Section intro: micro-label + big two-line heading ("What We Build.
     What We Grow.") + short supporting paragraph, right-aligned like the
     reference site's "Three pillars" section.
   - 3-column card grid (stacks to 1 column on mobile) for the core
     service pillars, each with a top image/graphic area, title, 2-3
     line description, and a row of small skill/tech tag pills at the
     bottom. Suggested pillars:
       1. "Web & App Development" — Next.js, React Native, Node.js,
          PostgreSQL, tags like: React, Next.js, React Native, Node.js
       2. "Product & UI/UX Design" — Figma, design systems, prototyping,
          tags like: Figma, Design Systems, Prototyping, User Research
       3. "Digital Marketing & Growth" — SEO, paid ads, funnels,
          analytics, tags like: SEO, Meta Ads, Google Ads, Analytics
   - Cards lift and their border brightens on hover.

4. WORKS / PORTFOLIO — THE SIGNATURE PINNED HORIZONTAL-SCROLL SECTION
   - This is the centerpiece interaction. Build a full-viewport-height
     section that GSAP ScrollTrigger PINS in place while the user scrolls
     vertically; translate that vertical scroll delta into horizontal
     `xPercent` translation across 4 project panels (use `scrub: true`
     and a timeline of `.to(track, {xPercent: -100 * (panels - 1)})`).
   - A top tab-strip lists the 4 project names (or case-study
     categories) side by side; clicking a tab scrolls/animates directly
     to that panel's scroll position; the active tab gets an underline
     that fills in the gradient color and gains a small glowing dot.
   - Each panel: two-column layout — left/right alternates or stays
     consistent — one side has the project name in large gradient text,
     a one-line category ("SaaS Dashboard" / "E-Commerce App" /
     "Booking Platform" / "Marketing Site"), a 3-4 line result-oriented
     description, a small italic "outcome" line (e.g. "Launched in 6
     weeks, 3x organic traffic in 90 days."), and an "Explore" pill
     button. The other side shows a floating browser/phone mockup frame
     (CSS-drawn, with a colored dot traffic-light header) containing a
     simple placeholder dashboard/UI graphic (divs styled as chart bars,
     stat tiles, list rows — do not use real client screenshots).
   - Bottom-left: "0X / 04" counter that updates as you scroll through
     panels. Bottom-right: a thin horizontal progress bar that fills
     left-to-right in the gradient color, plus a "↔ Scroll to explore"
     hint label that fades out after the user has scrolled a bit.
   - On mobile/tablet (and prefers-reduced-motion): disable the GSAP pin
     entirely and instead render the 4 panels as a normal vertical stack
     with simple fade-up reveals, or as a swipeable horizontal carousel
     using native scroll-snap (no scroll-jacking).

5. TESTIMONIALS
   - Dark, near-black full-width band. Big quotation mark glyph, large
     italic quote text (invented client quotes — 2-3 sentences, credible
     and specific about results), attribution line ("— Name, Title,
     Company" — invent believable but clearly fictional names unless the
     user supplies real ones).
   - Prev/next circular arrow buttons bottom-right to cycle through 4-5
     testimonials (simple state-based carousel, swipeable on touch).
   - Below the quote band, a muted single-row strip of 4-5 invented
     client "wordmark" placeholders (plain text logotypes in a muted
     gray, grayscale-on-hover-color effect) to suggest social proof
     without fabricating real brand logos.

6. PLANS (Pricing)
   - Micro-label + heading ("Simple Plans For Serious Growth").
   - 3 pricing cards side by side (stack on mobile): e.g. "Starter",
     "Growth" (marked "Most Popular" with a gradient ribbon/badge and a
     slightly larger/elevated card), "Scale" (or "Enterprise" with
     "Custom Pricing — Talk to us"). Each card: plan name, price (or
     "Custom"), short description, checklist of 5-6 included features
     with check icons, gradient CTA button ("Get Started" / "Book A
     Call"). Use placeholder pricing (e.g. "$999", "$2,499", "Custom")
     clearly marked as illustrative — tell the user in a code comment to
     replace with real numbers.

7. TEAM
   - Micro-label + heading ("The People Behind The Work").
   - Grid of 4-6 team member cards (2-3 columns): circular or rounded
     photo placeholder (use a simple gradient avatar with initials, not
     a stock photo), name, role, 1-line specialty, small row of social
     icon links (LinkedIn/X/GitHub as generic icon buttons). Card lifts
     and border glows on hover.

8. CONTACT US
   - Two-column: left = heading ("Let's Build Something That Performs.")
     + short paragraph + contact details (email, phone, location — use
     clearly-labeled placeholders like "hello@salonjaa.com",
     "+91 XXXXX XXXXX", "Odisha, India" and tell the user to replace
     them) + social icon row. Right = a simple contact form (Name,
     Email, Project Type select, Message, gradient-border Submit
     button) — client-side only with a note that the user needs to wire
     it to an email/service provider (e.g. Formspree, Resend) since this
     is a static build.

9. FOOTER
   - 4-column layout: Brand column (logo + one-line tagline + social
     icons), "Links" column (Services, Works, Plans, Team, Contact),
     "Company" column (About Us, Careers placeholder, Blog placeholder,
     Privacy Policy, Terms of Use), "Contact" column (email, phone,
     address placeholders repeated for convenience).
   - Thin top border, bottom copyright line: "© 2026 Salonjaa Digital
     Solutions. All Rights Reserved."

SCROLL & MOTION DETAIL
- Wrap the whole app in a Lenis smooth-scroll provider (client component)
  so vertical scrolling feels slightly eased/inertial across the whole
  site, matching the reference site's smoothness — but make sure it
  doesn't fight with the GSAP ScrollTrigger pin in Section 4 (Lenis +
  GSAP ScrollTrigger need `lenis.on('scroll', ScrollTrigger.update)` and
  a `gsap.ticker` sync — implement this correctly).
- Every section other than the hero and the pinned Works section should
  reveal with Framer Motion: `initial={{opacity:0, y: 40}}`,
  `whileInView={{opacity:1, y:0}}`, `viewport={{once:true, amount:0.2}}`,
  staggered by ~0.1s for grids of cards.
- Buttons/cards: hover scale/translate handled with Tailwind
  `transition` + `hover:` utilities, not JS, for performance.

DELIVERABLE STRUCTURE
- /app/page.tsx assembling all 9 section components in order
- /components/Navbar.tsx, Hero.tsx, About.tsx, Services.tsx,
  Works.tsx (the pinned horizontal section), Testimonials.tsx,
  Plans.tsx, Team.tsx, Contact.tsx, Footer.tsx
- /components/ui for shared bits: GradientButton.tsx, SectionLabel.tsx,
  MarqueeStrip.tsx
- Tailwind config with the color palette and font families wired up as
  theme tokens (not hard-coded hex scattered everywhere)
- All copy should be realistic placeholder content for a web/app +
  digital marketing agency called Salonjaa Digital Solutions — invented
  but professional, no lorem ipsum in visible headings.
- Add a short README section (as a code comment block at the top of
  page.tsx or a README.md) listing every placeholder a real user must
  replace before launch: pricing numbers, contact details, testimonial
  names/quotes, team photos, and the contact form's backend endpoint.

Build it now, section by section, starting with the project scaffold and
global layout/theme, then the Navbar+Hero, then each remaining section in
the order listed above.
```

---

### A couple of things worth deciding before you run this

- **Team photos**: the prompt tells Claude Code to use gradient-initial avatars instead of stock photos, since I can't source real photos of your team. Swap in real headshots once they exist.
- **Contact form backend**: static Next.js can't send email on its own — the prompt flags this so Claude Code wires the form UI but leaves a clear note to connect Formspree/Resend/etc.
- **Pricing numbers, testimonials, and contact details** are placeholders by design — the prompt explicitly asks Claude Code to mark them as such so you don't accidentally ship fake numbers.
