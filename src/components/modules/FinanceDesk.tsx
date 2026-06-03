import { useState } from "react";
import ModuleShell, { Btn, Section, StagePills, ActionBar } from "@/components/shared/ModuleShell";
import { C1A_MICRO_STAGES } from "@/domain/platform";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";

const FINANCE_ACTIONS = [
  "Upload Docs", "Verify Docs", "Assign FI", "Update FI Result",
  "Mark Approved", "Mark Rejected", "Move Alternate Finance", "Confirm Margin", "Move to C2",
];

const FinanceDesk = () => {
  const [active, setActive] = useState(0);
  const { performAction, selectedLeadId } = useDashboardActions();
  const stage = C1A_MICRO_STAGES[active];

  const run = (label: string) => {
    void performAction(label, { macroId: "c1a", stageIndex: active, opportunityId: selectedLeadId });
  };

  return (
    <ModuleShell moduleId="finance-desk">
      <StagePills stages={C1A_MICRO_STAGES} activeIndex={active} onSelect={setActive} />
      <Section title={`${stage.code} · ${stage.title}`}>
        <p className="text-sm text-muted-foreground">{stage.systemAction}</p>
        <p className="mt-2 text-xs"><strong>Owner:</strong> {stage.owner} · <strong>SLA:</strong> {stage.sla}</p>
      </Section>
      <Section title="Finance desk actions">
        <ActionBar>
          {FINANCE_ACTIONS.map((b) => (
            <Btn key={b} variant="outline" onClick={() => run(b)}>{b}</Btn>
          ))}
        </ActionBar>
      </Section>
    </ModuleShell>
  );
};

export default FinanceDesk;
