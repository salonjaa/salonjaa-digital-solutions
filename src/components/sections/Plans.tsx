import { plans } from "@/content/plans";
import { GradientButton } from "@/components/ui/GradientButton";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionReveal, SectionRevealItem } from "@/components/ui/SectionReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Plans() {
  return (
    <section id="plans" className="py-20 sm:py-28">
      <div className="container-app">
        <SectionHeading eyebrow={plans.eyebrow} title={plans.title} lede={plans.lede} />
        <SectionReveal
          as="div"
          stagger={0.1}
          className="mt-12 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {plans.tiers.map((tier) => {
            const isPopular = tier.tag === plans.popular;
            return (
              <SectionRevealItem key={tier.name} className={isPopular ? "xl:-mt-4" : undefined}>
                <GlassCard variant={isPopular ? "deep" : "default"} className="relative flex h-full min-w-0 flex-col p-5">
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-accent px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wide text-void">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="chip w-fit px-3 py-1 text-xs font-semibold text-cyan">{tier.tag}</span>
                    <span className="text-xl" aria-hidden="true">
                      {tier.icon}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-white">{tier.name}</h3>
                  <p className="mt-1">
                    <span className="font-display text-2xl font-bold text-gradient-accent">{tier.price}</span>{" "}
                    <span className="text-xs font-medium text-text-muted">{tier.priceNote}</span>
                  </p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-text-secondary">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-emerald">
                          <CheckIcon />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isPopular ? (
                    <GradientButton href="#contact" className="mt-6 w-full">
                      Get Started
                    </GradientButton>
                  ) : (
                    <Button href="#contact" variant="outline" className="mt-6 w-full">
                      Get Started
                    </Button>
                  )}
                </GlassCard>
              </SectionRevealItem>
            );
          })}
        </SectionReveal>
        <p className="mt-8 text-center text-xs text-text-muted">{plans.footnote}</p>
      </div>
    </section>
  );
}
