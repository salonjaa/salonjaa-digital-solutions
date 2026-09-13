import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/forms/LogoutButton";

const navItems = [
  { href: "/account", label: "Overview" },
  { href: "/account/plan", label: "Plan & Assets" },
  { href: "/account/payments", label: "Payments" },
  { href: "/account/domain", label: "Domain" },
  { href: "/account/chat", label: "Chat" },
];

// middleware.ts already guards this whole subtree, but a Server Component
// layout re-checks — the redirect here is a defensive fallback in case this
// layout is ever reached without middleware having run (e.g. a future
// restructure), not the primary auth boundary.
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, company_name").eq("id", user.id).single();

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr]">
      <aside className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">Welcome</p>
          <p className="font-display text-lg font-semibold text-white">
            {profile?.full_name || profile?.company_name || user.email}
          </p>
        </div>
        <nav className="flex flex-row flex-wrap gap-2 md:flex-col md:gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-cursor-hover
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <LogoutButton className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-white" />
      </aside>
      <div>{children}</div>
    </div>
  );
}
