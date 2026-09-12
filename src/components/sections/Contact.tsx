import { contact } from "@/content/contact";
import { site, team } from "@/content/site";
import { ContactForm } from "@/components/forms/ContactForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionReveal, SectionRevealItem } from "@/components/ui/SectionReveal";

function ContactCard({ member }: { member: (typeof team)["kumar"] | (typeof team)["saroj"] }) {
  return (
    <GlassCard className="min-w-0">
      <h3 className="font-display text-base font-semibold text-white">{member.name}</h3>
      <p className="text-xs text-cyan">{member.role}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button href={member.whatsapp} variant="whatsapp" size="md">
          WhatsApp
        </Button>
        <Button href={member.phoneHref} variant="outline" size="md">
          Call
        </Button>
      </div>
    </GlassCard>
  );
}

export function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="container-app">
        <SectionHeading eyebrow={contact.eyebrow} title={contact.title} lede={contact.lede} align="left" className="mx-0 max-w-xl" />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <SectionReveal>
            <ContactForm />
          </SectionReveal>
          <SectionReveal as="div" stagger={0.1} className="grid gap-5 sm:grid-cols-2">
            <SectionRevealItem>
              <ContactCard member={team.kumar} />
            </SectionRevealItem>
            <SectionRevealItem>
              <ContactCard member={team.saroj} />
            </SectionRevealItem>
            <SectionRevealItem className="sm:col-span-2">
              <GlassCard variant="deep" className="min-w-0">
                <h3 className="font-display text-base font-semibold text-white">Headquarters</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{site.address.full}</p>
              </GlassCard>
            </SectionRevealItem>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
