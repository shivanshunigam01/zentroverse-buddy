import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import { useOpportunityLeads } from "@/store/selectors";

const ActionEngineModule = () => {
  const leads = useOpportunityLeads();
  const sample = leads[0];

  return (
  <ModuleShell moduleId="action-engine">
    {sample && <LeadCardStrip lead={sample} />}

    <div className="rounded-2xl border border-destructive/25 bg-destructive/[0.05] p-4 sm:p-5">
      <p className="text-sm font-bold text-destructive">Golden rule</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        If a lead has no next action, it is a system error. One owner · one stage · one current action.
      </p>
    </div>

    <Section title="Rule builder">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {["IF Stage =", "IF Micro Stage =", "IF Lead Score =", "IF No Action For =", "THEN Action =", "Assign Owner =", "SLA =", "Escalation ="].map((f) => (
          <div key={f}>
            <label className="text-xs font-semibold text-muted-foreground">{f}</label>
            <input className="input-app mt-1.5 w-full px-3 py-2.5 text-sm" />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-bold">Example</p>
        <p className="mt-1 text-muted-foreground">
          IF C1.1 AND quote not acknowledged in 24h → follow-up · Owner = Sales Executive · Escalation = Sales Manager
        </p>
      </div>
      <ActionBar>
        <Btn>Create Rule</Btn>
        <Btn variant="outline">Edit Rule</Btn>
        <Btn variant="secondary">Activate</Btn>
        <Btn variant="danger">Deactivate</Btn>
      </ActionBar>
    </Section>
  </ModuleShell>
  );
};

export default ActionEngineModule;
