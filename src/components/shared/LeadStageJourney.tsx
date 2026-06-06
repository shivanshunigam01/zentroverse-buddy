import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Btn, Section } from "@/components/shared/ModuleShell";
import type { Lead } from "@/adapters/lead-view.adapter";
import type { OpportunityMaster, StageStepData } from "@/domain/entities/opportunity";
import {
  ALL_MICRO_STAGES,
  STAGE_SELECT_GROUPS,
  getNextJourneyMicroStage,
  type BusinessMicroStage,
} from "@/domain/stages/business-stages";
import { advanceStageStep, saveStageStep } from "@/api/opportunities.api";
import { getCurrentUserName } from "@/api/auth.api";
import { ApiClientError } from "@/lib/api";
import { getZentroFlowStore } from "@/store/opportunity-store";
import { refreshOpportunity } from "@/services/sync.service";

type Props = {
  lead: Lead;
  opportunity: OpportunityMaster;
};

type StepStatus = "completed" | "current" | "upcoming";

function stepStatus(stageIdx: number, currentIdx: number): StepStatus {
  if (stageIdx < currentIdx) return "completed";
  if (stageIdx === currentIdx) return "current";
  return "upcoming";
}

export function LeadStageJourney({ lead, opportunity }: Props) {
  const currentRef = useRef<HTMLDivElement>(null);
  const [stepData, setStepData] = useState<Record<string, StageStepData>>(
    () => opportunity.stage_step_data ?? {},
  );
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    setStepData(opportunity.stage_step_data ?? {});
    const drafts: Record<string, string> = {};
    for (const stage of ALL_MICRO_STAGES) {
      drafts[stage.code] = opportunity.stage_step_data?.[stage.code]?.notes ?? "";
    }
    setDraftNotes(drafts);
  }, [opportunity.opportunity_id, opportunity.current_micro_stage, opportunity.stage_step_data]);

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

  const handleSaveStep = async (stage: BusinessMicroStage) => {
    setSavingCode(stage.code);
    try {
      const opp = await saveStageStep(lead.opportunityId, {
        micro_stage: stage.code,
        notes: draftNotes[stage.code] ?? "",
        owner: lead.currentOwner,
        changed_by: getCurrentUserName(),
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
    setAdvancing(true);
    try {
      const opp = await advanceStageStep(lead.opportunityId, {
        notes: draftNotes[opportunity.current_micro_stage] ?? "",
        owner: lead.currentOwner,
        changed_by: getCurrentUserName(),
      });
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

  return (
    <Section title="Stage journey — step by step">
      <p className="mb-4 text-sm text-muted-foreground">
        All pipeline stages for this lead. Enter notes for any step, save manually, then use{" "}
        <strong>Complete &amp; next step</strong> to activate the next stage. Automatic rules can
        be added later.
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

      <div className="max-h-[min(70vh,720px)] space-y-6 overflow-y-auto rounded-xl border border-border/60 p-3 sm:p-4">
        {STAGE_SELECT_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="sticky top-0 z-10 mb-2 bg-card/95 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
              {group.label}
            </h3>
            <div className="space-y-2">
              {group.stages.map((stage) => {
                const idx = ALL_MICRO_STAGES.findIndex((s) => s.code === stage.code);
                const status = stepStatus(idx, currentIdx);
                const saved = stepData[stage.code];
                const isCurrent = status === "current";

                return (
                  <div
                    key={stage.code}
                    ref={isCurrent ? currentRef : undefined}
                    className={`rounded-xl border px-3 py-3 transition-colors sm:px-4 ${
                      isCurrent
                        ? "border-primary bg-primary/5 shadow-sm"
                        : status === "completed"
                          ? "border-green-600/25 bg-green-600/5"
                          : "border-border/50 bg-secondary/15 opacity-90"
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
                        <p className="mt-1 text-xs text-muted-foreground">
                          Trigger: {stage.trigger} · Exit: {stage.exitCondition}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Owner: {stage.owner} · SLA: {stage.sla}
                        </p>

                        <label className="mt-3 block text-[10px] font-bold uppercase text-muted-foreground">
                          Step notes / details
                        </label>
                        <textarea
                          className="input-app mt-1 min-h-[72px] w-full px-3 py-2 text-sm"
                          placeholder={
                            isCurrent
                              ? "Enter what was done for this step…"
                              : status === "upcoming"
                                ? "Not reached yet — you can pre-fill notes"
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
              })}
            </div>
          </div>
        ))}
      </div>
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
