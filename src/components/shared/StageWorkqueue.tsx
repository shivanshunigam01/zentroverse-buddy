import type { Lead } from "@/adapters/lead-view.adapter";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import { Section } from "@/components/shared/ModuleShell";

type Props = {
  title: string;
  stagePrefix: string;
  leads: Lead[];
  onSelect: (opportunityId: string) => void;
  emptyHint?: string;
};

/** Filter opportunities into a micro-stage workqueue for desk modules. */
export function StageWorkqueue({ title, stagePrefix, leads, onSelect, emptyHint }: Props) {
  const rows = leads.filter((l) => {
    const code = l.microStageCode;
    if (stagePrefix === "C1") return /^C1(\.|$)/.test(code) && !code.startsWith("C1A");
    if (stagePrefix === "C1A") return code.startsWith("C1A");
    return code.startsWith(stagePrefix) || l.currentStage === stagePrefix;
  });

  return (
    <Section title={title}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {emptyHint ?? `No leads currently in ${stagePrefix}* stages.`}
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((l) => (
            <LeadCardStrip key={l.opportunityId} lead={l} onClick={() => onSelect(l.opportunityId)} />
          ))}
        </div>
      )}
    </Section>
  );
}
