import { AlertTriangle, Clock, ChevronRight } from "lucide-react";
import type { Lead } from "@/domain/leads";

const scoreColor: Record<Lead["scoreLabel"], string> = {
  Hot: "bg-destructive/15 text-destructive",
  Warm: "bg-warning/15 text-warning",
  Cold: "bg-info/15 text-info",
  Critical: "bg-accent/15 text-accent",
};

/** Every lead card — backbone fields (main UI rule) */
const LeadCardStrip = ({ lead, onClick }: { lead: Lead; onClick?: () => void }) => {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition-all sm:p-5 ${
        onClick ? "hover:border-primary/30 hover:shadow-md active:scale-[0.995]" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-foreground sm:text-lg">{lead.customerName}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${scoreColor[lead.scoreLabel]}`}>
              {lead.leadScore} · {lead.scoreLabel}
            </span>
          </div>
          <p className="mt-2 space-y-0.5 font-mono text-[10px] sm:text-xs">
            <span className="block text-muted-foreground">
              <span className="font-sans font-bold uppercase tracking-wide">Lead ID:</span> {lead.leadId}
            </span>
            <span className="block text-muted-foreground/90">
              <span className="font-sans font-bold uppercase tracking-wide">Customer ID:</span> {lead.customerId}
            </span>
            <span className="block text-muted-foreground/90">
              <span className="font-sans font-bold uppercase tracking-wide">Opportunity ID:</span> {lead.opportunityId}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-destructive/12 px-2 py-0.5 text-[10px] font-bold text-destructive">{lead.priority}</span>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-foreground">{lead.status}</span>
          {onClick && <ChevronRight size={18} className="text-muted-foreground" />}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
        <Field label="Stage" value={`${lead.currentStage} · ${lead.microStage}`} />
        <Field label="Current action" value={lead.currentAction} highlight />
        <Field label="Owner" value={lead.currentOwner} />
        <Field label="Next action" value={lead.nextAction} />
      </div>

      <div className="mt-3 flex flex-wrap gap-3 border-t border-border/60 pt-3 text-[11px] sm:text-xs">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Clock size={12} className="text-primary" />
          SLA {lead.slaTime}
          {lead.slaCountdown && (
            <span className={lead.slaCountdown === "Overdue" ? "font-bold text-destructive" : "font-semibold text-warning"}>
              ({lead.slaCountdown})
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <AlertTriangle size={12} className="text-warning" />
          Escalation: {lead.escalationOwner}
        </span>
      </div>
    </Wrapper>
  );
};

const Field = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`rounded-xl px-3 py-2 ${highlight ? "bg-primary/[0.06] ring-1 ring-primary/15" : "bg-secondary/40"}`}>
    <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`mt-0.5 text-sm font-medium leading-snug ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
  </div>
);

export default LeadCardStrip;
