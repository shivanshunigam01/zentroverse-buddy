import type { LucideIcon } from "lucide-react";
import { Eye, ArrowRightLeft, Phone, PhoneForwarded, MessageCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type LeadRowActionsProps = {
  onView: () => void;
  onMove: () => void;
  onCall: () => void;
  onIvrCall: () => void;
  onWhatsApp: () => void;
  callLoading?: boolean;
  ivrLoading?: boolean;
  /** Wider labeled buttons for mobile */
  variant?: "icons" | "labeled";
};

const ACTIONS: {
  key: string;
  label: string;
  Icon: LucideIcon;
  onClickKey: keyof Pick<LeadRowActionsProps, "onView" | "onMove" | "onCall" | "onIvrCall" | "onWhatsApp">;
  className: string;
}[] = [
  { key: "view", label: "View lead", Icon: Eye, onClickKey: "onView", className: "hover:bg-primary/15 hover:text-primary" },
  { key: "move", label: "Move stage", Icon: ArrowRightLeft, onClickKey: "onMove", className: "hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400" },
  { key: "call", label: "Call", Icon: Phone, onClickKey: "onCall", className: "hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-400" },
  { key: "ivr", label: "IVR call", Icon: PhoneForwarded, onClickKey: "onIvrCall", className: "hover:bg-violet-500/15 hover:text-violet-700 dark:hover:text-violet-400" },
  { key: "wa", label: "WhatsApp", Icon: MessageCircle, onClickKey: "onWhatsApp", className: "hover:bg-green-600/15 hover:text-green-700 dark:hover:text-green-400" },
];

export function LeadRowActions({
  onView,
  onMove,
  onCall,
  onIvrCall,
  onWhatsApp,
  callLoading,
  ivrLoading,
  variant = "icons",
}: LeadRowActionsProps) {
  const handlers = { onView, onMove, onCall, onIvrCall, onWhatsApp };

  const isDisabled = (key: string) =>
    (key === "call" && callLoading) || (key === "ivr" && ivrLoading);

  const isLoading = (key: string) =>
    (key === "call" && callLoading) || (key === "ivr" && ivrLoading);

  if (variant === "labeled") {
    return (
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(({ key, label, Icon, onClickKey, className }) => (
          <button
            key={key}
            type="button"
            disabled={isDisabled(key)}
            onClick={handlers[onClickKey]}
            className={cn(
              "inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border/70 bg-card px-3 text-xs font-semibold text-foreground shadow-sm transition-colors sm:flex-none sm:min-w-[5.5rem]",
              className,
              isLoading(key) && "opacity-60",
            )}
          >
            {isLoading(key) ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {key === "wa"
              ? "WhatsApp"
              : key === "ivr"
                ? ivrLoading
                  ? "IVR…"
                  : "IVR"
                : key === "call" && callLoading
                  ? "Calling…"
                  : label.replace(" lead", "").replace(" stage", "")}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-0.5 shadow-sm"
      role="group"
      aria-label="Lead actions"
    >
      {ACTIONS.map(({ key, label, Icon, onClickKey, className }) => (
        <Tooltip key={key} delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={isDisabled(key)}
              onClick={handlers[onClickKey]}
              aria-label={label}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                className,
                isLoading(key) && "opacity-60",
              )}
            >
              {isLoading(key) ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} aria-hidden />
              ) : (
                <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs font-medium">
            {key === "ivr" ? "Smartflo IVR call" : label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
