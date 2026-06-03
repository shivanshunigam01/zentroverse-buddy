import { PLATFORM_EVENTS } from "@/domain/platform";

const slaRules = [
  { condition: "P1 hot lead not called", threshold: "5 min", action: "Manager alert", escalation: "Sales Manager" },
  { condition: "C1 quote follow-up missed", threshold: "24 hrs", action: "Team leader alert", escalation: "Team Leader" },
  { condition: "Finance docs pending", threshold: "48 hrs", action: "Finance escalation", escalation: "Finance Manager" },
  { condition: "Booking stuck", threshold: "72 hrs", action: "Branch head alert", escalation: "Branch Head" },
];

const automationRules = [
  { if: "New lead received", then: "Send WhatsApp instantly", event: "lead.created" },
  { if: "WhatsApp not active", then: "Push to autodialer P3/P4", event: "lead.verified" },
  { if: "WA read, no reply 2 hrs", then: "Trigger AI call P2", event: "lead.engaged" },
  { if: "Customer clicks Finance", then: "Start finance workflow → C1A", event: "finance.started" },
  { if: "No response after 5 attempts", then: "Move to nurture", event: "lead.qualified" },
  { if: "Delivery done", then: "Activate lifecycle L1–L7", event: "delivery.done" },
];

const WorkflowAutomation = () => (
  <div className="space-y-6">
    <div className="surface-card p-4 sm:p-6">
      <h3 className="font-display text-base font-bold">SLA & escalation engine</h3>
      <div className="mt-4 space-y-2">
        {slaRules.map((r) => (
          <div key={r.condition} className="rounded-xl border border-border/70 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{r.condition}</p>
            <p className="text-xs text-muted-foreground">
              Threshold: {r.threshold} → {r.action} → {r.escalation}
            </p>
          </div>
        ))}
      </div>
    </div>

    <div className="surface-card p-4 sm:p-6">
      <h3 className="font-display text-base font-bold">Action engine rules (sample)</h3>
      <div className="mt-4 space-y-2">
        {automationRules.map((r) => (
          <div key={r.if} className="flex flex-wrap gap-2 rounded-xl bg-secondary/25 px-4 py-3 text-sm">
            <span className="font-semibold text-foreground">IF</span>
            <span className="text-muted-foreground">{r.if}</span>
            <span className="font-semibold text-primary">THEN</span>
            <span className="text-foreground">{r.then}</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{r.event}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="surface-card p-4 sm:p-5">
      <h4 className="text-sm font-bold">Re-engagement triggers</h4>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        <li>Finance rejected → alternate finance queue</li>
        <li>Competitor purchased → recycle after 6 months</li>
        <li>Plan hold → reminder 30 / 60 / 90 days</li>
        <li>Tender postponed → tender follow-up date</li>
      </ul>
    </div>

    <div className="surface-card p-4 sm:p-5">
      <h4 className="text-sm font-bold">All platform events</h4>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PLATFORM_EVENTS.map((ev) => (
          <span key={ev} className="rounded-md bg-primary/10 font-mono text-[10px] px-2 py-1 text-primary">
            {ev}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default WorkflowAutomation;
