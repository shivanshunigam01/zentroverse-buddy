import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import { MOCK_LEADS } from "@/domain/leads";
import { DIALER_PRIORITIES } from "@/domain/platform";

const CALL_RESULTS = [
  "Connected Interested", "Callback Later", "No Answer", "Busy", "Switched Off",
  "Wrong Number", "Not Interested", "Purchased Competitor",
];

const Autodialer = () => (
  <ModuleShell moduleId="autodialer">
    <Section title="C0.5 · Priority queue">
      <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 lg:grid-cols-5">
        {DIALER_PRIORITIES.map((p) => (
          <div key={p.code} className="rounded-2xl border border-border/70 bg-card p-4 transition-shadow hover:shadow-md">
            <span className="font-mono text-xs font-bold text-primary">{p.code}</span>
            <p className="mt-1 text-sm font-semibold">{p.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{p.description}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Queue">
      <div className="space-y-3">
        {MOCK_LEADS.slice(0, 3).map((l) => (
          <LeadCardStrip key={l.leadId} lead={l} />
        ))}
      </div>
    </Section>

    <Section title="Call result">
      <div className="flex flex-wrap gap-2">
        {CALL_RESULTS.map((r) => (
          <button key={r} type="button" className="chip-filter text-left">{r}</button>
        ))}
      </div>
      <ActionBar>
        <Btn>Call Now</Btn>
        <Btn variant="outline">Schedule Retry</Btn>
        <Btn variant="secondary">Assign Executive</Btn>
        <Btn variant="secondary">Move Dormant</Btn>
        <Btn variant="danger">Mark Lost</Btn>
      </ActionBar>
    </Section>
  </ModuleShell>
);

export default Autodialer;
