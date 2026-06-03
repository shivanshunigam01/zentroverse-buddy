import { useState } from "react";
import ModuleShell, { Btn, Section, StagePills, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { C1_MICRO_STAGES, C1_OBJECTION_CATEGORIES } from "@/domain/platform";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useOpportunityLeads } from "@/store/selectors";
import { getNextMicroStage } from "@/domain/stages/stage-gates";
import { useZentroFlowStore } from "@/store/opportunity-store";

const SALES_ACTIONS = [
  "Create Quote", "Send Quote", "Capture Objection", "Schedule Demo",
  "Check Affordability", "Start Finance", "Escalate Manager", "Move to Nurture", "Move to C1A",
];

const SalesPipeline = () => {
  const { performAction, selectedLeadId } = useDashboardActions();
  const leads = useOpportunityLeads();
  const [active, setActive] = useState(0);
  const stage = C1_MICRO_STAGES[active];
  const opp = useZentroFlowStore((s) =>
    selectedLeadId ? s.opportunities[selectedLeadId] : undefined,
  );
  const nextStep = opp ? getNextMicroStage(opp) : null;

  const run = (label: string) => {
    void performAction(label, { macroId: "c1", stageIndex: active, opportunityId: selectedLeadId });
  };

  if (leads.length === 0) {
    return (
      <ModuleShell moduleId="sales-pipeline">
        <EmptyState
          title="Sales pipeline locked"
          description="Complete C0 (through C0.10) for at least one lead, then upload or open leads here for C1."
        />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell moduleId="sales-pipeline">
      {nextStep && (
        <p className="rounded-xl bg-primary/5 px-4 py-2 text-sm text-primary">
          Selected lead next step: <strong>{nextStep}</strong>
        </p>
      )}
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
              <button
                key={o}
                type="button"
                onClick={() => run("Capture Objection")}
                className="chip-filter"
              >
                {o}
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title="Actions">
        <ActionBar>
          {SALES_ACTIONS.map((a) => (
            <Btn key={a} variant={a.includes("Move") ? "primary" : "outline"} onClick={() => run(a)}>{a}</Btn>
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
