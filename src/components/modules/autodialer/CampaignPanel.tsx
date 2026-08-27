import { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { SyncAllLeadsDialog } from "@/components/modules/autodialer/SyncAllLeadsDialog";
import type { DialerCampaign } from "@/domain/dialer/types";

type Props = {
  campaign: DialerCampaign | null;
  loading: boolean;
  isAdmin: boolean;
  onRefresh: () => void;
  onSyncPending: () => void;
  onSyncComplete: () => void;
};

export function CampaignPanel({ campaign, loading, isAdmin, onRefresh, onSyncPending, onSyncComplete }: Props) {
  return (
    <>
      <Section title="Smartflo connection">
        <p className="text-sm">
          {campaign?.connected ? "Connected" : "Not connected"} · Mode: {campaign?.dialerMode ?? "—"}
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
            ["Lead count", String(campaign?.leadCount ?? 0)],
            ["New / pending", String(campaign?.newLeadCount ?? campaign?.pendingLeadCount ?? 0)],
            ["Synced", String(campaign?.syncedLeadCount ?? 0)],
            ["Calls", String(campaign?.completedCalls ?? 0)],
            ["Successful", String(campaign?.successfulCalls ?? 0)],
            ["Failed", String(campaign?.failedCalls ?? 0)],
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
