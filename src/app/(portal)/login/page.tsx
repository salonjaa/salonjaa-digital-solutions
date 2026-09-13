import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata = { title: "Sign In" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already signed in — middleware only guards /account and /admin, not
  // /login itself, so send an already-authenticated visitor straight on
  // rather than showing them a login form again.
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    redirect(profile?.is_admin ? "/admin" : "/account");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-semibold text-white">Sign in to your account</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Log in to see your plan, payments, and domain status, or to chat with us directly.
      </p>
      <div className="mt-8">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
