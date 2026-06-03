import type { ReactNode } from "react";
import type { AppModuleId } from "@/domain/app-nav";
import { MODULE_TITLES } from "@/domain/app-nav";
import { ACTION_REGISTRY } from "@/domain/actions/action-registry";
import { canPerformAction } from "@/domain/stages/stage-gates";
import { useOpportunityList } from "@/store/selectors";
import { useZentroFlowStore } from "@/store/opportunity-store";
import { useDashboardActions, type DashboardActions } from "@/context/DashboardContext";

function buttonLabel(children: ReactNode): string {
  if (typeof children === "string") return children.trim();
  if (typeof children === "number") return String(children);
  return "Action completed";
}

type MoveStage = Parameters<DashboardActions["moveToStage"]>[0];

const MOVE_STAGE_RE = /^Move to (C0|C1A|C1|C2|C3|Lifecycle)$/i;

const LABEL_NAV: Partial<Record<string, AppModuleId>> = {
  "Move to Bot": "whatsapp-bot",
  "Move to Dialer": "autodialer",
  "Move to Nurture": "re-engagement",
  "Check WhatsApp": "whatsapp-bot",
  "Send Bot Message": "whatsapp-bot",
  "Send Test Message": "whatsapp-bot",
  "View Reply": "whatsapp-bot",
  "Resend Message": "whatsapp-bot",
  "Transfer to Executive": "action-engine",
  "Assign Executive": "action-engine",
  "Call Now": "autodialer",
  "Schedule Retry": "autodialer",
  "Start Automation": "action-engine",
  "Start Nurture Campaign": "re-engagement",
  "Activate Lifecycle": "lifecycle-crm",
  "Create Service Task": "lifecycle-crm",
  "Upload Excel": "lead-upload",
  "Import Leads": "lead-inbox",
  "Save Lead": "lead-inbox",
};

const ModuleShell = ({ moduleId, children, actions }: { moduleId: AppModuleId; children: ReactNode; actions?: ReactNode }) => {
  const meta = MODULE_TITLES[moduleId];
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-[1.65rem]">
            {meta.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{meta.subtitle}</p>
        </div>
        {actions && <div className="flex w-full flex-col gap-2 xs:flex-row xs:flex-wrap sm:w-auto sm:justify-end">{actions}</div>}
      </div>
      {children}
    </div>
  );
};

export const Btn = ({
  children,
  variant = "primary",
  onClick,
  action,
  navigateTo,
  className = "",
  fullWidth,
  disabled,
  title,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  onClick?: () => void;
  /** Shorthand: toast + optional navigation when onClick omitted */
  action?: string;
  navigateTo?: AppModuleId;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
}) => {
  const { performAction, moveToStage, selectedLeadId } = useDashboardActions();
  const opportunities = useOpportunityList();
  const selectedOpp = useZentroFlowStore((s) =>
    selectedLeadId ? s.opportunities[selectedLeadId] : undefined,
  );
  const opp = selectedOpp ?? opportunities[0];
  const label = action ?? buttonLabel(children);
  const effect = ACTION_REGISTRY[label];
  const gate =
    effect?.microStage && opp ? canPerformAction(opp, label, effect.microStage) : { allowed: true };
  const isDisabled = disabled || !gate.allowed;
  const tooltip = title ?? (!gate.allowed ? gate.reason : undefined);
  const cls = {
    primary: "gradient-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25",
    secondary: "bg-secondary text-foreground hover:bg-secondary/80",
    outline: "border border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/[0.03]",
    danger: "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15",
    ghost: "text-primary hover:bg-primary/10",
  }[variant];

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    const label = action ?? buttonLabel(children);
    const move = MOVE_STAGE_RE.exec(label);
    if (move) {
      const raw = move[1];
      const stage: MoveStage =
        raw.toLowerCase() === "lifecycle" ? "lifecycle" : (raw.toUpperCase() as MoveStage);
      moveToStage(stage);
      return;
    }
    void performAction(label, { navigateTo: navigateTo ?? LABEL_NAV[label] });
  };

  return (
    <button
      type={type}
      onClick={type === "submit" ? undefined : handleClick}
      disabled={isDisabled}
      title={tooltip}
      className={`btn-touch ${fullWidth ? "w-full sm:w-auto" : ""} ${cls} ${isDisabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

/** Button that only works inside DashboardProvider — use in modules */
export const ActionBtn = Btn;

export const StatCard = ({
  label,
  value,
  sub,
  accent,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "primary" | "success" | "warning" | "destructive";
  onClick?: () => void;
}) => {
  const accentBar = {
    primary: "from-primary/60 to-accent/40",
    success: "from-success/60 to-success/20",
    warning: "from-warning/60 to-warning/20",
    destructive: "from-destructive/60 to-destructive/20",
  }[accent ?? "primary"];

  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`surface-card group relative w-full overflow-hidden p-4 text-left transition-shadow sm:p-5 ${
        onClick ? "cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary/20 active:scale-[0.99]" : ""
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBar}`} />
      <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-[1.65rem]">{value}</p>
      <p className="mt-1 text-xs font-medium leading-snug text-muted-foreground">{label}</p>
      {sub && <p className="mt-1.5 text-[11px] font-semibold text-primary">{sub}</p>}
    </Wrapper>
  );
};

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="surface-card p-4 sm:p-6">
    <h3 className="mb-4 font-display text-sm font-bold text-foreground sm:text-base">{title}</h3>
    {children}
  </div>
);

export const FilterChips = ({
  items,
  active,
  onSelect,
}: {
  items: string[];
  active?: string;
  onSelect?: (item: string) => void;
}) => (
  <div className="tabs-scroll -mx-1 px-1">
    {items.map((f) => (
      <button
        key={f}
        type="button"
        onClick={() => onSelect?.(f)}
        className={`chip-filter ${active === f ? "chip-filter-active" : ""}`}
      >
        {f}
      </button>
    ))}
  </div>
);

export const StagePills = ({
  stages,
  activeIndex,
  onSelect,
  getCode,
}: {
  stages: { code: string; title?: string }[];
  activeIndex: number;
  onSelect: (i: number) => void;
  getCode?: (s: { code: string }) => string;
}) => (
  <div className="tabs-scroll gap-1.5 rounded-xl bg-secondary/40 p-2">
    {stages.map((s, i) => (
      <button
        key={s.code}
        type="button"
        onClick={() => onSelect(i)}
        title={s.title}
        className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold transition-all sm:text-xs ${
          activeIndex === i
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-card text-foreground hover:bg-card/80"
        }`}
      >
        {getCode ? getCode(s) : s.code}
      </button>
    ))}
  </div>
);

export const ActionBar = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{children}</div>
);

export const DataTable = ({ children, minWidth = 720 }: { children: ReactNode; minWidth?: number }) => (
  <div className="table-scroll hidden md:block">
    <table className="w-full text-left text-sm" style={{ minWidth }}>
      {children}
    </table>
  </div>
);

export const FormGrid = ({ fields }: { fields: string[] }) => (
  <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-3">
    {fields.map((f) => (
      <div key={f}>
        <label className="text-xs font-semibold text-muted-foreground">{f}</label>
        <input className="input-app mt-1.5 w-full px-3 py-2.5 text-sm" placeholder={f} />
      </div>
    ))}
  </div>
);

export default ModuleShell;
