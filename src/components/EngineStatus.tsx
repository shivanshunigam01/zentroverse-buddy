import { Gauge, HeartPulse, Zap, GitBranch, CheckCircle } from "lucide-react";
import { PARALLEL_ENGINES } from "@/domain/platform";

const icons = [Gauge, HeartPulse, Zap, GitBranch, GitBranch] as const;
const stats = [
  "1,248 scored today · 18% Hot",
  "WA 78% active · 12 dup merges",
  "89 open actions · 1 error",
  "4 SLA breaches · 2 escalations",
  "6 nurture re-engagements queued",
] as const;

const EngineStatus = () => (
  <div className="surface-card p-4 sm:p-6 lg:p-7">
    <h3 className="mb-1 font-display text-sm font-bold sm:text-base">Parallel engines</h3>
    <p className="mb-5 text-xs text-muted-foreground">Support C0→C3 — do not replace the funnel</p>
    <div className="space-y-3">
      {PARALLEL_ENGINES.map((eng, i) => {
        const Icon = icons[i] ?? Zap;
        const status = i === 2 ? "1 system error" : "Active";
        const color = i === 2 ? "text-warning" : "text-success";
        return (
          <div
            key={eng.id}
            className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/30 p-2.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card border border-border/50">
              <Icon size={18} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{eng.name}</p>
                <CheckCircle size={12} className={color} />
                <span className={`text-xs font-medium ${color}`}>{status}</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{eng.description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stats[i]}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default EngineStatus;
