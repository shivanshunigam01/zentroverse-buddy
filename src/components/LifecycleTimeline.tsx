import { LIFECYCLE_TIMELINE } from "@/domain/platform";

const LifecycleTimeline = () => (
  <div className="surface-card p-4 sm:p-6">
    <h3 className="font-display text-sm font-bold sm:text-base">After C3 — lifecycle</h3>
    <p className="text-xs text-muted-foreground mb-4">10-year revenue engine</p>
    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
      {LIFECYCLE_TIMELINE.map((row, i) => (
        <div key={row.day} className="flex gap-3 relative">
          {i < LIFECYCLE_TIMELINE.length - 1 && (
            <span className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
          )}
          <span className="relative z-10 mt-1 h-[22px] w-[22px] shrink-0 rounded-full bg-primary/15 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
          <div className="pb-3 min-w-0">
            <p className="text-[10px] font-bold text-primary">{row.day}</p>
            <p className="text-sm font-medium text-foreground">{row.action}</p>
            <p className="text-[11px] text-muted-foreground">{row.owner}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LifecycleTimeline;
