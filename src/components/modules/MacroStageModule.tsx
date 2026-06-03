import { MACRO_STAGES, getMicroStagesForMacro, type MacroStageId } from "@/domain/platform";
import LeadBackboneCard from "@/components/shared/LeadBackboneCard";
import MicroStagePanel from "@/components/shared/MicroStagePanel";

interface Props {
  macroId: MacroStageId;
  /** Example micro stage to highlight in table */
  activeMicro?: string;
}

const MacroStageModule = ({ macroId, activeMicro }: Props) => {
  const macro = MACRO_STAGES.find((m) => m.id === macroId)!;
  const stages = getMicroStagesForMacro(macroId);

  return (
    <div className="space-y-6">
      <LeadBackboneCard compact />
      <MicroStagePanel
        macroLabel={`${macro.code} — ${macro.name}`}
        purpose={macro.purpose}
        stages={stages}
        highlightCode={activeMicro}
      />
      <div className="surface-card p-4 sm:p-5">
        <h4 className="text-sm font-bold text-foreground">Developer note</h4>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Wire each micro stage to <span className="font-mono text-foreground">lead_stage_history</span> and events.
          Scoring runs in parallel at C0.8 — not as a separate funnel step. Backend: enforce exit conditions before stage advance.
        </p>
      </div>
    </div>
  );
};

export default MacroStageModule;
