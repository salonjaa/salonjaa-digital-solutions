import { GlassCard } from "@/components/ui/GlassCard";

export const metadata = { title: "Chat — Admin" };

// Placeholder, mirrors (portal)/account/chat/page.tsx — the inbox (all
// threads + unread counts) lands with the rest of the chat feature.
export default function AdminChatPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-white">Chat</h1>
      <GlassCard>
        <p className="text-sm text-text-secondary">Chat inbox is launching soon.</p>
      </GlassCard>
    </div>
  );
}
