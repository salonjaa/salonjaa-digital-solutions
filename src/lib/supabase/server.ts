import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

// Not a true singleton like browser.ts/admin.ts — each call binds to the
// current request's cookies, so a fresh client is built per call. This is
// the main data-access path for portal/admin Server Components and Route
// Handlers: queries run *as the logged-in user*, so Row Level Security
// (including the is_admin() bypass) applies naturally without any bespoke
// per-page authorization code.
export async function getServerClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies can't be written.
          // Safe to ignore — middleware.ts refreshes the session cookie on
          // every request that matters (see middleware.ts once added).
        }
      },
    },
  });
}
