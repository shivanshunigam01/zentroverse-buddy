import { AlertCircle } from "lucide-react";
import { DIALER_PRIORITIES, PLATFORM_EVENTS } from "@/domain/platform";
import LeadBackboneCard from "@/components/shared/LeadBackboneCard";

const queue = [
  { lead: "LD-2026-000154", stage: "C1.5", action: "Collect CIBIL Consent", owner: "Finance Executive", sla: "2h left", priority: "P1" },
  { lead: "LD-2026-000201", stage: "C0.5", action: "P2 autodialer retry", owner: "Dialer", sla: "15m", priority: "P2" },
  { lead: "LD-2026-000089", stage: "C0.9", action: "Send brochure", owner: "System", sla: "Now", priority: "P4" },
  { lead: "LD-2026-000312", stage: "C2.4", action: "Billing docs reminder", owner: "Billing Team", sla: "Overdue", priority: "P1" },
];

const errors = [
  { lead: "LD-2026-000077", issue: "No next action assigned", since: "3h" },
];

const ActionEngine = () => (
  <div className="space-y-6">
    <LeadBackboneCard />

    <div className="rounded-2xl border border-destructive/30 bg-destructive/[0.05] p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-destructive">
        <AlertCircle size={18} />
        Golden rule: If a lead has no next action, it is a system error.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        One lead = one macro stage + one micro stage + one current owner + one current action.
      </p>
    </div>

    {errors.length > 0 && (
      <div className="surface-card border-destructive/40 p-4">
        <h3 className="text-sm font-bold text-destructive">System errors ({errors.length})</h3>
        {errors.map((e) => (
          <div key={e.lead} className="mt-2 flex justify-between text-sm">
            <span className="font-mono">{e.lead}</span>
            <span className="text-destructive">{e.issue}</span>
          </div>
        ))}
      </div>
    )}

    <div className="surface-card p-4 sm:p-6">
      <h3 className="font-display text-base font-bold">Action queue</h3>
      <div className="mt-4 space-y-2">
        {queue.map((q) => (
          <div key={q.lead} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
            <span className="font-mono text-xs text-muted-foreground">{q.lead}</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{q.stage}</span>
            <span className="flex-1 text-sm font-semibold text-foreground">{q.action}</span>
            <span className="text-xs text-muted-foreground">{q.owner}</span>
            <span className="text-xs font-bold text-warning">{q.sla}</span>
            <span className="rounded-full bg-destructive/12 px-2 py-0.5 text-[10px] font-bold text-destructive">{q.priority}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="surface-card p-4 sm:p-6">
      <h3 className="font-display text-base font-bold">Dialer priority (C0.5)</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {DIALER_PRIORITIES.map((p) => (
          <div key={p.code} className="rounded-xl bg-secondary/30 px-3 py-2.5">
            <span className="font-mono text-xs font-bold text-primary">{p.code}</span>
            <p className="text-sm font-semibold text-foreground">{p.label}</p>
            <p className="text-[11px] text-muted-foreground">{p.description}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="surface-card p-4 sm:p-5">
      <h4 className="text-sm font-bold">Event hooks (backend)</h4>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PLATFORM_EVENTS.map((ev) => (
          <span key={ev} className="rounded-md bg-secondary font-mono text-[10px] px-2 py-1 text-foreground">
            {ev}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default ActionEngine;
