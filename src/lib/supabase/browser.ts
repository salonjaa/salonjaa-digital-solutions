import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Lazy singleton for use in Client Components — chat (realtime subscribe +
// insert) and the Razorpay Checkout trigger. Row Level Security is what
// actually enforces access here; this client only ever carries the anon
// key, never anything privileged.
let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getBrowserClient() {
  if (!client) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
    }
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
