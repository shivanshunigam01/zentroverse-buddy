import type { MicroStage } from "@/domain/platform";

interface Props {
  macroLabel: string;
  purpose: string;
  stages: MicroStage[];
  highlightCode?: string;
}

const MicroStagePanel = ({ macroLabel, purpose, stages, highlightCode }: Props) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-base font-bold text-foreground sm:text-lg">{macroLabel}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{purpose}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Pattern: Input → Validation → Action → Owner → SLA → Exit → Next stage
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/80">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-3">Stage</th>
              <th className="px-3 py-3">Trigger</th>
              <th className="px-3 py-3">System action</th>
              <th className="px-3 py-3">Owner</th>
              <th className="px-3 py-3">SLA</th>
              <th className="px-3 py-3">Exit</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((s) => {
              const active = highlightCode === s.code;
              return (
                <tr
                  key={s.code}
                  className={`border-b border-border/50 transition-colors ${
                    active ? "bg-primary/[0.08]" : "hover:bg-secondary/30"
                  }`}
                >
                  <td className="px-3 py-3 align-top">
                    <span className="font-mono text-xs font-bold text-primary">{s.code}</span>
                    <p className="mt-0.5 font-semibold text-foreground">{s.title}</p>
                  </td>
                  <td className="px-3 py-3 align-top text-xs text-muted-foreground">{s.trigger}</td>
                  <td className="px-3 py-3 align-top text-xs text-foreground">{s.systemAction}</td>
                  <td className="px-3 py-3 align-top text-xs font-medium text-foreground">{s.owner}</td>
                  <td className="px-3 py-3 align-top text-xs text-muted-foreground whitespace-nowrap">{s.sla}</td>
                  <td className="px-3 py-3 align-top text-xs text-success font-medium">{s.exitCondition}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MicroStagePanel;
