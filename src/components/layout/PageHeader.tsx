import { ChevronRight } from "lucide-react";
import type { FlowTabId } from "@/domain/flow-nav";
import {
  MODULE_META,
  JOURNEY_STEPS,
  getNextJourneyStep,
  journeyMinOrderForTab,
  journeyMaxOrderForTab,
} from "@/domain/flow-nav";

interface Props {
  activeTab: FlowTabId;
  onNavigate: (tab: FlowTabId) => void;
}

const JOURNEY_LEN = JOURNEY_STEPS.length;

const PageHeader = ({ activeTab, onNavigate }: Props) => {
  if (activeTab === "dashboard") return null;
  const meta = MODULE_META[activeTab];
  const nextJourney = getNextJourneyStep(activeTab);
  const jMin = journeyMinOrderForTab(activeTab);
  const jMax = journeyMaxOrderForTab(activeTab);

  const stepLabel =
    jMin != null && jMax != null && jMin !== jMax
      ? `Steps ${jMin}–${jMax} of ${JOURNEY_LEN}`
      : meta.pipelineStep != null
        ? `Step ${meta.pipelineStep} of ${JOURNEY_LEN}`
        : null;

  return (
    <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {meta.badge && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {meta.badge}
              </span>
            )}
            {stepLabel && (
              <span className="text-[10px] font-semibold text-muted-foreground">{stepLabel}</span>
            )}
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
            {meta.title}
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">{meta.subtitle}</p>
        </div>
        {nextJourney && (
          <button
            type="button"
            onClick={() => onNavigate(nextJourney.tabId)}
            className="group inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-1 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors active:bg-primary/10 hover:bg-primary/10 sm:min-h-0 sm:w-auto sm:justify-start sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:hover:bg-transparent"
          >
            Next: {nextJourney.short}
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5 sm:size-4" />
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border/60 bg-secondary/20 p-1 sm:bg-transparent sm:p-0 sm:border-0">
        <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:hidden">
          Journey ({JOURNEY_LEN} steps) — swipe
        </p>
        <div className="journey-strip-scroll flex items-center gap-1 overflow-x-auto px-1 pb-1 pt-0.5 sm:gap-0.5 sm:px-0 sm:pb-0 sm:pt-0">
          {JOURNEY_STEPS.map((step, i) => {
            const isCurrent = step.tabId === activeTab;
            const minO = journeyMinOrderForTab(activeTab);
            const isPast = minO != null && step.order < minO;
            const isFuture = !isPast && !isCurrent;
            return (
              <div key={step.order} className="flex shrink-0 snap-start items-center gap-1 sm:gap-0.5">
                {i > 0 && <ChevronRight size={12} className="hidden shrink-0 text-border sm:block" />}
                <button
                  type="button"
                  title={step.title}
                  onClick={() => onNavigate(step.tabId)}
                  className={`min-h-10 min-w-[2.75rem] touch-manipulation snap-start rounded-lg px-2.5 py-2 text-[11px] font-semibold transition-all active:scale-95 sm:min-h-9 sm:min-w-0 sm:px-2 sm:py-1 ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background sm:ring-0 sm:ring-offset-0"
                      : isPast
                        ? "bg-card text-foreground shadow-sm hover:bg-secondary"
                        : isFuture
                          ? "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                          : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {step.short}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
