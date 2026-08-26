import { Section } from "@/components/shared/ModuleShell";
import type { DialerCall } from "@/domain/dialer/types";

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = { calls: DialerCall[] };

export function CallsPanel({ calls }: Props) {
  return (
    <Section title="Recent calls">
      {calls.length === 0 ? (
        <p className="text-sm text-muted-foreground">No dialer calls stored yet. Webhooks and hangup events appear here.</p>
      ) : (
        <div className="overflow-x-auto">
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
              {calls.map((call) => (
                <tr key={call._id ?? call.smartflo_call_id ?? call.smartflo_uuid ?? call.created_at} className="border-b border-border/50">
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
