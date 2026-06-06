import { C0_MICRO_STAGES } from "@/domain/stages/business-stages";

export const C0_STAGE_FILTER_ALL = "all";

type Props = {
  active: string;
  onSelect: (code: string) => void;
  counts?: Record<string, number>;
};

export function C0StageFilterBar({ active, onSelect, counts }: Props) {
  const activeMeta =
    active === C0_STAGE_FILTER_ALL
      ? null
      : C0_MICRO_STAGES.find((s) => s.code === active);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <StageChip
          code={C0_STAGE_FILTER_ALL}
          label="All stages"
          active={active === C0_STAGE_FILTER_ALL}
          count={counts?.[C0_STAGE_FILTER_ALL]}
          onSelect={onSelect}
        />
        {C0_MICRO_STAGES.map((stage) => (
          <StageChip
            key={stage.code}
            code={stage.code}
            label={stage.code}
            sub={stage.title}
            active={active === stage.code}
            count={counts?.[stage.code]}
            onSelect={onSelect}
          />
        ))}
      </div>
      {activeMeta && (
        <p className="text-sm font-medium text-foreground">
          {activeMeta.code} · {activeMeta.title}
        </p>
      )}
    </div>
  );
}

function StageChip({
  code,
  label,
  sub,
  active,
  count,
  onSelect,
}: {
  code: string;
  label: string;
  sub?: string;
  active: boolean;
  count?: number;
  onSelect: (code: string) => void;
}) {
  return (
    <button
      type="button"
      title={sub ? `${label} — ${sub}` : label}
      onClick={() => onSelect(code)}
      className={`inline-flex min-h-9 shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-1.5 text-left transition-all active:scale-[0.98] sm:min-w-[4.25rem] ${
        active
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "border-border/80 bg-card text-foreground hover:border-primary/30 hover:bg-primary/[0.04]"
      }`}
    >
      <span className="text-xs font-bold leading-tight">{label}</span>
      {sub && (
        <span className="mt-0.5 hidden max-w-[5.5rem] truncate text-[9px] font-medium leading-tight text-muted-foreground sm:block">
          {sub}
        </span>
      )}
      {count !== undefined && (
        <span className="mt-0.5 text-[9px] font-semibold tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </button>
  );
}
