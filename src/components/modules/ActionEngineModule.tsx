import { useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import { useOpportunityLeads } from "@/store/selectors";
import { useOpportunityActions } from "@/hooks/use-opportunity-actions";
import * as enginesApi from "@/api/engines.api";
import { getZentroFlowStore } from "@/store/opportunity-store";
import { ApiClientError } from "@/lib/api";

const ActionEngineModule = () => {
  const leads = useOpportunityLeads();
  const sample = leads[0];
  const { run } = useOpportunityActions(sample?.opportunityId);
  const [busy, setBusy] = useState(false);

  const runEngine = async () => {
    if (!sample) return;
    setBusy(true);
    try {
      const updated = await enginesApi.runActionEngine(sample.opportunityId);
      getZentroFlowStore().upsertOpportunity(updated);
      toast.success("Action engine ran", { description: "POST /engines/action/run" });
    } catch (err) {
      toast.error("Engine failed", {
        description: err instanceof ApiClientError ? err.message : "API error",
      });
    } finally {
      setBusy(false);
    }
  };

  if (leads.length === 0) {
    return (
      <ModuleShell moduleId="action-engine">
        <EmptyState
          title="No opportunities yet"
          description="Import leads from Excel first. The action engine assigns one owner, one stage, and one current action per opportunity."
        />
      </ModuleShell>
    );
  }

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
        <ActionBar>
          <Btn onClick={() => run("Create Rule")} disabled={busy}>Create Rule</Btn>
          <Btn variant="outline" onClick={() => run("Edit Rule")}>Edit Rule</Btn>
          <Btn variant="secondary" onClick={runEngine} disabled={busy}>
            {busy ? "Running…" : "Run Engine (API)"}
          </Btn>
          <Btn variant="secondary" onClick={() => run("Activate")}>Activate</Btn>
          <Btn variant="danger" onClick={() => run("Deactivate")}>Deactivate</Btn>
        </ActionBar>
      </Section>
    </ModuleShell>
  );
};

export default ActionEngineModule;
