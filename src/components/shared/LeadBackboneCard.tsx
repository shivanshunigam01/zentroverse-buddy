import { AlertTriangle, User, Clock, Target, ArrowRight } from "lucide-react";
import { LEAD_BACKBONE_FIELDS } from "@/domain/platform";

export type LeadBackboneData = {
  leadId: string;
  macroStage: string;
  microStage: string;
  currentOwner: string;
  currentAction: string;
  nextAction: string;
  nextOwner?: string;
  nextActionAt?: string;
  priority: string;
  leadScore: string;
  sla: string;
  escalationOwner: string;
  status: string;
};

const EXAMPLE_LEAD: LeadBackboneData = {
  leadId: "LD-2026-000154",
  macroStage: "C1",
  microStage: "C1.5 Finance Discussion",
  currentOwner: "Finance Executive",
  currentAction: "Collect CIBIL Consent",
  nextAction: "Generate Eligibility Report",
  nextOwner: "Finance Executive",
  nextActionAt: "Today, 6:00 PM",
  priority: "P1",
  leadScore: "72 (Warm)",
  sla: "4 Hours",
  escalationOwner: "Finance Manager",
  status: "Open",
};

interface Props {
  lead?: LeadBackboneData;
  compact?: boolean;
}

const LeadBackboneCard = ({ lead = EXAMPLE_LEAD, compact }: Props) => {
  if (compact) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-accent/[0.04] p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono font-bold text-foreground">{lead.leadId}</span>
          <span className="rounded-md bg-primary/15 px-2 py-0.5 font-bold text-primary">{lead.macroStage}</span>
          <span className="text-muted-foreground">{lead.microStage}</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">{lead.currentAction}</p>
        <p className="text-xs text-muted-foreground">
          {lead.currentOwner} · SLA {lead.sla} · {lead.leadScore}
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card border-primary/15 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Lead backbone</p>
          <h3 className="font-display text-lg font-bold text-foreground">{lead.leadId}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            One stage · one owner · one current action — never ambiguous
          </p>
        </div>
        <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-warning">{lead.status}</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Macro / Micro</p>
          <p className="mt-1 text-sm font-bold text-foreground">{lead.macroStage} → {lead.microStage}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
            <User size={12} /> Current owner
          </div>
          <p className="mt-1 text-sm font-bold text-foreground">{lead.currentOwner}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
            <Target size={12} /> Current action
          </div>
          <p className="mt-1 text-sm font-bold text-foreground">{lead.currentAction}</p>
        </div>
        <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3 sm:col-span-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-primary">
            <ArrowRight size={12} /> Next action
          </div>
          <p className="mt-1 text-sm font-bold text-foreground">{lead.nextAction}</p>
          {lead.nextOwner && (
            <p className="text-xs text-muted-foreground">Owner: {lead.nextOwner}</p>
          )}
        </div>
        <div className="rounded-xl border border-border/70 bg-secondary/20 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
            <Clock size={12} /> SLA
          </div>
          <p className="mt-1 text-sm font-bold text-foreground">{lead.sla}</p>
          {lead.nextActionAt && <p className="text-xs text-muted-foreground">{lead.nextActionAt}</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-destructive/12 px-2.5 py-1 text-[11px] font-bold text-destructive">
          {lead.priority}
        </span>
        <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
          {lead.leadScore}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          <AlertTriangle size={12} className="text-warning" />
          Escalation: {lead.escalationOwner}
        </span>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-semibold text-primary">All backbone fields (for backend)</summary>
        <ul className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
          {LEAD_BACKBONE_FIELDS.map((f) => (
            <li key={f.key}>
              <span className="font-medium text-foreground">{f.label}:</span> {f.example}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};

export default LeadBackboneCard;
