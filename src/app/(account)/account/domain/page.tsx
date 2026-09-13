import { getServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge, domainStatusTone } from "@/components/ui/StatusBadge";

export const metadata = { title: "Domain" };

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default async function DomainPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: domains } = await supabase
    .from("domain_status")
    .select("id, domain_name, registrar, status, purchased_at, renewal_date, auto_renew, notes")
    .eq("client_id", user!.id)
    .order("domain_name", { ascending: true });

  // This is a Server Component rendered fresh per request; comparing the
  // renewal date against "now" is the entire point here (flag domains
  // renewing within 30 days), not an accidental impurity to fix.
  const isExpiringSoon = (renewalDate: string | null) => {
    if (!renewalDate) return false;
    // eslint-disable-next-line react-hooks/purity
    return new Date(renewalDate).getTime() - Date.now() <= THIRTY_DAYS_MS;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Domain</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Domain(s) we manage on your behalf — ownership stays with you.
        </p>
      </div>

      {domains && domains.length > 0 ? (
        <div className="space-y-3">
          {domains.map((domain) => {
            const expiringSoon = domain.status !== "expired" && isExpiringSoon(domain.renewal_date);
            return (
              <GlassCard key={domain.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-lg font-semibold text-white">{domain.domain_name}</p>
                  <div className="flex items-center gap-2">
                    {expiringSoon && <StatusBadge label="expiring soon" tone="warning" />}
                    <StatusBadge label={domain.status.replace("_", " ")} tone={domainStatusTone[domain.status]} />
                  </div>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-text-secondary sm:grid-cols-2">
                  {domain.registrar && (
                    <div className="flex gap-1.5">
                      <dt className="text-text-muted">Registrar:</dt>
                      <dd>{domain.registrar}</dd>
                    </div>
                  )}
                  {domain.purchased_at && (
                    <div className="flex gap-1.5">
                      <dt className="text-text-muted">Purchased:</dt>
                      <dd>{new Date(domain.purchased_at).toLocaleDateString("en-IN")}</dd>
                    </div>
                  )}
                  {domain.renewal_date && (
                    <div className="flex gap-1.5">
                      <dt className="text-text-muted">Renews:</dt>
                      <dd>{new Date(domain.renewal_date).toLocaleDateString("en-IN")}</dd>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <dt className="text-text-muted">Auto-renew:</dt>
                    <dd>{domain.auto_renew ? "Yes" : "No"}</dd>
                  </div>
                </dl>
                {domain.notes && <p className="mt-3 text-sm text-text-secondary">{domain.notes}</p>}
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">No domain managed by us on file.</p>
      )}
    </div>
  );
}
