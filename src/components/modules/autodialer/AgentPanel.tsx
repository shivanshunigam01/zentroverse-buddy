import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  FileSpreadsheet,
  Inbox,
  MessageCircle,
  type LucideProps,
} from "lucide-react";
import { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import { useOpportunityLeads } from "@/store/selectors";
import { DIALER_PRIORITIES } from "@/domain/platform";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { ApiClientError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { initiateSmartfloAgentCall } from "@/api/smartflo.api";
import {
  endDialerSession,
  getDialerCurrentCall,
  getDialerDispositions,
  getDialerSessionStatus,
  logoutDialerSession,
  startDialerSession,
  storeDialerDisposition,
  syncDialerLead,
} from "@/api/dialer.api";
import type {
  DialerCampaign,
  DialerCurrentCall,
  DialerDisposition,
  DialerSessionStatus,
} from "@/domain/dialer/types";

function friendly(err: unknown): string {
  if (err instanceof ApiClientError) return err.message;
  return "Unable to complete dialer request";
}

function NurtureShortcut({
  label,
  hint,
  icon: Icon,
  onClick,
  disabled,
  tone = "neutral",
}: {
  label: string;
  hint?: string;
  icon: ComponentType<LucideProps>;
  onClick: () => void;
  disabled?: boolean;
  tone?: "neutral" | "inbox" | "wa" | "retry";
}) {
  const tones = {
    neutral: "border-border/70 bg-background hover:border-primary/30 hover:bg-primary/[0.04]",
    inbox: "border-sky-500/25 bg-sky-500/[0.06] hover:bg-sky-500/10 text-sky-900 dark:text-sky-100",
    wa: "border-green-600/25 bg-green-600/[0.07] hover:bg-green-600/12 text-green-800 dark:text-green-300",
    retry: "border-amber-500/25 bg-amber-500/[0.07] hover:bg-amber-500/12 text-amber-900 dark:text-amber-200",
  };
  const iconTones = {
    neutral: "bg-secondary text-foreground",
    inbox: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    wa: "bg-green-600/15 text-green-700 dark:text-green-400",
    retry: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tones[tone],
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          iconTones[tone],
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight text-foreground">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">{hint}</span>
        ) : null}
      </span>
    </button>
  );
}

const STATE_LABEL: Record<string, string> = {
  WAITING: "Waiting for next call",
  RINGING: "Ringing",
  CONNECTED: "Connected",
  ENDED: "Call ended",
  DISPOSITION_PENDING: "Disposition pending",
};

const PRIORITY_RANK: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };

type AgentPanelProps = {
  campaign: DialerCampaign | null;
};

export function AgentPanel({ campaign }: AgentPanelProps) {
  const leads = useOpportunityLeads();
  const { viewLead, ivrCallLead, openWhatsApp, navigate, performAction } = useDashboardActions();
  const [session, setSession] = useState<DialerSessionStatus | null>(null);
  const [current, setCurrent] = useState<DialerCurrentCall | null>(null);
  const [dispositions, setDispositions] = useState<DialerDisposition[]>([]);
  const [busy, setBusy] = useState(false);
  const [calling, setCalling] = useState(false);
  const [ivrCalling, setIvrCalling] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [dispositionId, setDispositionId] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [feedback, setFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [callbackAt, setCallbackAt] = useState("");

  const sessionEnabled = Boolean(session?.sessionEnabled ?? campaign?.sessionEnabled);
  const sessionActive = Boolean(
    session?.active || ["IN_SESSION", "IN_CALL", "WRAP_UP", "READY"].includes(session?.status ?? ""),
  );
  const callState = current?.state ?? "WAITING";
  const liveLead = current?.lead;
  const call = current?.call;

  const dialerQueue = useMemo(
    () =>
      [...leads]
        .filter((l) => l.microStageCode === "C0.5" || l.status === "Open")
        .sort(
          (a, b) =>
            (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) || b.leadScore - a.leadScore,
        ),
    [leads],
  );

  const byPriority = DIALER_PRIORITIES.map((p) => ({
    ...p,
    count: dialerQueue.filter((l) => l.priority === p.code).length,
  }));

  const selectedLead =
    dialerQueue.find((l) => l.opportunityId === selectedOppId) ??
    dialerQueue.find((l) => l.opportunityId === liveLead?.opportunity_id) ??
    dialerQueue[0] ??
    null;

  const nurtureMobile = liveLead?.customer_mobile ?? selectedLead?.mobile ?? "";
  const nurtureName = liveLead?.customer_name ?? selectedLead?.customerName ?? "Lead";
  const nurtureOppId = liveLead?.opportunity_id ?? selectedLead?.opportunityId ?? "";

  const refreshSession = useCallback(async () => {
    try {
      setSession(await getDialerSessionStatus());
    } catch {
      /* keep last known */
    }
  }, []);

  const refreshCurrentCall = useCallback(async () => {
    try {
      setCurrent(await getDialerCurrentCall());
    } catch {
      /* keep last known */
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const [s, d] = await Promise.all([
          getDialerSessionStatus(),
          getDialerDispositions().catch(() => [] as DialerDisposition[]),
        ]);
        setSession(s);
        setDispositions(d);
        setCurrent(await getDialerCurrentCall());
      } catch (err) {
        toast.error(friendly(err));
      }
    })();
  }, []);

  useEffect(() => {
    if (!sessionEnabled) return;
    const timer = window.setInterval(() => {
      void refreshSession();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [sessionEnabled, refreshSession]);

  useEffect(() => {
    if (!sessionEnabled || !sessionActive) return;
    const timer = window.setInterval(() => {
      void refreshCurrentCall();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [sessionEnabled, sessionActive, refreshCurrentCall]);

  const SMARTFLO_PANEL_URL = "https://cloudphone.tatateleservices.com/dialer/login";

  const openSmartfloPanel = () => {
    window.open(SMARTFLO_PANEL_URL, "_blank", "noopener,noreferrer");
  };

  const runSession = async (kind: "start" | "end" | "logout") => {
    setBusy(true);
    try {
      if (kind === "start") await startDialerSession();
      if (kind === "end") await endDialerSession();
      if (kind === "logout") await logoutDialerSession();
      toast.success(kind === "start" ? "Session started — Smartflo will auto-dial" : "Session ended");
      await refreshSession();
      await refreshCurrentCall();
    } catch (err) {
      const code = err instanceof ApiClientError ? err.code : "";
      if (kind === "start" && (code === "SMARTFLO_AGENT_NOT_LOGGED_IN" || /not logged into any campaign/i.test(friendly(err)))) {
        toast.error("Log into Smartflo Dialer Panel first", {
          description: "Open the panel, join the campaign, then click Start Session again.",
          action: {
            label: "Open Panel",
            onClick: () => openSmartfloPanel(),
          },
        });
        openSmartfloPanel();
      } else {
        toast.error(friendly(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const submitDisposition = async () => {
    if (!dispositionId) {
      toast.error("Select a disposition");
      return;
    }
    setBusy(true);
    try {
      await storeDialerDisposition({
        leadId: (liveLead?.opportunity_id ?? nurtureOppId) || undefined,
        callId: call?.id ?? call?._id ?? call?.smartflo_call_id ?? call?.smartflo_uuid ?? undefined,
        dispositionStatus: dispositionId,
        notes: notes || undefined,
        note: notes || undefined,
        priority,
        feedback: feedback || undefined,
        callbackAt: callbackAt ? new Date(callbackAt).toISOString() : undefined,
      });
      toast.success("Disposition saved");
      setDispositionId("");
      setFeedback("");
      setNotes("");
      setCallbackAt("");
      await refreshCurrentCall();
    } catch (err) {
      toast.error(friendly(err));
    } finally {
      setBusy(false);
    }
  };

  const runDirectCall = async () => {
    if (!nurtureMobile) {
      toast.error("Select a lead with a phone number");
      return;
    }
    setCalling(true);
    try {
      await initiateSmartfloAgentCall({
        phoneNumber: nurtureMobile.replace(/\s/g, ""),
        opportunityId: nurtureOppId || undefined,
        customerName: nurtureName,
      });
      toast.success("Direct call initiated");
    } catch (err) {
      toast.error(friendly(err));
    } finally {
      setCalling(false);
    }
  };

  const runIvrCall = async () => {
    if (!nurtureMobile) {
      toast.error("Select a lead with a phone number");
      return;
    }
    setIvrCalling(true);
    try {
      await ivrCallLead(nurtureMobile, nurtureName, nurtureOppId || undefined);
    } finally {
      setIvrCalling(false);
    }
  };

  const addToDialer = async () => {
    if (!nurtureOppId) return;
    setBusy(true);
    try {
      const result = await syncDialerLead(nurtureOppId);
      toast.success("Lead synced to Auto Dialer", {
        description: result.smartflo_lead_id ? `Smartflo ID ready` : "On the campaign lead list",
      });
    } catch (err) {
      toast.error(friendly(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Section title="Lead nurture shortcuts">
        <p className="mb-3 text-sm text-muted-foreground">
          Move leads through C0 stages with upload, WhatsApp (AiSensy), Direct Call, and IVR — then auto-dial when ready.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <NurtureShortcut
            label="Bulk Excel upload"
            hint="Import leads"
            icon={FileSpreadsheet}
            onClick={() => navigate("lead-upload")}
          />
          <NurtureShortcut
            label="Lead Inbox"
            hint="AiSensy · stages"
            icon={Inbox}
            tone="inbox"
            onClick={() => navigate("lead-inbox")}
          />
          <NurtureShortcut
            label="WhatsApp bot"
            hint="AiSensy nurture"
            icon={MessageCircle}
            tone="wa"
            disabled={!nurtureOppId}
            onClick={() => nurtureOppId && openWhatsApp(nurtureOppId)}
          />
          <NurtureShortcut
            label="Schedule retry"
            hint="Follow-up later"
            icon={CalendarClock}
            tone="retry"
            disabled={!nurtureOppId}
            onClick={() => nurtureOppId && void performAction("Schedule Retry", { opportunityId: nurtureOppId })}
          />
        </div>
      </Section>

      <Section title="Live session (auto-dial)">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold">{campaign?.name ?? "ZentroFLOW Auto Dialer"}</p>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
              sessionActive
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : sessionEnabled
                  ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                  : "bg-secondary text-muted-foreground"
            }`}
          >
            {sessionActive ? "ACTIVE" : sessionEnabled ? "READY" : "OFFLINE"}
          </span>
          <span className="text-xs text-muted-foreground">
            Mode: {session?.dialerMode ?? campaign?.dialerMode ?? "—"}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {sessionActive
            ? "Session is live — answer the first call; Smartflo will keep auto-dialing synced leads. Use End Session when finished."
            : sessionEnabled
              ? "Step 1: Open Smartflo Dialer Panel and log in to the campaign. Step 2: Start Session. Step 3: Take the first call — autodialer continues."
              : "Set SMARTFLO_API_TOKEN and SMARTFLO_CAMPAIGN_ID on the API, then Start Session will unlock."}
        </p>
        <ActionBar>
          <Btn variant="outline" onClick={openSmartfloPanel}>
            1. Open Smartflo Panel
          </Btn>
          <Btn
            disabled={busy || !sessionEnabled || sessionActive}
            onClick={() => void runSession("start")}
            title={!sessionEnabled ? "Configure campaign on the API" : sessionActive ? "Session already active" : "Start after logging into Smartflo Panel"}
          >
            {sessionActive ? "Session running" : "2. Start Session"}
          </Btn>
          <Btn variant="secondary" disabled={busy || !sessionEnabled || !sessionActive} onClick={() => void runSession("end")}>
            End Session
          </Btn>
          <Btn variant="outline" disabled={busy || !sessionEnabled} onClick={() => void runSession("logout")}>
            Logout
          </Btn>
        </ActionBar>
      </Section>

      <Section title="Current call">
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">State</p>
          <p className="mt-1 text-lg font-semibold">{STATE_LABEL[callState] ?? callState}</p>
          {liveLead ? (
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Customer</dt>
                <dd className="font-semibold">{liveLead.customer_name ?? liveLead.lead_id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-mono text-xs">{liveLead.customer_mobile ?? call?.customer_number ?? "—"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {sessionActive
                ? "Waiting for Smartflo to place the next call…"
                : "No live auto-dial call. Pick a queue lead below for Direct Call / IVR nurture."}
            </p>
          )}
        </div>
      </Section>

      <Section title="Direct Call · IVR · Sync (stage nurture)">
        <p className="mb-2 text-sm text-muted-foreground">
          Active lead:{" "}
          <span className="font-semibold text-foreground">
            {nurtureName}
            {nurtureMobile ? ` · ${nurtureMobile}` : ""}
          </span>
        </p>
        <ActionBar>
          <Btn disabled={calling || !nurtureMobile} onClick={() => void runDirectCall()}>
            {calling ? "Calling…" : "Direct Call (Smartflo)"}
          </Btn>
          <Btn variant="secondary" disabled={ivrCalling || !nurtureMobile} onClick={() => void runIvrCall()}>
            {ivrCalling ? "IVR…" : "IVR Call"}
          </Btn>
          <Btn variant="outline" disabled={busy || !nurtureOppId} onClick={() => void addToDialer()}>
            Sync to Auto Dialer
          </Btn>
          <Btn variant="outline" disabled={!nurtureOppId} onClick={() => nurtureOppId && viewLead(nurtureOppId)}>
            Open lead
          </Btn>
        </ActionBar>
      </Section>

      {leads.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Import Excel from Lead Upload or add a lead in Lead Inbox — then nurture with WhatsApp, IVR, or Direct Call before auto-dial."
        >
          <ActionBar>
            <Btn onClick={() => navigate("lead-upload")}>Go to Lead Upload</Btn>
            <Btn variant="secondary" onClick={() => navigate("lead-inbox")}>
              Go to Lead Inbox
            </Btn>
          </ActionBar>
        </EmptyState>
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
          <Section title="Queue (select to nurture)">
            <div className="space-y-3">
              {dialerQueue.slice(0, 10).map((l) => {
                const active = (selectedOppId ?? selectedLead?.opportunityId) === l.opportunityId;
                return (
                  <div
                    key={l.leadId}
                    className={`rounded-2xl border p-1 transition-colors ${
                      active ? "border-primary bg-primary/5" : "border-transparent"
                    }`}
                  >
                    <LeadCardStrip
                      lead={l}
                      onClick={() => {
                        setSelectedOppId(l.opportunityId);
                        viewLead(l.opportunityId);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </Section>
        </>
      )}

      <Section title="Disposition">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted-foreground">Smartflo disposition</span>
            <select
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={dispositionId}
              onChange={(e) => setDispositionId(e.target.value)}
            >
              <option value="">Select…</option>
              {dispositions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Priority</span>
            <select
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-muted-foreground">Feedback</span>
            <input
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={500}
              placeholder="Short agent feedback"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-muted-foreground">Notes</span>
            <textarea
              className="mt-1 min-h-[80px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              placeholder="Call notes"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Callback date/time</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={callbackAt}
              onChange={(e) => setCallbackAt(e.target.value)}
            />
          </label>
        </div>
        <ActionBar>
          <Btn disabled={busy || !dispositionId} onClick={() => void submitDisposition()}>
            Save disposition
          </Btn>
        </ActionBar>
      </Section>
    </>
  );
}
