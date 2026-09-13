import "server-only";
import Razorpay from "razorpay";

// Lazy singleton, same shape as src/lib/resend.ts's getClient(). Server-only
// — RAZORPAY_KEY_SECRET must never reach the browser bundle. Used to create
// Orders (api/admin/payments/create-order); checkout signature verification
// and webhook verification use plain Node `crypto`, not this SDK.
let client: Razorpay | null = null;

export function getRazorpayClient() {
  if (!client) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is not set");
    }
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
}
