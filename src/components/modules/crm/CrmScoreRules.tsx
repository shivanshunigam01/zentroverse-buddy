import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Section } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import {
  fetchCrmScoreRulesAdmin,
  fetchCrmScoreBands,
  createCrmScoreRule,
  updateCrmScoreRule,
  type CrmScoreRule,
} from "@/api/crm.api";
import { ApiClientError } from "@/lib/api";
import type { AppModuleId } from "@/domain/app-nav";

const FIELD_OPTIONS = [
  { value: "", label: "— Event / no field —" },
  { value: "purchase_timeline", label: "Purchase timeline" },
  { value: "verification_status", label: "Verification status" },
  { value: "product", label: "Product" },
  { value: "qualification_status", label: "Qualification status" },
  { value: "temperature", label: "Temperature" },
  { value: "source", label: "Source" },
  { value: "current_stage", label: "Current stage" },
  { value: "customer.mobile", label: "Customer mobile" },
  { value: "customer.email", label: "Customer email" },
];

const OPERATOR_OPTIONS = ["eq", "gte", "lte", "exists", "event"];

const CrmScoreRules = () => {
  const [rules, setRules] = useState<CrmScoreRule[]>([]);
  const [bands, setBands] = useState<Array<{ label: string; min: number; max: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    field: "",
    operator: "eq",
    expected_value: "",
    points: 10,
    priority: 100,
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesData, bandsData] = await Promise.all([
        fetchCrmScoreRulesAdmin(),
        fetchCrmScoreBands(),
      ]);
      setRules(rulesData);
      setBands(bandsData);
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : "Failed to load score rules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = async () => {
    if (!draft.name.trim()) {
      toast.error("Rule name is required");
      return;
    }
    setBusy(true);
    try {
      await createCrmScoreRule({
        name: draft.name.trim(),
        field: draft.field || undefined,
        operator: draft.operator,
        expected_value: draft.expected_value || undefined,
        points: draft.points,
        priority: draft.priority,
        active: true,
      });
      toast.success("Score rule created");
      setDraft({ name: "", field: "", operator: "eq", expected_value: "", points: 10, priority: 100 });
      await refresh();
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (rule: CrmScoreRule) => {
    if (!rule.tenant_id) {
      toast.error("Global default rules cannot be modified");
      return;
    }
    setBusy(true);
    try {
      await updateCrmScoreRule(rule.rule_id, { active: !rule.active });
      toast.success(rule.active ? "Rule disabled" : "Rule enabled");
      await refresh();
    } catch (e) {
      toast.error(e instanceof ApiClientError ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Score bands">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {bands.map((b) => (
            <div key={b.label} className="rounded-lg border border-border/60 px-3 py-2">
              <p className="text-xs font-bold uppercase text-muted-foreground">{b.label}</p>
              <p className="text-sm font-semibold">{b.min} – {b.max}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Create rule">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="input-app"
            placeholder="Rule name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <select
            className="input-app"
            value={draft.field}
            onChange={(e) => setDraft({ ...draft, field: e.target.value })}
            aria-label="Field"
          >
            {FIELD_OPTIONS.map((o) => (
              <option key={o.value || "none"} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            className="input-app"
            value={draft.operator}
            onChange={(e) => setDraft({ ...draft, operator: e.target.value })}
            aria-label="Operator"
          >
            {OPERATOR_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <input
            className="input-app"
            placeholder="Expected value"
            value={draft.expected_value}
            onChange={(e) => setDraft({ ...draft, expected_value: e.target.value })}
          />
          <input
            type="number"
            className="input-app"
            placeholder="Points"
            value={draft.points}
            onChange={(e) => setDraft({ ...draft, points: Number(e.target.value) })}
          />
          <input
            type="number"
            className="input-app"
            placeholder="Priority"
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: Number(e.target.value) })}
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={handleCreate}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          Create rule
        </button>
      </Section>

      <Section title="Active rules">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading rules…</p>
        ) : rules.length === 0 ? (
          <EmptyState title="No score rules" description="Create a rule or wait for defaults to seed on server start." />
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.rule_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {rule.field || "event"} · {rule.operator}
                    {rule.expected_value ? ` = ${rule.expected_value}` : ""} · +{rule.points} pts · priority {rule.priority}
                    {rule.tenant_id ? "" : " · global default"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rule.active ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    {rule.active ? "Active" : "Disabled"}
                  </span>
                  {rule.tenant_id && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleActive(rule)}
                      className="rounded-lg border border-border/80 px-2.5 py-1 text-xs font-semibold hover:bg-secondary/60"
                    >
                      {rule.active ? "Disable" : "Enable"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default CrmScoreRules;
