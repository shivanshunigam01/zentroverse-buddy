import { useState } from "react";
import ModuleShell, { Btn, Section, StagePills, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { C1A_MICRO_STAGES } from "@/domain/platform";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useOpportunityLeads } from "@/store/selectors";
import { getNextMicroStage } from "@/domain/stages/stage-gates";
import { useZentroFlowStore } from "@/store/opportunity-store";

const FINANCE_ACTIONS = [
  "Upload Docs", "Verify Docs", "Assign FI", "Update FI Result",
  "Mark Approved", "Mark Rejected", "Move Alternate Finance",   "Confirm Margin", "Finalize Add-ons",
  "Confirm Booking Intent", "Move to C2",
];

const FinanceDesk = () => {
  const [active, setActive] = useState(0);
  const { performAction, selectedLeadId } = useDashboardActions();
  const leads = useOpportunityLeads();
  const stage = C1A_MICRO_STAGES[active];
  const opp = useZentroFlowStore((s) =>
    selectedLeadId ? s.opportunities[selectedLeadId] : undefined,
  );
  const nextStep = opp ? getNextMicroStage(opp) : null;

  const run = (label: string) => {
    void performAction(label, { macroId: "c1a", stageIndex: active, opportunityId: selectedLeadId });
  };

  if (leads.length === 0) {
    return (
      <ModuleShell moduleId="finance-desk">
        <EmptyState title="Finance desk empty" description="Import leads and complete C1 before finance cases appear here." />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell moduleId="finance-desk">
      {nextStep && (
        <p className="rounded-xl bg-primary/5 px-4 py-2 text-sm text-primary">
          Selected lead next step: <strong>{nextStep}</strong>
        </p>
      )}
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
