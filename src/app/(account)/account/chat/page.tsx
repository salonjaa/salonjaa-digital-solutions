import { GlassCard } from "@/components/ui/GlassCard";

export const metadata = { title: "Chat" };

// Placeholder — live chat (chat_threads/chat_messages + Realtime
// subscription) lands in a later phase. The route exists now so the nav
// link in account/layout.tsx doesn't 404.
export default function ChatPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-white">Chat</h1>
      <GlassCard>
        <p className="text-sm text-text-secondary">
          Live chat is launching soon. In the meantime, reach us directly on WhatsApp or by phone from the Contact
          page.
        </p>
      </GlassCard>
    </div>
  );
}
