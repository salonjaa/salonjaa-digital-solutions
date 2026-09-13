import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { GsapProvider } from "@/components/providers/GsapProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Website Design & Development`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    title: `${site.name} — Website Design & Development`,
    description: site.ogDescription,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Website Design & Development`,
    description: site.ogDescription,
  },
  // Favicon is picked up automatically from src/app/icon.png (Next.js file convention).
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-body antialiased`}>
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-1000 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          Skip to content
        </a>
        <GsapProvider>
          <LenisProvider>
            <CustomCursor />
            <Navbar />
            <main>{children}</main>
            <Footer />
            <BackToTop />
          </LenisProvider>
        </GsapProvider>
        <Analytics />
      </body>
    </html>
  );
}
