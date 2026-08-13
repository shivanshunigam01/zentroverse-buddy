import { useState } from "react";
import ModuleShell, { Btn, Section, StagePills, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { StageWorkqueue } from "@/components/shared/StageWorkqueue";
import { C2_MICRO_STAGES } from "@/domain/platform";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useOpportunityLeads } from "@/store/selectors";
import { getStageMaster } from "@/domain/stages/stage-master";

const BOOKING_ACTIONS = [
  "Create Booking", "Allocate Vehicle", "Lock Booking Variant", "Upload Billing Docs",
  "Update Disbursement", "Collect Down Payment", "Create Insurance", "Start Registration",
  "Update HSRP", "Complete PDI", "Move to C3",
];

const BookingBilling = () => {
  const [active, setActive] = useState(0);
  const { performAction, selectedLeadId, viewLead } = useDashboardActions();
  const leads = useOpportunityLeads();
  const stage = C2_MICRO_STAGES[active];
  const master = getStageMaster(stage.code);

  const run = (label: string) => {
    void performAction(label, { macroId: "c2", stageIndex: active, opportunityId: selectedLeadId });
  };

  if (leads.length === 0) {
    return (
      <ModuleShell moduleId="booking-billing">
        <EmptyState title="No bookings yet" description="Complete C1A booking intent, then work C2 cases here." />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell moduleId="booking-billing">
      <StageWorkqueue title="C2 workqueue" stagePrefix="C2" leads={leads} onSelect={viewLead} />
      <StagePills stages={C2_MICRO_STAGES} activeIndex={active} onSelect={setActive} />
      <Section title={`${stage.code} · ${stage.title}`}>
        <p className="text-sm text-muted-foreground">{master?.currentAction ?? stage.systemAction}</p>
        <p className="mt-2 text-xs">
          <strong>Owner:</strong> {master?.currentOwner ?? stage.owner} · <strong>SLA:</strong>{" "}
          {master?.defaultSla ?? stage.sla}
        </p>
        {master?.mandatoryValidation && (
          <p className="mt-2 text-xs text-muted-foreground">Mandatory: {master.mandatoryValidation}</p>
        )}
      </Section>
      <Section title="Booking & billing actions">
        <ActionBar>
          {BOOKING_ACTIONS.map((b) => (
            <Btn key={b} variant="outline" onClick={() => run(b)}>{b}</Btn>
          ))}
        </ActionBar>
      </Section>
    </ModuleShell>
  );
};

export default BookingBilling;
