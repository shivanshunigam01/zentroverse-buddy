import { Inbox, Bot, Brain, Phone, RefreshCw, CheckCircle } from "lucide-react";
import { CORE_ENGINES } from "@/domain/platform";

const engineIcons = [Inbox, Bot, Brain, Phone, RefreshCw] as const;
const engineStats = [
  "API + 12 dedup merges today",
  "2,341 msgs • templates OK",
  "89 queued • rules v2",
  "156 calls • 34 to classification",
  "43 lifecycle triggers",
] as const;

const engines = CORE_ENGINES.map((e, i) => ({
  fullName: e.name,
  description: e.description,
  icon: engineIcons[i],
  status: i === 2 ? "Processing" : "Active",
  messages: engineStats[i],
  color: i === 2 ? "text-warning" : "text-success",
}));

const EngineStatus = () => {
  return (
    <div className="surface-card p-4 sm:p-6 lg:p-7">
      <h3 className="mb-1 font-display text-sm font-bold tracking-tight text-foreground sm:text-base">Five core engines</h3>
      <p className="text-xs text-muted-foreground mb-5">
        Same five systems as the architecture map — status at a glance
      </p>
      <div className="space-y-3">
        {engines.map((engine, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/40 hover:border-primary/15 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center shadow-sm shrink-0">
              <engine.icon size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground truncate">{engine.fullName}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <CheckCircle size={12} className={engine.color} />
                  <span className={`text-xs font-medium ${engine.color}`}>{engine.status}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{engine.description}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{engine.messages}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineStatus;
