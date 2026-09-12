import { services } from "@/content/services";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionReveal, SectionRevealItem } from "@/components/ui/SectionReveal";

export function Services() {
  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="container-app">
        <SectionReveal className="ml-auto max-w-xl text-right">
          <SectionLabel className="justify-end">{services.eyebrow}</SectionLabel>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">{services.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">{services.lede}</p>
        </SectionReveal>

        <SectionReveal as="div" stagger={0.1} className="mt-12 grid gap-5 lg:grid-cols-3">
          {services.pillars.map((pillar, i) => (
            <SectionRevealItem key={pillar.title}>
              <GlassCard className="flex h-full min-w-0 flex-col">
                <span className="font-display text-3xl font-bold text-gradient-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">{pillar.description}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {pillar.tags.map((tag) => (
                    <span key={tag} className="chip px-2.5 py-1 text-xs text-text-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </SectionRevealItem>
          ))}
        </SectionReveal>
      </div>
    </section>
  );
}
