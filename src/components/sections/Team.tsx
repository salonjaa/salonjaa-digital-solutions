import Image from "next/image";
import { team } from "@/content/team";
import { site } from "@/content/site";
import { contact } from "@/content/contact";
import { withWhatsappMessage } from "@/lib/whatsapp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionReveal, SectionRevealItem } from "@/components/ui/SectionReveal";
import { PhoneIcon, MailIcon, WhatsappIcon, GithubIcon, LinkedinIcon, DownloadIcon } from "@/components/icons/SocialIcons";

function IconLink({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      data-cursor-hover
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-text-secondary transition-colors hover:border-cyan/50 hover:text-white"
    >
      {children}
    </a>
  );
}

export function Team() {
  return (
    <section id="team" className="bg-charcoal py-20 sm:py-28">
      <div className="container-app">
        <SectionHeading eyebrow={team.eyebrow} title={team.title} />
        <SectionReveal as="div" stagger={0.12} className="mt-12 grid gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {team.members.map((member) => (
            <SectionRevealItem key={member.name}>
              <GlassCard className="min-w-0 text-center">
                <div className="gradient-border mx-auto h-24 w-24 rounded-full p-1">
                  <Image
                    src={member.photo}
                    alt={`${member.name}, ${member.role} at ${site.name}`}
                    width={104}
                    height={104}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-cyan">{member.role}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <IconLink href={member.phoneHref} label={`Call ${member.name}`}>
                    <PhoneIcon />
                  </IconLink>
                  <IconLink href={`mailto:${member.email}`} label={`Email ${member.name}`}>
                    <MailIcon />
                  </IconLink>
                  <IconLink
                    href={withWhatsappMessage(member.whatsapp, contact.whatsappMessage)}
                    label={`WhatsApp ${member.name}`}
                    external
                  >
                    <WhatsappIcon />
                  </IconLink>
                  {"github" in member && (
                    <IconLink href={member.github} label={`${member.name} on GitHub`} external>
                      <GithubIcon />
                    </IconLink>
                  )}
                  {"linkedin" in member && (
                    <IconLink href={member.linkedin} label={`${member.name} on LinkedIn`} external>
                      <LinkedinIcon />
                    </IconLink>
                  )}
                  {"resume" in member && (
                    <IconLink href={member.resume} label={`Download ${member.name}'s resume`}>
                      <DownloadIcon />
                    </IconLink>
                  )}
                </div>
              </GlassCard>
            </SectionRevealItem>
          ))}
        </SectionReveal>
      </div>
    </section>
  );
}
