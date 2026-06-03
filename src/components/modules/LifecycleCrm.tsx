import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { LIFECYCLE_TIMELINE, LIFECYCLE_MICRO_STAGES } from "@/domain/platform";

const LifecycleCrm = () => (
  <ModuleShell moduleId="lifecycle-crm">
    <Section title="Post-delivery timeline">
      <div className="space-y-2">
        {LIFECYCLE_TIMELINE.map((row) => (
          <div key={row.day} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="font-mono text-xs font-bold text-primary">{row.day}</span>
              <p className="text-sm font-medium">{row.action}</p>
              <p className="text-xs text-muted-foreground">{row.owner}</p>
            </div>
            <Btn variant="outline" fullWidth>Send Message</Btn>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Lifecycle stages (L1–L7)">
      <div className="space-y-2">
        {LIFECYCLE_MICRO_STAGES.map((s) => (
          <div key={s.code} className="flex flex-col gap-2 rounded-xl bg-secondary/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm"><strong className="text-primary">{s.code}</strong> {s.title}</span>
            <Btn variant="outline" fullWidth>Schedule</Btn>
          </div>
        ))}
      </div>
      <ActionBar>
        <Btn variant="secondary">Create Service Task</Btn>
        <Btn variant="secondary">Create Renewal Lead</Btn>
        <Btn variant="secondary">Create Exchange Lead</Btn>
        <Btn variant="secondary">Create Upgrade Opportunity</Btn>
      </ActionBar>
    </Section>
  </ModuleShell>
);

export default LifecycleCrm;
