import { useMemo, useState } from "react";
import { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import type { DialerCall } from "@/domain/dialer/types";

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = { calls: DialerCall[] };

export function CallsPanel({ calls }: Props) {
  const [statusFilter, setStatusFilter] = useState("");
  const [dispositionFilter, setDispositionFilter] = useState("");

  const statuses = useMemo(
    () => [...new Set(calls.map((c) => c.status).filter(Boolean))] as string[],
    [calls],
  );
  const dispositions = useMemo(
    () => [...new Set(calls.map((c) => c.disposition).filter(Boolean))] as string[],
    [calls],
  );

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (dispositionFilter && c.disposition !== dispositionFilter) return false;
      return true;
    });
  }, [calls, statusFilter, dispositionFilter]);

  return (
    <Section title="Recent calls">
      <ActionBar>
        <select
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          value={dispositionFilter}
          onChange={(e) => setDispositionFilter(e.target.value)}
        >
          <option value="">All dispositions</option>
          {dispositions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {(statusFilter || dispositionFilter) && (
          <Btn variant="outline" onClick={() => { setStatusFilter(""); setDispositionFilter(""); }}>
            Clear filters
          </Btn>
        )}
      </ActionBar>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No dialer calls stored yet. Webhooks and hangup events appear here.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {["Customer", "Agent", "Status", "Disposition", "Duration", "Date"].map((h) => (
                  <th key={h} className="px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((call) => (
                <tr key={call._id ?? call.id ?? call.smartflo_call_id ?? call.smartflo_uuid ?? call.created_at} className="border-b border-border/50">
                  <td className="px-3 py-2 font-mono text-xs">{call.customer_number ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{call.agent_name ?? call.agent_id ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{call.status ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{call.disposition ?? "—"}</td>
                  <td className="px-3 py-2 text-xs tabular-nums">{formatDuration(call.duration)}</td>
                  <td className="px-3 py-2 text-xs">
                    {call.start_time || call.created_at
                      ? new Date(call.start_time ?? call.created_at ?? "").toLocaleString("en-IN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
