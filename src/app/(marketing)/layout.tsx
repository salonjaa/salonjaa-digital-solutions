import { GsapProvider } from "@/components/providers/GsapProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";

// The public marketing site's chrome, split out of the root layout so the
// client portal and admin panel — (portal) and (admin) — don't get the
// custom cursor, Lenis smooth-scroll, or the marketing Navbar/Footer.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <GsapProvider>
      <LenisProvider>
        <CustomCursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </LenisProvider>
    </GsapProvider>
  );
}
