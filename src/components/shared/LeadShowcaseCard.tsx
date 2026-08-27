import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Clock,
  Loader2,
  MessageCircle,
  Phone,
  PhoneForwarded,
  Radio,
  Eye,
} from "lucide-react";
import type { Lead } from "@/adapters/lead-view.adapter";
import { cn } from "@/lib/utils";

const scoreTone: Record<Lead["scoreLabel"], string> = {
  Hot: "bg-destructive/12 text-destructive ring-destructive/20",
  Warm: "bg-warning/12 text-warning ring-warning/20",
  Cold: "bg-info/12 text-info ring-info/20",
  Critical: "bg-accent/12 text-accent ring-accent/20",
};

const accentByScore: Record<Lead["scoreLabel"], string> = {
  Hot: "from-destructive/80 to-destructive/30",
  Warm: "from-warning/80 to-warning/30",
  Cold: "from-info/70 to-info/25",
  Critical: "from-accent/80 to-accent/30",
};

type ActionHandlers = {
  onView: () => void;
  onMove: () => void;
  onCall: () => void;
  onIvrCall: () => void;
  onWhatsApp: () => void;
  onDialerSync?: () => void;
  onToggleSelect?: () => void;
  callLoading?: boolean;
  ivrLoading?: boolean;
  dialerLoading?: boolean;
};

type Props = {
  lead: Lead;
  selected?: boolean;
} & ActionHandlers;

function syncBadge(status: Lead["smartfloSyncStatus"]): { label: string; className: string } | null {
  if (!status) return null;
  const map: Record<string, { label: string; className: string }> = {
    SYNCED: { label: "Synced", className: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300" },
    SYNCING: { label: "Syncing…", className: "bg-sky-500/12 text-sky-700 ring-sky-500/25 dark:text-sky-300" },
    FAILED: { label: "Sync failed", className: "bg-destructive/12 text-destructive ring-destructive/25" },
    PENDING: { label: "Pending sync", className: "bg-secondary text-muted-foreground ring-border" },
    SKIPPED: { label: "Skipped", className: "bg-secondary text-muted-foreground ring-border" },
  };
  return map[status] ?? null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function ActionChip({
  label,
  icon: Icon,
  onClick,
  loading,
  tone = "neutral",
}: {
  label: string;
  icon: typeof Eye;
  onClick: () => void;
  loading?: boolean;
  tone?: "neutral" | "primary" | "success" | "violet" | "wa";
}) {
  const tones = {
    neutral: "border-border/70 bg-background hover:bg-secondary/80 text-foreground",
    primary: "border-primary/25 bg-primary/8 hover:bg-primary/15 text-primary",
    success: "border-emerald-500/25 bg-emerald-500/8 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    violet: "border-violet-500/25 bg-violet-500/8 hover:bg-violet-500/15 text-violet-700 dark:text-violet-300",
    wa: "border-green-600/25 bg-green-600/8 hover:bg-green-600/15 text-green-700 dark:text-green-400",
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors disabled:opacity-60",
        tones[tone],
      )}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Icon className="h-3.5 w-3.5" aria-hidden />}
      <span>{label}</span>
    </button>
  );
}

/** Lead showcase card — identity + stage meta + nurture action rail */
export function LeadShowcaseCard({
  lead,
  selected,
  onView,
  onMove,
  onCall,
  onIvrCall,
  onWhatsApp,
  onDialerSync,
  onToggleSelect,
  callLoading,
  ivrLoading,
  dialerLoading,
}: Props) {
  const overdue = lead.slaCountdown === "Overdue";
  const badge = syncBadge(lead.smartfloSyncStatus);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all",
        selected
          ? "border-primary/40 shadow-[0_8px_28px_-12px_hsl(var(--primary)/0.28)]"
          : "border-border/70 hover:border-primary/25 hover:shadow-[0_10px_32px_-16px_hsl(var(--primary)/0.18)]",
      )}
    >
      <div
        className={cn("absolute inset-y-0 left-0 w-1 bg-gradient-to-b", accentByScore[lead.scoreLabel])}
        aria-hidden
      />

      <div className="relative grid gap-4 p-4 pl-5 sm:p-5 sm:pl-6 lg:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-start">
        {onToggleSelect ? (
          <div className="pt-1">
            <input
              type="checkbox"
              checked={Boolean(selected)}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${lead.customerName}`}
              className="h-4 w-4 rounded border-border text-primary accent-primary"
            />
          </div>
        ) : null}

        {/* Identity */}
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-primary/60 font-display text-sm font-bold text-primary-foreground shadow-sm">
              {initials(lead.customerName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onView}
                  className="truncate text-left text-base font-bold tracking-tight text-foreground hover:text-primary sm:text-lg"
                >
                  {lead.customerName}
                </button>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset",
                    scoreTone[lead.scoreLabel],
                  )}
                >
                  {lead.leadScore} · {lead.scoreLabel}
                </span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">
                  {lead.priority}
                </span>
                <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {lead.status}
                </span>
                {badge ? (
                  <span
                    className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset", badge.className)}
                    title={lead.smartfloSyncError || undefined}
                  >
                    {badge.label}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-mono text-xs text-foreground/80">{lead.mobile || "No mobile"}</span>
                {lead.product ? <span>{lead.product}</span> : null}
                {lead.district ? <span className="text-muted-foreground/80">{lead.district}</span> : null}
              </p>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground/90">
                <span className="mr-3">Lead {lead.leadId}</span>
                <span className="mr-3">Cust {lead.customerId}</span>
                <span>Opp {lead.opportunityId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stage / ownership */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <Meta
            label="Stage"
            value={
              <span>
                <span className="font-mono font-bold text-primary">{lead.microStageCode}</span>
                <span className="mt-0.5 block truncate text-xs font-medium text-foreground">{lead.microStage}</span>
              </span>
            }
          />
          <Meta label="Owner" value={lead.currentOwner} />
          <Meta label="Current action" value={lead.currentAction} emphasize />
          <Meta label="Next" value={lead.nextAction} />
        </div>

        {/* SLA */}
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
              overdue ? "bg-destructive/10 text-destructive" : "bg-secondary/70 text-foreground",
            )}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden />
            SLA {lead.slaTime}
            {lead.slaCountdown ? (
              <span className={overdue ? "font-bold" : "text-warning"}>({lead.slaCountdown})</span>
            ) : null}
          </div>
          <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <AlertTriangle className="h-3 w-3 text-warning" aria-hidden />
            {lead.escalationOwner}
          </p>
        </div>
      </div>

      {/* Action rail */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-secondary/25 px-4 py-3 pl-5 sm:px-5 sm:pl-6">
        <ActionChip label="View" icon={Eye} onClick={onView} tone="primary" />
        <ActionChip label="Move" icon={ArrowRightLeft} onClick={onMove} />
        <ActionChip
          label={callLoading ? "Calling…" : "Direct Call"}
          icon={Phone}
          onClick={onCall}
          loading={callLoading}
          tone="success"
        />
        <ActionChip
          label={ivrLoading ? "IVR…" : "IVR"}
          icon={PhoneForwarded}
          onClick={onIvrCall}
          loading={ivrLoading}
          tone="violet"
        />
        <ActionChip label="WhatsApp" icon={MessageCircle} onClick={onWhatsApp} tone="wa" />
        {onDialerSync ? (
          <ActionChip
            label={
              dialerLoading
                ? "Syncing…"
                : lead.smartfloSyncStatus === "SYNCED"
                  ? "Resync"
                  : "Sync to Smartflo"
            }
            icon={Radio}
            onClick={onDialerSync}
            loading={dialerLoading}
          />
        ) : null}
      </div>
    </article>
  );
}

function Meta({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2",
        emphasize ? "bg-primary/[0.06] ring-1 ring-primary/12" : "bg-secondary/50",
      )}
    >
      <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={cn("mt-0.5 text-sm font-medium leading-snug", emphasize ? "text-primary" : "text-foreground")}>
        {typeof value === "string" ? <span className="line-clamp-2">{value}</span> : value}
      </div>
    </div>
  );
}

export default LeadShowcaseCard;
