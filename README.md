# Salonjaa Digital Solutions

The marketing website for Salonjaa Digital Solutions — a two-person
freelance web, app, and digital-marketing studio in Bhubaneswar. Built with
Next.js, Tailwind CSS, Framer Motion, and GSAP/Lenis.

## Prerequisites

- Node.js 20+ and npm.
- A [Resend](https://resend.com) account for sending form-submission emails.

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | API key from your Resend account. |
| `CONTACT_FROM_EMAIL` | The sender address for form emails. Must be on a domain you've verified in Resend — until then, Resend only allows `onboarding@resend.dev` as the sender and only delivers to the account's own verified email. |
| `CONTACT_TO_KUMAR` / `CONTACT_TO_SAROJ` | Destination inboxes for contact form submissions. |

## Development

```bash
npm run dev       # start the dev server at http://localhost:3000
npm run build     # production build
npm run start     # run the production build locally
npm run lint      # ESLint
```

## Deployment (Vercel)

1. Import the repo into Vercel.
2. Add the four env vars above under Project Settings → Environment
   Variables.
3. In Resend, verify a sending domain and use an address on it as
   `CONTACT_FROM_EMAIL` — without this, form emails will fail in production
   (Resend restricts unverified senders to test recipients only).
4. Deploy. No special build settings are needed — Vercel auto-detects
   Next.js.

## Updating content

All homepage copy lives in `src/content/*.ts` as typed data — no need to
touch component code to update text:

- **Team info, contact details, address** → `src/content/site.ts`
- **Plans/pricing tiers** → `src/content/plans.ts`
- **Services** → `src/content/services.ts`
- **Portfolio/work items** → `src/content/work.ts`
- **Testimonials** → `src/content/testimonials.ts` (currently placeholder —
  see `docs/CONTENT.md`)
- **Team photos** → replace the files in `public/images/team/`, same
  filenames, then update paths in `src/content/site.ts` if you rename them.
- **Resume PDF** → `public/files/`

See `CLAUDE.md` for the fuller project map, conventions, and known
follow-ups; `docs/DESIGN-SYSTEM.md` for the color/typography/animation
system; `docs/CONTENT.md` for how the old site's copy maps onto this one.
