import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/forms/LogoutButton";

const navItems = [
  { href: "/admin", label: "Clients" },
  { href: "/admin/chat", label: "Chat" },
];

// middleware.ts is the primary guard (redirects non-admins to /account
// before this ever renders); this re-check is a defensive fallback, same
// as (portal)/account/layout.tsx.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/account");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <nav className="flex gap-1">
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
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
