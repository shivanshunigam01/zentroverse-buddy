import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchIntegrationsHealth,
  startMetaConnect,
  disconnectMeta,
  fetchMetaAccounts,
  fetchMetaForms,
  startGoogleConnect,
  disconnectGoogle,
} from "@/api/crm.api";
import { ApiClientError } from "@/lib/api";

const StatusDot = ({ ok }: { ok: boolean }) => (
  <span className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />
);

const CrmIntegrations = () => {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [accounts, setAccounts] = useState<Record<string, unknown> | null>(null);
  const [forms, setForms] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const h = await fetchIntegrationsHealth();
      setHealth(h);
      if ((h.meta as { connected?: boolean })?.connected) {
        const [acc, frm] = await Promise.all([fetchMetaAccounts(), fetchMetaForms()]);
        setAccounts(acc);
        setForms((frm as { forms?: Array<Record<string, unknown>> }).forms || []);
      }
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const meta = (health?.meta || {}) as Record<string, unknown>;

  return (
    <div className="space-y-6">
      {loading ? <p className="text-sm text-muted-foreground">Loading integration health…</p> : null}

      <section className="rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Meta Lead Ads</h3>
            <p className="text-xs text-muted-foreground">
              <StatusDot ok={Boolean(meta.connected)} /> {meta.connected ? "Connected" : "Not connected"}
              {meta.configured === false ? " · Credentials not configured" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              onClick={async () => {
                setBusy(true);
                try {
                  const { authorization_url } = await startMetaConnect();
                  window.location.href = authorization_url;
                } catch (e) {
                  toast.error(e instanceof ApiClientError ? e.message : "Connect failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Connect
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              onClick={async () => {
                setBusy(true);
                try {
                  await disconnectMeta();
                  toast.success("Meta disconnected");
                  await refresh();
                } catch (e) {
                  toast.error(e instanceof ApiClientError ? e.message : "Disconnect failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <p>Webhook: <StatusDot ok={meta.webhook_status === "healthy"} /> {String(meta.webhook_status || "unknown")}</p>
          <p>Failed ingestion: {String(meta.failed_ingestion ?? 0)}</p>
          <p>Unmapped forms: {String(meta.unmapped_forms ?? 0)}</p>
          <p>Last lead: {meta.last_lead_at ? new Date(String(meta.last_lead_at)).toLocaleString() : "—"}</p>
        </div>
        {accounts ? (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">Ad Accounts</p>
            <ul className="mt-1 text-sm">
              {((accounts.accounts as Array<{ name?: string }>) || []).map((a, i) => (
                <li key={i}>· {a.name || "Account"}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {forms.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">Lead Forms</p>
            <ul className="mt-1 space-y-1 text-sm">
              {forms.map((f) => (
                <li key={String(f.id)} className="flex justify-between rounded border px-2 py-1">
                  <span>{String(f.name || f.id)}</span>
                  <span className="text-xs text-muted-foreground">{String((f as { mapping_status?: string }).mapping_status || "UNMAPPED")}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Google Ads</h3>
            <p className="text-xs text-muted-foreground">
              <StatusDot ok={Boolean((health?.google as { connected?: boolean })?.connected)} />
              {(health?.google as { connected?: boolean })?.connected ? "Connected" : "Not connected"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              onClick={async () => {
                setBusy(true);
                try {
                  const { authorization_url } = await startGoogleConnect();
                  window.location.href = authorization_url;
                } catch (e) {
                  toast.error(e instanceof ApiClientError ? e.message : "Connect failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Connect
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              onClick={async () => {
                setBusy(true);
                try {
                  await disconnectGoogle();
                  toast.success("Google disconnected");
                  await refresh();
                } catch (e) {
                  toast.error(e instanceof ApiClientError ? e.message : "Disconnect failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 p-4">
        <h3 className="font-semibold">Integration Health</h3>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <p>Queue pending: {String((health?.queue as { pending?: number })?.pending ?? 0)}</p>
          <p>Conversions sent: {String((health?.conversions as { successful?: number })?.successful ?? 0)}</p>
          <p>Conversion failures: {String((health?.conversions as { failed?: number })?.failed ?? 0)}</p>
          <p>Last sync: {health?.last_successful_sync ? new Date(String(health.last_successful_sync)).toLocaleString() : "—"}</p>
        </div>
      </section>
    </div>
  );
};

export default CrmIntegrations;
