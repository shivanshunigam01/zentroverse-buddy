import { useEffect, useState } from "react";
import { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { SyncAllLeadsDialog } from "@/components/modules/autodialer/SyncAllLeadsDialog";
import { getDialerStatistics } from "@/api/dialer.api";
import type { DialerCampaign, DialerStatistics } from "@/domain/dialer/types";

type Props = {
  campaign: DialerCampaign | null;
  loading: boolean;
  isAdmin: boolean;
  onRefresh: () => void;
  onSyncPending: () => void;
  onSyncComplete: () => void;
};

export function CampaignPanel({ campaign, loading, isAdmin, onRefresh, onSyncPending, onSyncComplete }: Props) {
  const [stats, setStats] = useState<DialerStatistics | null>(null);

  useEffect(() => {
    void getDialerStatistics()
      .then(setStats)
      .catch(() => setStats(null));
  }, [campaign?.leadCount, campaign?.completedCalls, campaign?.lastWebhook?.receivedAt]);

  return (
    <>
      <Section title="Smartflo connection">
        <p className="text-sm">
          {campaign?.connected ? "Connected" : "Not connected"} · Mode: {campaign?.dialerMode ?? "—"} · Session:{" "}
          {campaign?.sessionEnabled ? "enabled" : "disabled"}
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Campaign</dt>
            <dd className="font-semibold">{campaign?.name ?? "ZentroFLOW Auto Dialer"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Campaign ID</dt>
            <dd className="font-mono">{campaign?.campaignIdMasked ?? "********"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Lead list ID</dt>
            <dd className="font-mono">{campaign?.leadListIdMasked ?? "********"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Disposition list ID</dt>
            <dd className="font-mono">{campaign?.dispositionListIdMasked ?? "********"}</dd>
          </div>
        </dl>
      </Section>
      <Section title="Campaign stats">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Status", campaign?.status ?? "UNKNOWN"],
            ["Agents", String(campaign?.agentCount ?? 0)],
            ["Lead count", String(stats?.totalLeads ?? campaign?.leadCount ?? 0)],
            ["Synced", String(stats?.synced ?? campaign?.syncedLeadCount ?? 0)],
            ["Pending sync", String(stats?.pending ?? campaign?.pendingLeadCount ?? 0)],
            ["Failed sync", String(stats?.failedSync ?? 0)],
            ["Dialed", String(stats?.dialed ?? campaign?.completedCalls ?? 0)],
            ["Connected", String(stats?.connected ?? 0)],
            ["Connection %", `${stats?.connectionRate ?? 0}%`],
            ["Interest %", `${stats?.interestRate ?? 0}%`],
            ["Conversion %", `${stats?.conversionRate ?? 0}%`],
            ["Callbacks", String(stats?.callbacks ?? 0)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        <ActionBar>
          <Btn disabled={loading} onClick={onRefresh}>
            Refresh status
          </Btn>
          {isAdmin ? <SyncAllLeadsDialog disabled={loading} onComplete={onSyncComplete} /> : null}
          <Btn variant="secondary" disabled={loading} onClick={onSyncPending}>
            Sync pending leads
          </Btn>
        </ActionBar>
      </Section>
      <Section title="Last webhook">
        {campaign?.lastWebhook ? (
          <p className="text-sm">
            {campaign.lastWebhook.event ?? "event"} · call {campaign.lastWebhook.callId ?? "—"} ·{" "}
            {campaign.lastWebhook.disposition ?? "no disposition"} ·{" "}
            {new Date(campaign.lastWebhook.receivedAt).toLocaleString("en-IN")}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No webhook received yet.</p>
        )}
      </Section>
    </>
  );
}
