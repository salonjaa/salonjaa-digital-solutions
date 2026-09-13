import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";

// Bare wrapper for /admin/* — same rationale as (portal)/layout.tsx: no
// marketing chrome, just enough shell to read as the same studio.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void">
      <header className="border-b border-white/[0.06] px-6 py-4">
        <Link href="/" data-cursor-hover className="inline-flex items-center gap-2">
          <BrandMark size={28} />
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
