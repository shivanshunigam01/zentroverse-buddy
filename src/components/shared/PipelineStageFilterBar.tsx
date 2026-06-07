import { useMemo } from "react";
import {
  C0_MICRO_STAGES,
  C1_MICRO_STAGES,
  C1A_MICRO_STAGES,
  C2_MICRO_STAGES,
  C3_MICRO_STAGES,
  LIFECYCLE_MICRO_STAGES,
  STAGE_SELECT_GROUPS,
  type BusinessMicroStage,
} from "@/domain/stages/business-stages";

/** Filter token — all leads, all in a macro, or one micro stage code */
export const STAGE_FILTER_ALL = "all";

export type StageMacroId = "all" | "C0" | "C1" | "C1A" | "C2" | "C3" | "lifecycle";

export const STAGE_FILTER_MACROS: ReadonlyArray<{
  id: StageMacroId;
  label: string;
  short: string;
  description: string;
  stages: BusinessMicroStage[];
}> = [
  { id: "all", label: "All stages", short: "All", description: "Every lead in the inbox", stages: [] },
  { id: "C0", label: "C0 — Lead Maturity", short: "C0", description: "Capture, verify, qualify, score", stages: C0_MICRO_STAGES },
  { id: "C1", label: "C1 — Sales Discussion", short: "C1", description: "Quote, objection, affordability", stages: C1_MICRO_STAGES },
  { id: "C1A", label: "C1A — Finance Approval", short: "C1A", description: "Application through booking intent", stages: C1A_MICRO_STAGES },
  { id: "C2", label: "C2 — Booking to Billing", short: "C2", description: "Booking, billing, PDI", stages: C2_MICRO_STAGES },
  { id: "C3", label: "C3 — Retail / Delivery", short: "C3", description: "Delivery, feedback, lifecycle handoff", stages: C3_MICRO_STAGES },
  { id: "lifecycle", label: "Lifecycle L1–L7", short: "L", description: "Post-sale revenue programs", stages: LIFECYCLE_MICRO_STAGES },
];

/** @deprecated use STAGE_FILTER_ALL */
export const C0_STAGE_FILTER_ALL = STAGE_FILTER_ALL;

export function macroFilterToken(macro: StageMacroId): string {
  return macro === "all" ? STAGE_FILTER_ALL : `macro:${macro}`;
}

export function isMacroFilter(token: string): boolean {
  return token.startsWith("macro:");
}

export function macroFromFilter(token: string): StageMacroId {
  if (token === STAGE_FILTER_ALL) return "all";
  if (token.startsWith("macro:")) return token.slice(6) as StageMacroId;
  const group = STAGE_SELECT_GROUPS.find((g) => g.stages.some((s) => s.code === token));
  if (!group) return "all";
  if (group.label.startsWith("C0")) return "C0";
  if (group.label.startsWith("C1A")) return "C1A";
  if (group.label.startsWith("C1")) return "C1";
  if (group.label.startsWith("C2")) return "C2";
  if (group.label.startsWith("C3")) return "C3";
  return "lifecycle";
}

export function leadMatchesMacro(lead: { microStageCode: string }, macro: StageMacroId): boolean {
  const code = lead.microStageCode;
  switch (macro) {
    case "all":
      return true;
    case "C0":
      return code.startsWith("C0.");
    case "C1":
      return code.startsWith("C1.") && !code.startsWith("C1A.");
    case "C1A":
      return code.startsWith("C1A.");
    case "C2":
      return code.startsWith("C2.");
    case "C3":
      return code.startsWith("C3.");
    case "lifecycle":
      return /^L[1-7]$/.test(code);
    default:
      return true;
  }
}

export function filterLeadsByStageFilter(leads: { microStageCode: string }[], filter: string) {
  if (filter === STAGE_FILTER_ALL) return leads;
  if (isMacroFilter(filter)) {
    const macro = filter.slice(6) as StageMacroId;
    return leads.filter((l) => leadMatchesMacro(l, macro));
  }
  return leads.filter((l) => l.microStageCode === filter);
}

export function buildStageFilterCounts(leads: { microStageCode: string }[]): Record<string, number> {
  const counts: Record<string, number> = { [STAGE_FILTER_ALL]: leads.length };
  for (const macro of STAGE_FILTER_MACROS) {
    if (macro.id === "all") continue;
    counts[macroFilterToken(macro.id)] = leads.filter((l) => leadMatchesMacro(l, macro.id)).length;
    for (const stage of macro.stages) {
      counts[stage.code] = leads.filter((l) => l.microStageCode === stage.code).length;
    }
  }
  return counts;
}

export function resolveActiveStageMeta(filter: string): BusinessMicroStage | null {
  if (filter === STAGE_FILTER_ALL || isMacroFilter(filter)) return null;
  for (const group of STAGE_SELECT_GROUPS) {
    const found = group.stages.find((s) => s.code === filter);
    if (found) return found;
  }
  return null;
}

type Props = {
  active: string;
  onSelect: (code: string) => void;
  counts?: Record<string, number>;
};

export function PipelineStageFilterBar({ active, onSelect, counts }: Props) {
  const activeMacro = useMemo(() => macroFromFilter(active), [active]);
  const macroDef = STAGE_FILTER_MACROS.find((m) => m.id === activeMacro) ?? STAGE_FILTER_MACROS[0];
  const activeMeta = resolveActiveStageMeta(active);

  const selectMacro = (macro: StageMacroId) => {
    onSelect(macro === "all" ? STAGE_FILTER_ALL : macroFilterToken(macro));
  };

  return (
    <div className="space-y-4">
      {/* Macro tabs — C0, C1, C1A, C2, C3, Lifecycle */}
      <div className="tabs-scroll gap-1.5 rounded-xl bg-secondary/40 p-2">
        {STAGE_FILTER_MACROS.map((macro) => {
          const tabActive =
            macro.id === "all"
              ? active === STAGE_FILTER_ALL
              : activeMacro === macro.id;

          const count =
            macro.id === "all"
              ? counts?.[STAGE_FILTER_ALL]
              : counts?.[macroFilterToken(macro.id)];

          return (
            <button
              key={macro.id}
              type="button"
              title={macro.description}
              onClick={() => selectMacro(macro.id)}
              className={`shrink-0 rounded-lg px-3 py-2 text-left transition-all sm:px-4 ${
                tabActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-foreground hover:bg-card/80"
              }`}
            >
              <span className="block text-xs font-bold leading-tight">{macro.short}</span>
              <span className={`mt-0.5 block text-[10px] leading-tight ${tabActive ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                {macro.id === "all" ? "All" : macro.stages.length} steps
              </span>
              {count !== undefined && (
                <span className={`mt-0.5 block text-[10px] font-bold tabular-nums ${tabActive ? "text-primary-foreground" : "text-primary"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Micro stage chips for selected macro */}
      {macroDef.id !== "all" && macroDef.stages.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card/50 p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{macroDef.label}</p>
              <p className="text-xs text-muted-foreground">{macroDef.description}</p>
            </div>
            <StageChip
              code={macroFilterToken(macroDef.id)}
              label={`All ${macroDef.short}`}
              active={active === macroFilterToken(macroDef.id)}
              count={counts?.[macroFilterToken(macroDef.id)]}
              onSelect={onSelect}
              wide
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {macroDef.stages.map((stage) => (
              <StageChip
                key={stage.code}
                code={stage.code}
                label={
                  macroDef.id === "lifecycle"
                    ? stage.code
                    : stage.code.replace(`${macroDef.id}.`, "")
                }
                sub={stage.title}
                active={active === stage.code}
                count={counts?.[stage.code]}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active filter summary */}
      {(activeMeta || isMacroFilter(active)) && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
          {activeMeta ? (
            <p className="font-medium text-foreground">
              Showing <strong>{activeMeta.code}</strong> · {activeMeta.title}
              {counts?.[activeMeta.code] !== undefined && (
                <span className="text-muted-foreground"> — {counts[activeMeta.code]} lead{counts[activeMeta.code] === 1 ? "" : "s"}</span>
              )}
            </p>
          ) : (
            <p className="font-medium text-foreground">
              Showing all leads in <strong>{macroDef.label}</strong>
              {counts?.[active] !== undefined && (
                <span className="text-muted-foreground"> — {counts[active]} lead{counts[active] === 1 ? "" : "s"}</span>
              )}
            </p>
          )}
        </div>
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
  wide,
}: {
  code: string;
  label: string;
  sub?: string;
  active: boolean;
  count?: number;
  onSelect: (code: string) => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      title={sub ? `${label} — ${sub}` : label}
      onClick={() => onSelect(code)}
      className={`inline-flex min-h-9 shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-1.5 text-center transition-all active:scale-[0.98] ${
        wide ? "sm:min-w-[5.5rem]" : "sm:min-w-[4.25rem]"
      } ${
        active
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "border-border/80 bg-card text-foreground hover:border-primary/30 hover:bg-primary/[0.04]"
      }`}
    >
      <span className="text-xs font-bold leading-tight">{label}</span>
      {sub && (
        <span className="mt-0.5 hidden max-w-[6rem] truncate text-[9px] font-medium leading-tight text-muted-foreground sm:block">
          {sub}
        </span>
      )}
      {count !== undefined && (
        <span className="mt-0.5 text-[9px] font-semibold tabular-nums text-muted-foreground">{count}</span>
      )}
    </button>
  );
}
