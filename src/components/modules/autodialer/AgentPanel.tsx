import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import { useOpportunityLeads } from "@/store/selectors";
import { DIALER_PRIORITIES } from "@/domain/platform";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { ApiClientError } from "@/lib/api";
import {
  endDialerSession,
  getDialerDispositions,
  getDialerSessionStatus,
  logoutDialerSession,
  startDialerSession,
  storeDialerDisposition,
} from "@/api/dialer.api";
import type { DialerCampaign, DialerDisposition, DialerSessionStatus } from "@/domain/dialer/types";

const PRIORITY_RANK: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };

function friendly(err: unknown): string {
  if (err instanceof ApiClientError) return err.message;
  return "Unable to complete dialer request";
}

type AgentPanelProps = {
  campaign: DialerCampaign | null;
};

export function AgentPanel({ campaign }: AgentPanelProps) {
  const leads = useOpportunityLeads();
  const { performAction, viewLead, callLead, ivrCallLead } = useDashboardActions();
  const [session, setSession] = useState<DialerSessionStatus | null>(null);
  const [dispositions, setDispositions] = useState<DialerDisposition[]>([]);
  const [busy, setBusy] = useState(false);

  const dialerQueue = [...leads]
    .filter((l) => l.microStageCode === "C0.5" || l.status === "Open")
    .sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) || b.leadScore - a.leadScore);
  const queueLead = dialerQueue[0] ?? leads[0];
  const byPriority = DIALER_PRIORITIES.map((p) => ({
    ...p,
    count: dialerQueue.filter((l) => l.priority === p.code).length,
  }));

  const refresh = async () => {
    try {
      const [s, d] = await Promise.all([getDialerSessionStatus(), getDialerDispositions().catch(() => [])]);
      setSession(s);
      setDispositions(d);
    } catch (err) {
      toast.error(friendly(err));
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const runSession = async (kind: "start" | "end" | "logout") => {
    setBusy(true);
    try {
      if (kind === "start") await startDialerSession();
      if (kind === "end") await endDialerSession();
      if (kind === "logout") await logoutDialerSession();
      toast.success(kind === "start" ? "Session started" : "Session ended");
      await refresh();
    } catch (err) {
      toast.error(friendly(err));
    } finally {
      setBusy(false);
    }
  };

  const submitDisposition = async (dispositionStatus: string) => {
    if (!queueLead) return;
    setBusy(true);
    try {
      await storeDialerDisposition({
        leadId: queueLead.opportunityId,
        dispositionStatus,
      });
      toast.success("Disposition submitted");
    } catch (err) {
      toast.error(friendly(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Section title="Campaign">
        <p className="text-sm font-semibold">{campaign?.name ?? "ZentroFLOW Auto Dialer"}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Status: {campaign?.status ?? session?.status ?? "UNKNOWN"} · Agent: {session?.status ?? "OFFLINE"}
        </p>
        <p className="mt-3 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-sm">
          Calling is handled by the Smartflo Dialer Panel. This campaign uses Dial Out (Each Call) unless session
          mode is enabled.
        </p>
        <ActionBar>
          <Btn
            variant="outline"
            onClick={() => window.open("https://cloudphone.tatateleservices.com", "_blank", "noopener,noreferrer")}
          >
            Open Smartflo Dialer Panel
          </Btn>
          <Btn disabled={busy || !session?.sessionEnabled} onClick={() => void runSession("start")}>
            Start Session
          </Btn>
          <Btn variant="secondary" disabled={busy || !session?.sessionEnabled} onClick={() => void runSession("end")}>
            End Session
          </Btn>
          <Btn variant="outline" disabled={busy || !session?.sessionEnabled} onClick={() => void runSession("logout")}>
            Logout
          </Btn>
        </ActionBar>
      </Section>

      {leads.length === 0 ? (
        <EmptyState
          title="No leads in queue"
          description="Upload and import leads from Excel. Autodialer queue fills from opportunities in the C0 funnel."
        />
      ) : (
        <>
          <Section title="C0.5 · Priority queue">
            <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 lg:grid-cols-5">
              {byPriority.map((p) => (
                <div key={p.code} className="rounded-2xl border border-border/70 bg-card p-4">
                  <span className="font-mono text-xs font-bold text-primary">{p.code}</span>
                  <p className="mt-1 text-sm font-semibold">{p.label}</p>
                  <p className="mt-2 text-lg font-bold tabular-nums">{p.count}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Queue (P1 → P5)">
            <div className="space-y-3">
              {dialerQueue.slice(0, 8).map((l) => (
                <LeadCardStrip key={l.leadId} lead={l} onClick={() => viewLead(l.opportunityId)} />
              ))}
            </div>
          </Section>
          <Section title="Call result · Smartflo dispositions">
            <div className="flex flex-wrap gap-2">
              {dispositions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Dispositions load from Smartflo. Log the call in the Dialer Panel; webhook updates ZentroFLOW.
                </p>
              ) : (
                dispositions.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    disabled={busy}
                    onClick={() => void submitDisposition(d.id)}
                    className="chip-filter text-left"
                  >
                    {d.name}
                  </button>
                ))
              )}
            </div>
            <ActionBar>
              <Btn onClick={() => queueLead && callLead(queueLead.mobile, queueLead.customerName)}>Call Now</Btn>
              <Btn
                variant="secondary"
                onClick={() =>
                  queueLead && void ivrCallLead(queueLead.mobile, queueLead.customerName, queueLead.opportunityId)
                }
              >
                IVR Call
              </Btn>
              <Btn onClick={() => queueLead && performAction("Schedule Retry", { opportunityId: queueLead.opportunityId })}>
                Schedule Retry
              </Btn>
            </ActionBar>
          </Section>
        </>
      )}
    </>
  );
}
