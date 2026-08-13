import { useMemo, useState } from "react";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import { StageWorkqueue } from "@/components/shared/StageWorkqueue";
import { C3_MICRO_STAGES } from "@/domain/platform";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useOpportunityLeads } from "@/store/selectors";
import { useZentroFlowStore } from "@/store/opportunity-store";

const DELIVERY_ACTIONS = [
  "Confirm Payment", "Verify Insurance", "Verify Registration", "Approve PDI",
  "Mark Vehicle Ready", "Complete Delivery", "Send Feedback Link", "Capture Testimonial",
  "Ask Referral", "Activate Lifecycle",
];

const DeliveryDesk = () => {
  const [active, setActive] = useState(0);
  const { performAction, selectedLeadId, viewLead } = useDashboardActions();
  const leads = useOpportunityLeads();
  const opp = useZentroFlowStore((s) =>
    selectedLeadId ? s.opportunities[selectedLeadId] : undefined,
  );

  const completedCodes = useMemo(() => {
    const data = opp?.stage_step_data ?? {};
    return new Set(
      Object.entries(data)
        .filter(([, v]) => v.completed_at || v.fields?.delivery_proof)
        .map(([code]) => code),
    );
  }, [opp]);

  const run = (label: string, index: number) => {
    setActive(index);
    const stage = C3_MICRO_STAGES[index];
    if (opp && stage) {
      useZentroFlowStore.getState().upsertOpportunity({
        ...opp,
        stage_step_data: {
          ...opp.stage_step_data,
          [stage.code]: {
            ...opp.stage_step_data?.[stage.code],
            completed_at: new Date().toISOString(),
            fields: {
              ...opp.stage_step_data?.[stage.code]?.fields,
              delivery_checklist: "done",
            },
          },
        },
      });
    }
    void performAction(label, { macroId: "c3", stageIndex: index, opportunityId: selectedLeadId });
  };

  if (leads.length === 0) {
    return (
      <ModuleShell moduleId="delivery-desk">
        <EmptyState title="Delivery desk empty" description="Complete C2 PDI, then manage C3 handover here." />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell moduleId="delivery-desk">
      <StageWorkqueue title="C3 workqueue" stagePrefix="C3" leads={leads} onSelect={viewLead} />
      <Section title="Delivery checklist (persisted per opportunity)">
        <ul className="space-y-2">
          {C3_MICRO_STAGES.map((s, i) => {
            const done = completedCodes.has(s.code) || i < active;
            return (
              <li key={s.code}>
                <button
                  type="button"
                  onClick={() => run(DELIVERY_ACTIONS[i] ?? s.title, i)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    active === i
                      ? "border-primary bg-primary/[0.06] ring-1 ring-primary/20"
                      : "border-border/70 bg-card hover:border-primary/20"
                  }`}
                >
                  <input type="checkbox" readOnly checked={done} className="h-4 w-4 shrink-0 rounded" />
                  <span className="font-mono text-xs font-bold text-primary">{s.code}</span>
                  <span className="font-medium">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>
      <Section title="Delivery desk actions">
        <ActionBar>
          {DELIVERY_ACTIONS.map((b, i) => (
            <Btn key={b} variant="outline" onClick={() => run(b, i)}>{b}</Btn>
          ))}
        </ActionBar>
      </Section>
    </ModuleShell>
  );
};

export default DeliveryDesk;
