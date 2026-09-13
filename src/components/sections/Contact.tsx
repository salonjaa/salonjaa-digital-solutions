import { contact } from "@/content/contact";
import { site, team } from "@/content/site";
import { withWhatsappMessage } from "@/lib/whatsapp";
import { ContactForm } from "@/components/forms/ContactForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionReveal, SectionRevealItem } from "@/components/ui/SectionReveal";

type TeamMember = (typeof team)["kumar"] | (typeof team)["saroj"] | (typeof team)["snehanjali"];

function ContactCard({ member, highlightPhone }: { member: TeamMember; highlightPhone?: boolean }) {
  return (
    <GlassCard className="min-w-0">
      <h3 className="font-display text-base font-semibold text-white">{member.name}</h3>
      <p className="text-xs text-cyan">{member.role}</p>
      {highlightPhone ? (
        // No WhatsApp on file for this member — the phone number itself is
        // the CTA here, made large and tap-to-call rather than tucked into
        // a small button, so a visitor can reach the coordinator directly.
        <a
          href={member.phoneHref}
          data-cursor-hover
          className="mt-4 block font-display text-xl font-bold tracking-wide text-cyan"
        >
          {member.phone}
        </a>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {"whatsapp" in member && (
            <Button href={withWhatsappMessage(member.whatsapp, contact.whatsappMessage)} variant="whatsapp" size="md">
              WhatsApp
            </Button>
          )}
          <Button href={member.phoneHref} variant="outline" size="md">
            Call
          </Button>
        </div>
      )}
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
            <SectionRevealItem className="sm:col-span-2">
              {/* Snehanjali is the first point of contact — her card leads
                  and spans the full width rather than sharing a row. */}
              <ContactCard member={team.snehanjali} highlightPhone />
            </SectionRevealItem>
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
