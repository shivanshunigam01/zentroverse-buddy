import { toast } from "sonner";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import { useOpportunityLeads } from "@/store/selectors";
import { DIALER_PRIORITIES } from "@/domain/platform";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";

const CALL_RESULTS = [
  "Connected Interested", "Callback Later", "No Answer", "Busy", "Switched Off",
  "Wrong Number", "Not Interested", "Purchased Competitor",
];

const Autodialer = () => {
  const leads = useOpportunityLeads();
  const { performAction, viewLead, callLead } = useDashboardActions();
  const queueLead = leads[1] ?? leads[0];

  const logCallResult = (result: string) => {
    if (queueLead) {
      void performAction("Call Now", { opportunityId: queueLead.opportunityId });
    }
    toast.success("Call result logged", { description: result });
  };

  return (
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
        {leads.slice(0, 3).map((l) => (
          <LeadCardStrip key={l.leadId} lead={l} onClick={() => viewLead(l.leadId)} />
        ))}
      </div>
    </Section>

    <Section title="Call result">
      <div className="flex flex-wrap gap-2">
        {CALL_RESULTS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => logCallResult(r)}
            className="chip-filter text-left"
          >
            {r}
          </button>
        ))}
      </div>
      <ActionBar>
        <Btn onClick={() => queueLead && callLead(queueLead.mobile, queueLead.customerName)}>Call Now</Btn>
        <Btn onClick={() => queueLead && performAction("Schedule Retry", { opportunityId: queueLead.opportunityId })}>Schedule Retry</Btn>
        <Btn onClick={() => queueLead && performAction("Assign Executive", { opportunityId: queueLead.opportunityId })}>Assign Executive</Btn>
        <Btn onClick={() => queueLead && performAction("Move Dormant", { opportunityId: queueLead.opportunityId })}>Move Dormant</Btn>
        <Btn variant="danger" onClick={() => queueLead && performAction("Mark Lost", { opportunityId: queueLead.opportunityId })}>Mark Lost</Btn>
      </ActionBar>
    </Section>
  </ModuleShell>
  );
};

export default Autodialer;
