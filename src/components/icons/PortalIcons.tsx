// Icons specific to the client portal — same plain-inline-SVG approach as
// AdminIcons.tsx/SocialIcons.tsx.

type IconProps = { className?: string };

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.75 5.5 3.75 9S14.5 18.5 12 21c-2.5-2.5-3.75-5.5-3.75-9S9.5 5.5 12 3Z" strokeLinejoin="round" />
    </svg>
  );
}
