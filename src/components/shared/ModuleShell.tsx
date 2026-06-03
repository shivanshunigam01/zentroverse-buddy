import type { ReactNode } from "react";
import type { AppModuleId } from "@/domain/app-nav";
import { MODULE_TITLES } from "@/domain/app-nav";

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
  className = "",
  fullWidth,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}) => {
  const cls = {
    primary: "gradient-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25",
    secondary: "bg-secondary text-foreground hover:bg-secondary/80",
    outline: "border border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/[0.03]",
    danger: "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15",
    ghost: "text-primary hover:bg-primary/10",
  }[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-touch ${fullWidth ? "w-full sm:w-auto" : ""} ${cls} ${className}`}
    >
      {children}
    </button>
  );
};

export const StatCard = ({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "primary" | "success" | "warning" | "destructive";
}) => {
  const accentBar = {
    primary: "from-primary/60 to-accent/40",
    success: "from-success/60 to-success/20",
    warning: "from-warning/60 to-warning/20",
    destructive: "from-destructive/60 to-destructive/20",
  }[accent ?? "primary"];

  return (
    <div className="surface-card group relative overflow-hidden p-4 transition-shadow hover:shadow-lg sm:p-5">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBar}`} />
      <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-[1.65rem]">{value}</p>
      <p className="mt-1 text-xs font-medium leading-snug text-muted-foreground">{label}</p>
      {sub && <p className="mt-1.5 text-[11px] font-semibold text-primary">{sub}</p>}
    </div>
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
