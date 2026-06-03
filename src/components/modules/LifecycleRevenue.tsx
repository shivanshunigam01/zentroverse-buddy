import { LIFECYCLE_TIMELINE, LIFECYCLE_MICRO_STAGES } from "@/domain/platform";
import LeadBackboneCard from "@/components/shared/LeadBackboneCard";
import MicroStagePanel from "@/components/shared/MicroStagePanel";

const LifecycleRevenue = () => (
  <div className="space-y-6">
    <LeadBackboneCard
      lead={{
        leadId: "CU-2024-00892",
        macroStage: "Lifecycle",
        microStage: "L1 Service Reminder",
        currentOwner: "CRM Team",
        currentAction: "Day 30 service reminder",
        nextAction: "Book first service",
        priority: "P4",
        leadScore: "— (Customer)",
        sla: "Day 30",
        escalationOwner: "Service Manager",
        status: "Active",
      }}
    />

    <div className="surface-card p-4 sm:p-6">
      <h3 className="font-display text-base font-bold text-foreground">Post-delivery timeline</h3>
      <p className="mt-1 text-sm text-muted-foreground">Turn one sale into 10-year revenue</p>
      <div className="mt-4 space-y-2">
        {LIFECYCLE_TIMELINE.map((row) => (
          <div
            key={row.day}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-secondary/20 px-4 py-3"
          >
            <span className="w-24 shrink-0 font-mono text-xs font-bold text-primary">{row.day}</span>
            <span className="flex-1 text-sm font-medium text-foreground">{row.action}</span>
            <span className="text-xs text-muted-foreground">{row.owner}</span>
          </div>
        ))}
      </div>
    </div>

    <MicroStagePanel
      macroLabel="Lifecycle revenue engine"
      purpose="Service, insurance, AMC, upgrade, exchange, repeat purchase, referral"
      stages={LIFECYCLE_MICRO_STAGES}
      highlightCode="L1"
    />

    <div className="surface-card p-4 sm:p-5">
      <h4 className="text-sm font-bold text-foreground">Lifecycle tracking fields (backend)</h4>
      <p className="mt-2 text-xs text-muted-foreground">
        Service history · insurance expiry · permit · fitness · tyres · battery · warranty · vehicle age ·
        running KM · repair cost · exchange value · referral potential
      </p>
    </div>
  </div>
);

export default LifecycleRevenue;
