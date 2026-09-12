import { SectionLabel } from "./SectionLabel";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, lede, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto max-w-2xl", align === "center" && "text-center", className)}>
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">{title}</h2>
      {lede && <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">{lede}</p>}
    </div>
  );
}
