import {
  ArrowDown,
  ChevronRight,
  Inbox,
  Bot,
  Brain,
  Phone,
  RefreshCw,
  Repeat,
  Sparkles,
} from "lucide-react";
import { CORE_ENGINES } from "@/domain/platform";
import type { FlowTabId } from "@/domain/flow-nav";
import { JOURNEY_STEPS } from "@/domain/flow-nav";

interface Props {
  onNavigate?: (tab: FlowTabId) => void;
}

const ENGINE_TAB: Record<(typeof CORE_ENGINES)[number]["id"], FlowTabId> = {
  intake: "leads",
  engagement: "engagement",
  classification: "classification",
  action: "action",
  lifecycle: "lifecycle",
};

const engineIcons = [Inbox, Bot, Brain, Phone, RefreshCw] as const;

const MasterFlow = ({ onNavigate }: Props) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1 — Five core engines */}
      <div className="surface-card p-4 sm:p-6 lg:p-8">
        <div className="mb-4 sm:mb-5">
          <h3 className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
            Five core engines
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Tap a system to open its workspace.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-5 lg:gap-3">
          {CORE_ENGINES.map((eng, i) => {
            const Icon = engineIcons[i];
            const tab = ENGINE_TAB[eng.id];
            return (
              <button
                key={eng.id}
                type="button"
                disabled={!onNavigate}
                onClick={() => onNavigate?.(tab)}
                className={`flex min-h-[4.5rem] flex-col items-start rounded-2xl border border-border/70 bg-card/60 p-3.5 text-left transition-all active:scale-[0.98] sm:min-h-0 sm:p-4 ${
                  onNavigate
                    ? "cursor-pointer touch-manipulation hover:border-primary/35 hover:bg-primary/[0.04] hover:shadow-md"
                    : "cursor-default opacity-90"
                }`}
              >
                <div className="mb-2.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mb-3">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <span className="text-[11px] font-bold leading-snug text-foreground sm:text-xs">{eng.name}</span>
                <span className="mt-1 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                  {eng.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 — Master journey (8 steps): vertical phones & tablets; horizontal XL+ desktops */}
      <div className="surface-card p-4 sm:p-6 lg:p-8">
        <div className="mb-4 sm:mb-6">
          <h3 className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
            End-to-end journey
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Eight stages from first touch to ongoing engagement. Tap any step to go there.
          </p>
        </div>

        {/* XL+ wide screens: horizontal flow */}
        <div className="hidden xl:block">
          <div className="flex flex-wrap items-stretch justify-center gap-y-3">
            {JOURNEY_STEPS.map((step, i) => (
              <div key={step.order} className="flex min-w-0 items-center">
                <button
                  type="button"
                  disabled={!onNavigate}
                  onClick={() => onNavigate?.(step.tabId)}
                  title={step.title}
                  className={`flex min-h-[5.5rem] min-w-[100px] max-w-[132px] touch-manipulation flex-col items-center rounded-2xl border px-2 py-3 text-center transition-all active:scale-[0.98] ${
                    onNavigate
                      ? "border-border/80 bg-secondary/30 hover:border-primary/40 hover:bg-primary/[0.06]"
                      : "border-border/60 bg-secondary/20"
                  }`}
                >
                  <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground shadow-sm">
                    {step.order}
                  </span>
                  <span className="text-[10px] font-bold leading-tight text-foreground sm:text-[11px]">{step.short}</span>
                  <span className="mt-1 line-clamp-2 text-[9px] leading-snug text-muted-foreground sm:text-[10px]">
                    {step.hint}
                  </span>
                </button>
                {i < JOURNEY_STEPS.length - 1 && (
                  <ChevronRight className="mx-0.5 h-4 w-4 shrink-0 self-center text-muted-foreground/40 sm:mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Phones & tablets: vertical timeline with large tap targets */}
        <div className="xl:hidden">
          <div className="mx-auto max-w-lg">
            {JOURNEY_STEPS.map((step, i) => (
              <div key={step.order}>
                <button
                  type="button"
                  disabled={!onNavigate}
                  onClick={() => onNavigate?.(step.tabId)}
                  className={`relative z-[1] mb-1 flex w-full min-h-[3.25rem] touch-manipulation items-center gap-3 rounded-2xl border border-border/80 bg-card/80 px-3 py-3.5 text-left shadow-sm transition-all active:scale-[0.99] sm:gap-4 sm:px-4 sm:py-4 ${
                    onNavigate ? "hover:border-primary/40 hover:bg-primary/[0.04]" : ""
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground shadow-sm sm:h-10 sm:w-10">
                    {step.order}
                  </span>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="text-sm font-bold leading-snug text-foreground">{step.title}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{step.hint}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                </button>
                {i < JOURNEY_STEPS.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="h-4 w-4 text-muted-foreground/40" aria-hidden />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="surface-card border-primary/15 bg-gradient-to-br from-primary/[0.05] to-accent/[0.04] p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:h-9 sm:w-9">
              <Repeat size={18} strokeWidth={2.25} />
            </div>
            <h4 className="font-display text-sm font-bold text-foreground sm:text-base">Intelligence loop</h4>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground sm:mb-4 sm:text-sm">
            Leads cycle through classification after each bot, dialer, or sales touch until the outcome is clear.
          </p>
          <div className="rounded-xl border border-border/60 bg-card/80 px-3 py-3 text-center font-mono text-[10px] font-semibold leading-relaxed text-foreground sm:px-4 sm:text-xs sm:leading-relaxed">
            <span className="inline-block max-w-full break-words">
              Lead → Bot → Classify → Action → Classify → Action → …
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
            <span className="rounded-full bg-success/15 px-3 py-1.5 text-[11px] font-bold text-success">Converted</span>
            <span className="rounded-full bg-destructive/12 px-3 py-1.5 text-[11px] font-bold text-destructive">Lost</span>
            <span className="rounded-full bg-warning/15 px-3 py-1.5 text-[11px] font-bold text-warning">Recycled</span>
          </div>
        </div>

        <div className="surface-card p-4 sm:p-6">
          <h4 className="font-display text-sm font-bold text-foreground sm:text-base">Conversion handoff</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            After delivery, the customer record moves into lifecycle: PDI, comms, service, renewals, and ongoing programs.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={!onNavigate}
              onClick={() => onNavigate?.("lifecycle")}
              className="min-h-11 w-full touch-manipulation rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity active:opacity-90 hover:opacity-95 disabled:opacity-60 sm:min-h-10 sm:w-auto sm:py-2.5"
            >
              Open lifecycle
            </button>
            <button
              type="button"
              disabled={!onNavigate}
              onClick={() => onNavigate?.("vehicle")}
              className="min-h-11 w-full touch-manipulation rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors active:bg-secondary hover:bg-secondary sm:min-h-10 sm:w-auto sm:py-2.5"
            >
              Vehicle care
            </button>
          </div>
          <div className="mt-5 border-t border-border/70 pt-4 sm:mt-6 sm:pt-5">
            <div className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-4 w-4 shrink-0 text-accent" />
              <span className="text-sm font-bold">Not ready to buy</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Structured partner paths — still tracked as revenue.
            </p>
            <button
              type="button"
              disabled={!onNavigate}
              onClick={() => onNavigate?.("monetization")}
              className="mt-3 min-h-11 w-full touch-manipulation rounded-xl border border-primary/20 bg-primary/5 py-2.5 text-sm font-semibold text-primary transition-colors active:bg-primary/10 hover:bg-primary/10 disabled:opacity-60 sm:min-h-0 sm:w-auto sm:border-0 sm:bg-transparent sm:py-0 sm:text-left sm:hover:bg-transparent sm:hover:underline"
            >
              Smart monetization →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterFlow;
