import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { ApiClientError } from "@/lib/api";
import {
  endDialerSession,
  getDialerCurrentCall,
  getDialerDispositions,
  getDialerSessionStatus,
  logoutDialerSession,
  startDialerSession,
  storeDialerDisposition,
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

const STATE_LABEL: Record<string, string> = {
  WAITING: "Waiting for next call",
  RINGING: "Ringing",
  CONNECTED: "Connected",
  ENDED: "Call ended",
  DISPOSITION_PENDING: "Disposition pending",
};

type AgentPanelProps = {
  campaign: DialerCampaign | null;
};

export function AgentPanel({ campaign }: AgentPanelProps) {
  const { callLead, ivrCallLead } = useDashboardActions();
  const [session, setSession] = useState<DialerSessionStatus | null>(null);
  const [current, setCurrent] = useState<DialerCurrentCall | null>(null);
  const [dispositions, setDispositions] = useState<DialerDisposition[]>([]);
  const [busy, setBusy] = useState(false);
  const [dispositionId, setDispositionId] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [feedback, setFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [callbackAt, setCallbackAt] = useState("");
  const [showManual, setShowManual] = useState(false);

  const sessionEnabled = Boolean(session?.sessionEnabled ?? campaign?.sessionEnabled);
  const sessionActive = Boolean(session?.active || ["IN_SESSION", "IN_CALL", "WRAP_UP", "READY"].includes(session?.status ?? ""));
  const callState = current?.state ?? "WAITING";
  const lead = current?.lead;
  const call = current?.call;

  const refreshSession = useCallback(async () => {
    try {
      const s = await getDialerSessionStatus();
      setSession(s);
    } catch {
      /* keep last known */
    }
  }, []);

  const refreshCurrentCall = useCallback(async () => {
    try {
      const c = await getDialerCurrentCall();
      setCurrent(c);
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
      toast.error(friendly(err));
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
        leadId: lead?.opportunity_id,
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

  return (
    <>
      <Section title="Live session">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold">{campaign?.name ?? "ZentroFLOW Auto Dialer"}</p>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
              sessionActive
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {sessionActive ? "ACTIVE" : "OFFLINE"}
          </span>
          <span className="text-xs text-muted-foreground">
            Mode: {session?.dialerMode ?? campaign?.dialerMode ?? "—"}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {sessionEnabled
            ? session?.message ?? "Start a session so Smartflo sequences leads automatically."
            : "Session mode is off. Use the Smartflo Dialer Panel, or set SMARTFLO_DIALER_MODE=session on the API."}
        </p>
        <ActionBar>
          <Btn disabled={busy || !sessionEnabled} onClick={() => void runSession("start")}>
            Start Session
          </Btn>
          <Btn variant="secondary" disabled={busy || !sessionEnabled} onClick={() => void runSession("end")}>
            End Session
          </Btn>
          <Btn variant="outline" disabled={busy || !sessionEnabled} onClick={() => void runSession("logout")}>
            Logout
          </Btn>
          <Btn
            variant="outline"
            onClick={() => window.open("https://cloudphone.tatateleservices.com", "_blank", "noopener,noreferrer")}
          >
            Open Smartflo Panel
          </Btn>
        </ActionBar>
      </Section>

      <Section title="Current call">
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">State</p>
          <p className="mt-1 text-lg font-semibold">{STATE_LABEL[callState] ?? callState}</p>
          {call?.status ? (
            <p className="mt-1 text-xs text-muted-foreground">Call status: {call.status}</p>
          ) : null}
          {lead ? (
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Customer</dt>
                <dd className="font-semibold">{lead.customer_name ?? lead.lead_id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-mono text-xs">{lead.customer_mobile ?? call?.customer_number ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Lead</dt>
                <dd className="font-mono text-xs">{lead.opportunity_id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Dial status</dt>
                <dd className="text-xs">{lead.smartflo_dial_status ?? "—"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {sessionActive
                ? "Waiting for Smartflo to place the next call…"
                : "Start a session to receive auto-dialed calls."}
            </p>
          )}
        </div>
      </Section>

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

      <Section title="Manual tools">
        <p className="mb-2 text-sm text-muted-foreground">
          Ops fallback only — not the auto-dial path. Prefer Start Session in session mode.
        </p>
        <Btn variant="outline" onClick={() => setShowManual((v) => !v)}>
          {showManual ? "Hide manual tools" : "Show Call Now / IVR"}
        </Btn>
        {showManual ? (
          <ActionBar>
            <Btn
              disabled={!lead?.customer_mobile}
              onClick={() => lead && callLead(lead.customer_mobile!, lead.customer_name ?? "Lead")}
            >
              Call Now
            </Btn>
            <Btn
              variant="secondary"
              disabled={!lead?.customer_mobile}
              onClick={() =>
                lead &&
                void ivrCallLead(lead.customer_mobile!, lead.customer_name ?? "Lead", lead.opportunity_id)
              }
            >
              IVR Call
            </Btn>
          </ActionBar>
        ) : null}
      </Section>
    </>
  );
}
