import {
  ArrowDown,
  ChevronRight,
  Layers,
  Gauge,
  HeartPulse,
  Zap,
  RefreshCw,
} from "lucide-react";
import { MACRO_STAGES, PARALLEL_ENGINES, POSITIONING } from "@/domain/platform";
import type { FlowTabId } from "@/domain/flow-nav";
import { FULL_JOURNEY_STEPS, MACRO_FUNNEL_STEPS } from "@/domain/flow-nav";

interface Props {
  onNavigate?: (tab: FlowTabId) => void;
}

const MasterFlow = ({ onNavigate }: Props) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="surface-card border-primary/15 bg-gradient-to-br from-primary/[0.04] to-accent/[0.03] p-4 sm:p-6">
        <h3 className="font-display text-base font-bold text-foreground sm:text-lg">{POSITIONING.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{POSITIONING.tagline}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{POSITIONING.description}</p>
      </div>

      {/* Macro funnel C0 → C3 */}
      <div className="surface-card p-4 sm:p-6 lg:p-8">
        <div className="mb-4 sm:mb-6">
          <h3 className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
            Automotive sales funnel (C0 → C3)
          </h3>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Five macro stages only — not C0–C9. Scoring runs parallel, not as a stage.
          </p>
        </div>

        <div className="hidden xl:flex flex-wrap items-stretch justify-center gap-y-3">
          {MACRO_FUNNEL_STEPS.map((step, i) => (
            <div key={step.code} className="flex items-center">
              <button
                type="button"
                disabled={!onNavigate}
                onClick={() => onNavigate?.(step.tabId)}
                className={`flex min-h-[5.5rem] min-w-[100px] max-w-[140px] flex-col items-center rounded-2xl border px-2 py-3 text-center transition-all ${
                  onNavigate
                    ? "border-border/80 bg-secondary/30 hover:border-primary/40 hover:bg-primary/[0.06]"
                    : "border-border/60 bg-secondary/20"
                }`}
              >
                <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
                  {step.code}
                </span>
                <span className="text-[10px] font-bold text-foreground">{step.short}</span>
                <span className="mt-1 line-clamp-2 text-[9px] text-muted-foreground">{step.hint}</span>
              </button>
              {i < MACRO_FUNNEL_STEPS.length - 1 && (
                <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground/40" />
              )}
            </div>
          ))}
          <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground/40" />
          <button
            type="button"
            disabled={!onNavigate}
            onClick={() => onNavigate?.("lifecycle")}
            className="flex min-h-[5.5rem] min-w-[100px] max-w-[140px] flex-col items-center rounded-2xl border border-accent/30 bg-accent/[0.06] px-2 py-3"
          >
            <RefreshCw className="mb-2 h-6 w-6 text-accent" />
            <span className="text-[10px] font-bold text-foreground">After C3</span>
            <span className="mt-1 text-[9px] text-muted-foreground">Lifecycle revenue</span>
          </button>
        </div>

        <div className="xl:hidden mx-auto max-w-lg space-y-1">
          {FULL_JOURNEY_STEPS.map((step, i) => (
            <div key={step.code}>
              <button
                type="button"
                disabled={!onNavigate}
                onClick={() => onNavigate?.(step.tabId)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/80 bg-card/80 px-4 py-3.5 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
                  {step.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.hint}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              {i < FULL_JOURNEY_STEPS.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Parallel engines */}
      <div className="surface-card p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Layers size={18} className="text-primary" />
          <h3 className="font-display text-base font-bold">Parallel engines (support the funnel)</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PARALLEL_ENGINES.slice(0, 3).map((eng) => (
            <button
              key={eng.id}
              type="button"
              disabled={!onNavigate}
              onClick={() => onNavigate?.(eng.tabId)}
              className="rounded-2xl border border-border/70 bg-card/60 p-4 text-left hover:border-primary/35 disabled:opacity-80"
            >
              <p className="text-xs font-bold text-foreground">{eng.name}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{eng.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <button
          type="button"
          disabled={!onNavigate}
          onClick={() => onNavigate?.("scoring")}
          className="surface-card flex items-start gap-3 p-4 text-left hover:border-primary/30"
        >
          <Gauge className="shrink-0 text-primary" />
          <div>
            <p className="text-sm font-bold">Scoring (parallel)</p>
            <p className="text-xs text-muted-foreground">Cold · Warm · Hot · Critical on every activity</p>
          </div>
        </button>
        <button
          type="button"
          disabled={!onNavigate}
          onClick={() => onNavigate?.("contact-health")}
          className="surface-card flex items-start gap-3 p-4 text-left"
        >
          <HeartPulse className="shrink-0 text-success" />
          <div>
            <p className="text-sm font-bold">Contact health</p>
            <p className="text-xs text-muted-foreground">C0.3 — identity & reachability</p>
          </div>
        </button>
        <button
          type="button"
          disabled={!onNavigate}
          onClick={() => onNavigate?.("action")}
          className="surface-card flex items-start gap-3 p-4 text-left"
        >
          <Zap className="shrink-0 text-warning" />
          <div>
            <p className="text-sm font-bold">Action engine</p>
            <p className="text-xs text-muted-foreground">One owner · one action · SLA always set</p>
          </div>
        </button>
      </div>

      <div className="surface-card p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">Macro stages in product:</strong>{" "}
        {MACRO_STAGES.map((m) => m.code).join(" → ")} → Lifecycle
      </div>
    </div>
  );
};

export default MasterFlow;
