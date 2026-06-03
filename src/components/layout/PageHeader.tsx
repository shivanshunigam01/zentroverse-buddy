import { ChevronRight } from "lucide-react";
import type { FlowTabId } from "@/domain/flow-nav";
import {
  MODULE_META,
  FULL_JOURNEY_STEPS,
  getNextMacroStep,
  funnelIndexForTab,
} from "@/domain/flow-nav";

interface Props {
  activeTab: FlowTabId;
  onNavigate: (tab: FlowTabId) => void;
}

const PageHeader = ({ activeTab, onNavigate }: Props) => {
  if (activeTab === "dashboard") return null;
  const meta = MODULE_META[activeTab];
  const next = getNextMacroStep(activeTab);
  const funnelIdx = funnelIndexForTab(activeTab);
  const isParallel = ["scoring", "contact-health", "action", "workflow", "analytics", "notifications"].includes(activeTab);

  return (
    <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {meta.badge && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {meta.badge}
              </span>
            )}
            {meta.macroCode && (
              <span className="font-mono text-[10px] font-bold text-muted-foreground">{meta.macroCode}</span>
            )}
            {funnelIdx != null && !isParallel && (
              <span className="text-[10px] font-semibold text-muted-foreground">
                Funnel step {funnelIdx} of {FULL_JOURNEY_STEPS.length}
              </span>
            )}
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
            {meta.title}
          </h1>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground sm:text-sm">{meta.subtitle}</p>
        </div>
        {next && !isParallel && (
          <button
            type="button"
            onClick={() => onNavigate(next.tabId)}
            className="inline-flex items-center gap-1 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary"
          >
            Next: {next.code} {next.title}
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {!isParallel && (
        <div className="journey-strip-scroll flex items-center gap-1 overflow-x-auto pb-1">
          {FULL_JOURNEY_STEPS.map((step) => {
            const isCurrent = step.tabId === activeTab;
            const idx = funnelIndexForTab(activeTab);
            const isPast = idx != null && step.order < idx;
            return (
              <button
                key={step.code}
                type="button"
                onClick={() => onNavigate(step.tabId)}
                className={`shrink-0 rounded-lg px-2.5 py-2 text-[11px] font-semibold ${
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isPast
                      ? "bg-card text-foreground"
                      : "bg-muted/60 text-muted-foreground"
                }`}
              >
                {step.code}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
