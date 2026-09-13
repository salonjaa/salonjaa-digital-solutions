"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/layout/BrandMark";
import { LogoutButton } from "@/components/forms/LogoutButton";
import { DashboardIcon, BriefcaseIcon, RupeeIcon, ChatBubbleIcon, SettingsIcon, MenuIcon, CloseIcon } from "@/components/icons/AdminIcons";
import { GlobeIcon } from "@/components/icons/PortalIcons";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/account", label: "Overview", icon: DashboardIcon, exact: true },
  { href: "/account/plan", label: "Plan & Assets", icon: BriefcaseIcon, exact: false },
  { href: "/account/payments", label: "Payments", icon: RupeeIcon, exact: false },
  { href: "/account/domain", label: "Domain", icon: GlobeIcon, exact: false },
  { href: "/account/chat", label: "Chat", icon: ChatBubbleIcon, exact: false },
  { href: "/account/settings", label: "Settings", icon: SettingsIcon, exact: false },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            data-cursor-hover
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-white/[0.06] text-white" : "text-text-secondary hover:bg-white/[0.03] hover:text-white"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", active && "text-cyan")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PortalShell({
  displayName,
  email,
  children,
}: {
  displayName: string;
  email: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-void md:grid md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/[0.06] bg-charcoal py-5 md:flex">
        <Link href="/" data-cursor-hover className="mb-6 flex items-center gap-2 px-4">
          <BrandMark size={26} />
          <span className="font-display text-sm font-semibold text-white">My Account</span>
        </Link>
        <SidebarNav />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-white/[0.06] bg-charcoal py-5">
            <div className="mb-6 flex items-center justify-between px-4">
              <Link href="/" data-cursor-hover className="flex items-center gap-2">
                <BrandMark size={26} />
                <span className="font-display text-sm font-semibold text-white">My Account</span>
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                data-cursor-hover
                className="rounded-lg p-1.5 text-text-secondary hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-void/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            data-cursor-hover
            className="rounded-lg p-1.5 text-text-secondary hover:text-white md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs text-text-muted">{email}</p>
            </div>
            <LogoutButton className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:border-cyan/50 hover:text-white" />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
