import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Btn, Section } from "@/components/shared/ModuleShell";
import { StageStepFieldsForm } from "@/components/shared/StageStepFieldsForm";
import type { Lead } from "@/adapters/lead-view.adapter";
import type { CustomerMaster } from "@/domain/entities/customer";
import type { OpportunityMaster, StageStepData } from "@/domain/entities/opportunity";
import {
  ALL_MICRO_STAGES,
  STAGE_SELECT_GROUPS,
  getNextJourneyMicroStage,
  type BusinessMicroStage,
} from "@/domain/stages/business-stages";
import {
  C0_STAGE_CHECKLIST,
  C0_STAGE_PURPOSE,
  computeC0ScoreFromFields,
  getC0StageFields,
  getC0StagePrefill,
  isC0Stage,
} from "@/domain/stages/c0-stage-fields";
import { advanceStageStep, saveStageStep } from "@/api/opportunities.api";
import { getCurrentUserName } from "@/api/auth.api";
import { ApiClientError } from "@/lib/api";
import { getZentroFlowStore } from "@/store/opportunity-store";
import { refreshOpportunity } from "@/services/sync.service";

type Props = {
  lead: Lead;
  opportunity: OpportunityMaster;
  customer?: CustomerMaster;
};

type StepStatus = "completed" | "current" | "upcoming";

function stepStatus(stageIdx: number, currentIdx: number): StepStatus {
  if (stageIdx < 0 || currentIdx < 0) return "upcoming";
  if (stageIdx < currentIdx) return "completed";
  if (stageIdx === currentIdx) return "current";
  return "upcoming";
}

function fieldsToStrings(
  raw: Record<string, string | number | boolean> | undefined,
): Record<string, string> {
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[k] = v === undefined || v === null ? "" : String(v);
  }
  return out;
}

function buildDraftFields(
  stageCode: string,
  saved: StageStepData | undefined,
  lead: Lead,
  opportunity: OpportunityMaster,
): Record<string, string> {
  const prefill = isC0Stage(stageCode) ? getC0StagePrefill(stageCode, lead, opportunity) : {};
  const savedFields = fieldsToStrings(saved?.fields);
  return { ...prefill, ...savedFields };
}

export function LeadStageJourney({ lead, opportunity, customer }: Props) {
  const currentRef = useRef<HTMLDivElement>(null);
  const [stepData, setStepData] = useState<Record<string, StageStepData>>(
    () => opportunity.stage_step_data ?? {},
  );
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [draftFields, setDraftFields] = useState<Record<string, Record<string, string>>>({});
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const initDrafts = useCallback(() => {
    setStepData(opportunity.stage_step_data ?? {});
    const notes: Record<string, string> = {};
    const fields: Record<string, Record<string, string>> = {};
    for (const stage of ALL_MICRO_STAGES) {
      const saved = opportunity.stage_step_data?.[stage.code];
      notes[stage.code] = saved?.notes ?? "";
      fields[stage.code] = buildDraftFields(stage.code, saved, lead, opportunity);
    }
    setDraftNotes(notes);
    setDraftFields(fields);
  }, [lead, opportunity]);

  useEffect(() => {
    initDrafts();
  }, [initDrafts]);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [opportunity.current_micro_stage]);

  const currentIdx = useMemo(
    () => ALL_MICRO_STAGES.findIndex((s) => s.code === opportunity.current_micro_stage),
    [opportunity.current_micro_stage],
  );

  const nextStage = getNextJourneyMicroStage(opportunity.current_micro_stage);
  const nextStageMeta = nextStage
    ? ALL_MICRO_STAGES.find((s) => s.code === nextStage)
    : undefined;

  const persistOpp = async (opp: OpportunityMaster) => {
    getZentroFlowStore().upsertOpportunity(opp);
    await refreshOpportunity(lead.opportunityId).catch(() => undefined);
  };

  const payloadForStage = (stageCode: string) => ({
    notes: draftNotes[stageCode] ?? "",
    fields: draftFields[stageCode] ?? {},
    owner: lead.currentOwner,
    changed_by: getCurrentUserName(),
  });

  const handleSaveStep = async (stage: BusinessMicroStage) => {
    setSavingCode(stage.code);
    try {
      const opp = await saveStageStep(lead.opportunityId, {
        micro_stage: stage.code,
        ...payloadForStage(stage.code),
      });
      await persistOpp(opp);
      toast.success(`${stage.code} saved`);
    } catch (err) {
      toast.error("Save failed", {
        description: err instanceof ApiClientError ? err.message : "Could not save step",
      });
    } finally {
      setSavingCode(null);
    }
  };

  const handleAdvance = async () => {
    if (!nextStage) return;
    const current = opportunity.current_micro_stage;
    setAdvancing(true);
    try {
      const opp = await advanceStageStep(lead.opportunityId, payloadForStage(current));
      await persistOpp(opp);
      toast.success("Stage advanced", {
        description: nextStageMeta
          ? `Now at ${nextStageMeta.code} ${nextStageMeta.title}`
          : `Now at ${nextStage}`,
      });
    } catch (err) {
      toast.error("Cannot advance", {
        description: err instanceof ApiClientError ? err.message : "Complete current step first",
      });
    } finally {
      setAdvancing(false);
    }
  };

  const updateField = (stageCode: string, key: string, value: string) => {
    setDraftFields((prev) => {
      const next = { ...(prev[stageCode] ?? {}), [key]: value };
      if (stageCode === "C0.8") {
        const { score, output } = computeC0ScoreFromFields(next);
        next.calculated_score = String(score);
        next.score_output = output;
      }
      return { ...prev, [stageCode]: next };
    });
  };

  const c0Group = STAGE_SELECT_GROUPS.find((g) => g.label.startsWith("C0"));
  const pipelineGroups = STAGE_SELECT_GROUPS.filter((g) => !g.label.startsWith("C0"));

  const renderStageCard = (stage: BusinessMicroStage) => {
    const idx = ALL_MICRO_STAGES.findIndex((s) => s.code === stage.code);
    const status = stepStatus(idx, currentIdx);
    const saved = stepData[stage.code];
    const isCurrent = status === "current";
    const isC0 = isC0Stage(stage.code);
    const fieldDefs = isC0 ? getC0StageFields(stage.code) : [];
    const checklist = isC0 ? C0_STAGE_CHECKLIST[stage.code] : undefined;

    return (
      <div
        key={stage.code}
        ref={isCurrent ? currentRef : undefined}
        className={`rounded-xl border px-3 py-3 transition-colors sm:px-4 ${
          isCurrent
            ? "border-primary bg-primary/5 shadow-sm"
            : status === "completed"
              ? "border-green-600/25 bg-green-600/5"
              : "border-border/50 bg-secondary/15"
        }`}
      >
        <div className="flex items-start gap-3">
          <StepIcon status={status} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary">{stage.code}</span>
              <span className="font-semibold text-foreground">{stage.title}</span>
              {isCurrent && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                  Active
                </span>
              )}
              {status === "completed" && saved?.completed_at && (
                <span className="text-[10px] text-muted-foreground">
                  Completed {new Date(saved.completed_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{stage.systemAction}</p>
            {checklist && checklist.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {checklist.map((item) => (
                  <li
                    key={item}
                    className="rounded-md bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Owner: {stage.owner} · SLA: {stage.sla} · Exit: {stage.exitCondition}
            </p>

            {isC0 && fieldDefs.length > 0 && (
              <StageStepFieldsForm
                fields={fieldDefs}
                values={draftFields[stage.code] ?? {}}
                onChange={(key, value) => updateField(stage.code, key, value)}
              />
            )}

            <label className="mt-3 block text-[10px] font-bold uppercase text-muted-foreground">
              {isC0 ? "Additional notes" : "Step notes / details"}
            </label>
            <textarea
              className="input-app mt-1 min-h-[56px] w-full px-3 py-2 text-sm"
              placeholder={
                isCurrent
                  ? "Any extra context for this step…"
                  : status === "upcoming"
                    ? "Not reached yet — optional pre-fill"
                    : "Notes for this completed step…"
              }
              value={draftNotes[stage.code] ?? ""}
              onChange={(e) =>
                setDraftNotes((prev) => ({ ...prev, [stage.code]: e.target.value }))
              }
            />

            <div className="mt-2 flex flex-wrap gap-2">
              <Btn
                variant="outline"
                disabled={savingCode === stage.code}
                onClick={() => void handleSaveStep(stage)}
              >
                {savingCode === stage.code ? "Saving…" : "Save step"}
              </Btn>
              {isCurrent && nextStage && (
                <Btn disabled={advancing} onClick={() => void handleAdvance()}>
                  Complete &amp; go to {nextStage}
                </Btn>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Section title="C0 — Lead Maturity · Stage journey">
      <p className="mb-1 text-sm font-medium text-foreground">{C0_STAGE_PURPOSE}</p>
      <p className="mb-4 text-sm text-muted-foreground">
        Fill each step below manually. Dropdowns mark status where required. Use{" "}
        <strong>Save step</strong> to store data, then <strong>Complete &amp; next step</strong> to
        activate the next stage. Automation can update these fields later.
      </p>

      {currentIdx >= 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span>
            Current:{" "}
            <strong>
              {opportunity.current_micro_stage} —{" "}
              {ALL_MICRO_STAGES[currentIdx]?.title ?? "—"}
            </strong>
          </span>
          {nextStageMeta && (
            <span className="text-muted-foreground">
              Next: {nextStageMeta.code} {nextStageMeta.title}
            </span>
          )}
          <Btn
            className="ml-auto"
            disabled={!nextStage || advancing}
            onClick={() => void handleAdvance()}
          >
            {advancing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Advancing…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Complete &amp; next step
                <ChevronRight className="h-4 w-4" aria-hidden />
              </span>
            )}
          </Btn>
        </div>
      )}

      <div className="max-h-[min(75vh,800px)] space-y-4 overflow-y-auto rounded-xl border border-border/60 p-3 sm:p-4">
        {c0Group && (
          <div>
            <h3 className="sticky top-0 z-10 mb-2 bg-card/95 py-1 text-xs font-bold uppercase tracking-wide text-primary backdrop-blur-sm">
              {c0Group.label}
            </h3>
            <div className="space-y-2">{c0Group.stages.map(renderStageCard)}</div>
          </div>
        )}

        {pipelineGroups.length > 0 && (
          <details className="rounded-xl border border-border/50 bg-secondary/10 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">
              Pipeline stages (C1 → Lifecycle) — notes only for now
            </summary>
            <p className="mt-2 text-xs text-muted-foreground">
              Structured fields for C1+ will be added later. Use notes or advance from C0.10 into C1.
            </p>
            <div className="mt-4 space-y-6">
              {pipelineGroups.map((group) => (
                <div key={group.label}>
                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </h4>
                  <div className="space-y-2">{group.stages.map(renderStageCard)}</div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {customer && (
        <p className="mt-3 text-xs text-muted-foreground">
          Customer: {customer.name} · {customer.mobile}
          {customer.email ? ` · ${customer.email}` : ""}
        </p>
      )}
    </Section>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600/15 text-green-700 dark:text-green-400">
        <Check className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Circle className="h-3 w-3 fill-current" aria-hidden />
      </span>
    );
  }
  return (
    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
      <Circle className="h-3 w-3" aria-hidden />
    </span>
  );
}
