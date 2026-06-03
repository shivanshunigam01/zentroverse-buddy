import { useState } from "react";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { C3_MICRO_STAGES } from "@/domain/platform";

const DeliveryDesk = () => {
  const [active, setActive] = useState(0);

  return (
    <ModuleShell moduleId="delivery-desk">
      <Section title="Delivery checklist">
        <ul className="space-y-2">
          {C3_MICRO_STAGES.map((s, i) => (
            <li key={s.code}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  active === i ? "border-primary bg-primary/[0.06] ring-1 ring-primary/20" : "border-border/70 bg-card hover:border-primary/20"
                }`}
              >
                <input type="checkbox" readOnly checked={i <= active} className="h-4 w-4 shrink-0 rounded" />
                <span className="font-mono text-xs font-bold text-primary">{s.code}</span>
                <span className="font-medium">{s.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Delivery desk actions">
        <ActionBar>
          {["Confirm Payment", "Verify Insurance", "Verify Registration", "Approve PDI", "Mark Vehicle Ready", "Complete Delivery", "Send Feedback Link", "Capture Testimonial", "Ask Referral", "Activate Lifecycle"].map((b) => (
            <Btn key={b} variant="outline">{b}</Btn>
          ))}
        </ActionBar>
      </Section>
    </ModuleShell>
  );
};

export default DeliveryDesk;
