import { MACRO_FUNNEL_STEPS } from "@/domain/flow-nav";

const counts = [1248, 412, 186, 98, 67];

const LeadFunnel = () => (
  <div className="surface-card p-4 sm:p-6">
    <h3 className="font-display text-sm font-bold sm:text-base">Macro funnel volume</h3>
    <p className="text-xs text-muted-foreground mb-4">C0 → C1 → C1A → C2 → C3 (not stage 0–9)</p>
    <div className="space-y-3">
      {MACRO_FUNNEL_STEPS.map((step, i) => {
        const pct = Math.round((counts[i] / counts[0]) * 100);
        return (
          <div key={step.code}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold text-foreground">
                <span className="font-mono text-primary mr-1.5">{step.code}</span>
                {step.title}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {counts[i].toLocaleString()} ({pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full gradient-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default LeadFunnel;
