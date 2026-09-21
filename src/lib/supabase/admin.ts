import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Bypasses Row Level Security entirely — reserved for the handful of
// operations no ordinary logged-in session could ever legitimately do:
// creating or re-emailing a client's Auth login (admin provisioning) and processing the
// Razorpay webhook (no user session exists there at all). Every other
// server-side read/write — including the admin panel's own — should go
// through src/lib/supabase/server.ts instead, so RLS stays the single,
// consistent authorization mechanism.
//
// `import "server-only"` makes any accidental import from a Client
// Component a build-time error, on top of this file only ever reading a
// non-NEXT_PUBLIC_ env var.
let client: ReturnType<typeof createClient<Database>> | null = null;

export function getAdminClient() {
  if (!client) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not set");
    }
    client = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}
