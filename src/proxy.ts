import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

// Guards /account/* (any logged-in client or admin) and /admin/* (admin
// only). Also responsible for refreshing the Supabase session cookie on
// every matched request — without this, a Server Component's cookie-bound
// client (src/lib/supabase/server.ts) can end up working with a stale/
// expired session since it can't itself refresh cookies mid-render.
//
// Named `proxy` (not `middleware`) per Next.js 16's renamed file
// convention — https://nextjs.org/docs/messages/middleware-to-proxy.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Misconfigured env — fail open on the redirect logic (nothing to check
    // against) but the app will hard-error elsewhere the moment a Supabase
    // client is actually used, which is more honest than silently locking
    // every visitor out of /account and /admin.
    return response;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Refreshes the session if it's expired — required for Server Components,
  // which can only read cookies, never set them.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");

  if (!user && (isAdminRoute || isAccountRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAdminRoute) {
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/account";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
