import { useState } from "react";
import ModuleShell, { Btn, Section, StagePills, ActionBar } from "@/components/shared/ModuleShell";
import { C1_MICRO_STAGES, C1_OBJECTION_CATEGORIES } from "@/domain/platform";

const SalesPipeline = () => {
  const [active, setActive] = useState(0);
  const stage = C1_MICRO_STAGES[active];

  return (
    <ModuleShell moduleId="sales-pipeline">
      <StagePills stages={C1_MICRO_STAGES} activeIndex={active} onSelect={setActive} />

      <Section title={`${stage.code} · ${stage.title}`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <Info label="Trigger" value={stage.trigger} />
          <Info label="Owner" value={stage.owner} />
          <Info label="SLA" value={stage.sla} />
          <Info label="Exit" value={stage.exitCondition} className="sm:col-span-2 lg:col-span-3" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{stage.systemAction}</p>
      </Section>

      {active === 2 && (
        <Section title="Objection categories">
          <div className="flex flex-wrap gap-1.5">
            {C1_OBJECTION_CATEGORIES.map((o) => (
              <span key={o} className="chip-filter">{o}</span>
            ))}
          </div>
        </Section>
      )}

      <Section title="Actions">
        <ActionBar>
          {["Create Quote", "Send Quote", "Capture Objection", "Schedule Demo", "Check Affordability", "Start Finance", "Escalate Manager", "Move to Nurture", "Move to C1A"].map((a) => (
            <Btn key={a} variant={a.includes("Move") ? "primary" : "outline"}>{a}</Btn>
          ))}
        </ActionBar>
      </Section>
    </ModuleShell>
  );
};

const Info = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
  <div className={`rounded-xl bg-secondary/40 px-3 py-2.5 ${className}`}>
    <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
    <p className="mt-0.5 font-medium text-foreground">{value}</p>
  </div>
);

export default SalesPipeline;
