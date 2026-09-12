import { BrandMark } from "./BrandMark";
import { navLinks } from "@/content/nav";
import { site, team } from "@/content/site";
import { GithubIcon, LinkedinIcon, WhatsappIcon } from "@/components/icons/SocialIcons";

// "Careers", "Blog", "Privacy Policy", and "Terms of Use" are placeholder
// links only — none of these pages exist yet. Build them and swap in real
// hrefs before launch (see the placeholder checklist in README.md).
const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Careers", href: null },
  { label: "Blog", href: null },
  { label: "Privacy Policy", href: null },
  { label: "Terms of Use", href: null },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-charcoal text-white">
      <div className="container-app grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 inline-flex items-center gap-2.5">
            <BrandMark size={30} />
            <span className="font-display text-base font-bold text-white">{site.shortName}</span>
          </div>
          <p className="text-sm text-text-muted">{site.tagline}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={team.kumar.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-text-secondary transition-colors hover:border-cyan/50 hover:text-white"
            >
              <GithubIcon />
            </a>
            <a
              href={team.kumar.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-text-secondary transition-colors hover:border-cyan/50 hover:text-white"
            >
              <LinkedinIcon />
            </a>
            <a
              href={team.kumar.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-text-secondary transition-colors hover:border-cyan/50 hover:text-white"
            >
              <WhatsappIcon />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Links</h3>
          <ul className="space-y-2.5 text-sm text-text-secondary">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} data-cursor-hover className="hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Company</h3>
          <ul className="space-y-2.5 text-sm text-text-secondary">
            {companyLinks.map((link) =>
              link.href ? (
                <li key={link.label}>
                  <a href={link.href} data-cursor-hover className="hover:text-white">
                    {link.label}
                  </a>
                </li>
              ) : (
                <li key={link.label} className="text-text-muted/60">
                  {link.label} <span className="text-xs">(coming soon)</span>
                </li>
              )
            )}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Contact</h3>
          <ul className="space-y-2.5 text-sm text-text-secondary">
            <li>
              <a href={team.kumar.phoneHref} className="hover:text-white">
                {team.kumar.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${team.kumar.email}`} className="hover:text-white">
                {team.kumar.email}
              </a>
            </li>
            <li>
              <a href={team.saroj.phoneHref} className="hover:text-white">
                {team.saroj.phone}
              </a>
            </li>
            <li className="pt-1 text-text-muted">{site.address.full}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.06] py-6">
        <div className="container-app flex flex-col items-center justify-between gap-2 text-xs text-text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All Rights Reserved.
          </p>
          <p>Built by Kumar Prasannajit Sahu &amp; Saroj Kumar Sahu</p>
        </div>
      </div>
    </footer>
  );
}
