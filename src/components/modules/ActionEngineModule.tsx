import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import { useOpportunityLeads } from "@/store/selectors";
import {
  activateRule,
  fetchActionContext,
  fetchEngineHealth,
  listEngineActions,
  listRules,
  simulateRule,
  acceptAction,
  completeAction,
  reassignAction,
  createRule,
  type ActionContext,
  type EngineAction,
  type EngineRule,
} from "@/api/action-engine.api";
import { AUTOMATION_RULE_SEEDS } from "@/domain/actions/automation-rules";

const ActionEngineModule = () => {
  const leads = useOpportunityLeads();
  const sample = leads[0];
  const [rules, setRules] = useState<EngineRule[]>([]);
  const [tasks, setTasks] = useState<EngineAction[]>([]);
  const [ctx, setCtx] = useState<ActionContext | null>(null);
  const [health, setHealth] = useState<Awaited<ReturnType<typeof fetchEngineHealth>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [draftCode, setDraftCode] = useState("CUSTOM_FOLLOWUP");
  const [draftName, setDraftName] = useState("Custom follow-up");

  const refresh = useCallback(async () => {
    try {
      const [r, t, h] = await Promise.all([
        listRules(),
        listEngineActions(),
        fetchEngineHealth(),
      ]);
      setRules(r);
      setTasks(t);
      setHealth(h);
      if (sample?.opportunityId) {
        setCtx(await fetchActionContext(sample.opportunityId));
      }
    } catch (err) {
      toast.message("Action Engine API offline", {
        description:
          err instanceof Error
            ? `${err.message} — start zentroflow-api on :4000. Showing local seed rules.`
            : "Start zentroflow-api on :4000",
      });
      setRules([]);
      setTasks([]);
    }
  }, [sample?.opportunityId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSimulate = async (id: string) => {
    setBusy(true);
    try {
      const res = await simulateRule(id);
      toast.success("Simulation complete", {
        description: `Matches ${res.matches} / ${res.records_evaluated}`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Simulate failed");
    } finally {
      setBusy(false);
    }
  };

  const onActivate = async (id: string) => {
    setBusy(true);
    try {
      await activateRule(id);
      toast.success("Rule activated");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Activate failed");
    } finally {
      setBusy(false);
    }
  };

  const onCreate = async () => {
    setBusy(true);
    try {
      await createRule({
        rule_code: draftCode,
        name: draftName,
        trigger_event: "lead.created",
        type: "EVENT",
        field_path: "lead.mobile",
        operator: "IS_NOT_NULL",
        expected_value: "true",
        action_type: "CREATE_FOLLOWUP_TASK",
        owner_logic: "SALES_EXECUTIVE",
        sla_minutes: 30,
        priority: "P2",
      });
      toast.success("Draft rule created");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
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

  const displayRules = rules.length > 0 ? rules : AUTOMATION_RULE_SEEDS.map((r) => ({
    id: r.ruleCode,
    rule_code: r.ruleCode,
    name: r.name,
    type: r.ruleType,
    trigger_event: r.triggerEvent,
    priority: r.priority,
    status: r.status,
    current_version: r.version,
    field_path: r.field,
    operator: r.operator,
    expected_value: r.expectedValue,
    action_type: r.actionType,
    owner_logic: r.actionOwnerLogic,
    sla_minutes: r.slaMinutes,
    next_stage: r.nextStage,
  }));

  return (
    <ModuleShell moduleId="action-engine">
      {sample && <LeadCardStrip lead={sample} />}

      <div className="rounded-2xl border border-destructive/25 bg-destructive/[0.05] p-4 sm:p-5">
        <p className="text-sm font-bold text-destructive">Golden rule</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Every open opportunity must have exactly one stage, owner, current action, due time, and next-stage path.
        </p>
        {ctx && (
          <p className="mt-2 font-mono text-[11px] text-foreground">
            {ctx.micro_stage} · {ctx.owner} · {ctx.current_action} · SLA {ctx.sla_status}
            {ctx.blockers.length > 0 ? ` · blockers: ${ctx.blockers.join(", ")}` : " · healthy"}
          </p>
        )}
      </div>

      {health && (
        <Section title="Engine health">
          <p className="text-sm">
            Status: <strong>{health.status}</strong> · open opps {health.open_opportunities} · orphans{" "}
            {health.orphan_leads?.length ?? 0}
          </p>
          {health.orphan_leads?.slice(0, 5).map((o) => (
            <p key={o.opportunity_id} className="mt-1 font-mono text-xs text-warning">
              {o.opportunity_id}: {o.issues.join(", ")}
            </p>
          ))}
          <Btn variant="outline" className="mt-3" onClick={() => void refresh()} disabled={busy}>
            Refresh
          </Btn>
        </Section>
      )}

      <Section title="My tasks">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open actions from Action Engine API.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-2 rounded-xl border border-border/60 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {t.action_type} · {t.priority}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.opportunity_id} · {t.micro_stage} · {t.owner_id} · due{" "}
                    {new Date(t.due_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Btn
                    variant="outline"
                    onClick={() =>
                      void acceptAction(t.id)
                        .then(() => refresh())
                        .then(() => toast.success("Accepted"))
                        .catch((e) => toast.error(String(e.message ?? e)))
                    }
                  >
                    Accept
                  </Btn>
                  <Btn
                    variant="secondary"
                    onClick={() =>
                      void completeAction(t.id, { done: true })
                        .then(() => refresh())
                        .then(() => toast.success("Completed"))
                        .catch((e) => toast.error(String(e.message ?? e)))
                    }
                  >
                    Complete
                  </Btn>
                  <Btn
                    variant="outline"
                    onClick={() =>
                      void reassignAction(t.id, "Sales Manager", "UI reassign")
                        .then(() => refresh())
                        .then(() => toast.success("Reassigned"))
                        .catch((e) => toast.error(String(e.message ?? e)))
                    }
                  >
                    Reassign
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Rule registry">
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <input
            className="input-app px-3 py-2 text-sm"
            value={draftCode}
            onChange={(e) => setDraftCode(e.target.value)}
            placeholder="Rule code"
          />
          <input
            className="input-app px-3 py-2 text-sm"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Rule name"
          />
        </div>
        <ActionBar>
          <Btn onClick={() => void onCreate()} disabled={busy}>
            Create draft
          </Btn>
        </ActionBar>
        <ul className="mt-4 space-y-2">
          {displayRules.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-xl border border-border/60 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {r.rule_code}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    v{r.current_version} · {r.status}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.name} · {r.trigger_event} → {r.action_type} ({r.sla_minutes}m)
                </p>
              </div>
              <div className="flex gap-1.5">
                <Btn variant="outline" disabled={busy || !rules.length} onClick={() => void onSimulate(r.id)}>
                  Simulate
                </Btn>
                <Btn variant="secondary" disabled={busy || !rules.length} onClick={() => void onActivate(r.id)}>
                  Activate
                </Btn>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </ModuleShell>
  );
};

export default ActionEngineModule;
