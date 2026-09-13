// Bare pass-through — src/app/(account)/account/layout.tsx (PortalShell)
// owns all the real chrome now (sidebar, topbar), same split as (admin).
export default function AccountGroupLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-void">{children}</div>;
}
