import { about } from "@/content/about";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatNumber } from "@/components/ui/StatNumber";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionReveal, SectionRevealItem } from "@/components/ui/SectionReveal";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function About() {
  return (
    <section id="about" className="bg-charcoal py-20 sm:py-28">
      <div className="container-app grid gap-12 lg:grid-cols-2 lg:items-center">
        <SectionReveal className="space-y-5">
          <SectionLabel>{about.eyebrow}</SectionLabel>
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">{about.title}</h2>
          {about.paragraphs.map((p) => (
            <p key={p} className="text-base leading-relaxed text-text-secondary">
              {p}
            </p>
          ))}
          <ul className="grid gap-3 pt-2 sm:grid-cols-2">
            {about.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm font-medium text-white">
                <span className="mt-0.5 text-emerald">
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </SectionReveal>

        <SectionReveal as="div" stagger={0.1} className="gradient-border grid grid-cols-2 gap-6 rounded-2xl bg-surface p-8">
          <SectionRevealItem className="col-span-2">
            <p className="font-display text-xl font-semibold text-white">{about.panel.headline}</p>
          </SectionRevealItem>
          {about.panel.stats.map((stat) => {
            const numeric = parseInt(stat.value, 10);
            const isNumeric = !Number.isNaN(numeric) && /^\d+%?$/.test(stat.value);
            return (
              <SectionRevealItem key={stat.label}>
                <p className="font-display text-3xl font-bold text-gradient-accent">
                  {isNumeric ? (
                    <StatNumber value={numeric} suffix={stat.value.includes("%") ? "%" : ""} />
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
              </SectionRevealItem>
            );
          })}
        </SectionReveal>
      </div>

      <SectionReveal as="div" stagger={0.1} className="container-app mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {about.whyCards.map((item) => (
          <SectionRevealItem key={item.title}>
            <GlassCard className="h-full min-w-0">
              <h3 className="font-display text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
            </GlassCard>
          </SectionRevealItem>
        ))}
      </SectionReveal>
    </section>
  );
}
