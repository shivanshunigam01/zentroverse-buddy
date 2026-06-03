import { useState } from "react";
import ModuleShell, { Btn, Section, StagePills, ActionBar } from "@/components/shared/ModuleShell";
import { C2_MICRO_STAGES } from "@/domain/platform";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";

const BOOKING_ACTIONS = [
  "Create Booking", "Allocate Vehicle", "Lock Booking Variant", "Upload Billing Docs",
  "Update Disbursement", "Collect Down Payment", "Create Insurance", "Start Registration",
  "Update HSRP", "Complete PDI", "Move to C3",
];

const BookingBilling = () => {
  const [active, setActive] = useState(0);
  const { performAction, selectedLeadId } = useDashboardActions();
  const stage = C2_MICRO_STAGES[active];

  const run = (label: string) => {
    void performAction(label, { macroId: "c2", stageIndex: active, opportunityId: selectedLeadId });
  };

  return (
    <ModuleShell moduleId="booking-billing">
      <StagePills stages={C2_MICRO_STAGES} activeIndex={active} onSelect={setActive} />
      <Section title={`${stage.code} · ${stage.title}`}>
        <p className="text-sm text-muted-foreground">{stage.systemAction}</p>
        <p className="mt-2 text-xs"><strong>Owner:</strong> {stage.owner} · <strong>SLA:</strong> {stage.sla}</p>
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
