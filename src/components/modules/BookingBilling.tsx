import { useState } from "react";
import ModuleShell, { Btn, Section, StagePills, ActionBar } from "@/components/shared/ModuleShell";
import { C2_MICRO_STAGES } from "@/domain/platform";

const BookingBilling = () => {
  const [active, setActive] = useState(0);
  const stage = C2_MICRO_STAGES[active];

  return (
    <ModuleShell moduleId="booking-billing">
      <StagePills stages={C2_MICRO_STAGES} activeIndex={active} onSelect={setActive} />
      <Section title={`${stage.code} · ${stage.title}`}>
        <p className="text-sm text-muted-foreground">{stage.systemAction}</p>
      </Section>
      <Section title="Booking UI actions">
        <ActionBar>
          {["Create Booking", "Allocate Vehicle", "Lock Variant", "Upload Billing Docs", "Update Disbursement", "Collect Down Payment", "Create Insurance", "Start Registration", "Update HSRP", "Complete PDI", "Move to C3"].map((b) => (
            <Btn key={b} variant="outline">{b}</Btn>
          ))}
        </ActionBar>
      </Section>
    </ModuleShell>
  );
};

export default BookingBilling;
