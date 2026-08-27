import { useMemo, useState } from "react";
import { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { maskIdentifier } from "@/domain/dialer/status-map";
import type { DialerLeadRow, DialerSyncStatus } from "@/domain/dialer/types";

type Props = {
  leads: DialerLeadRow[];
  busyId: string | null;
  syncing: boolean;
  onSync: (id: string) => void;
  onSyncSelected: (ids: string[]) => void;
  onRetryFailed: () => void;
  onView: (id: string) => void;
};

const FILTERS: Array<{ label: string; value: "" | DialerSyncStatus }> = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Synced", value: "SYNCED" },
  { label: "Failed", value: "FAILED" },
];

export function LeadsPanel({
  leads,
  busyId,
  syncing,
  onSync,
  onSyncSelected,
  onRetryFailed,
  onView,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"" | DialerSyncStatus>("");

  const filtered = useMemo(() => {
    if (!filter) return leads;
    return leads.filter((row) => (row.smartflo_sync_status ?? "PENDING") === filter);
  }, [leads, filter]);

  const failedCount = leads.filter((l) => l.smartflo_sync_status === "FAILED").length;
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((row) => selected.has(row.opportunity_id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((row) => next.delete(row.opportunity_id));
      } else {
        filtered.forEach((row) => next.add(row.opportunity_id));
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Section title="Auto Dialer leads">
      <ActionBar>
        {FILTERS.map((f) => (
          <Btn
            key={f.label}
            variant={filter === f.value ? "primary" : "outline"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Btn>
        ))}
        <Btn
          variant="secondary"
          disabled={syncing || selected.size === 0}
          onClick={() => onSyncSelected([...selected])}
        >
          Sync selected ({selected.size})
        </Btn>
        <Btn variant="outline" disabled={syncing || failedCount === 0} onClick={onRetryFailed}>
          Retry failed ({failedCount})
        </Btn>
      </ActionBar>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No leads match this filter.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead>
              <tr className="border-b text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} aria-label="Select all" />
                </th>
                {["Name", "Phone", "Sync", "Error", "Smartflo ID", "Dial status", "Disposition", "Last call", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-3 py-2">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.opportunity_id} className="border-b border-border/50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(row.opportunity_id)}
                      onChange={() => toggleOne(row.opportunity_id)}
                      aria-label={`Select ${row.opportunity_id}`}
                    />
                  </td>
                  <td className="px-3 py-2 font-semibold">{row.customer_name ?? row.lead_id}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.customer_mobile ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{row.smartflo_sync_status ?? "PENDING"}</td>
                  <td className="max-w-[180px] truncate px-3 py-2 text-xs text-destructive" title={row.smartflo_sync_error ?? ""}>
                    {row.smartflo_sync_error ?? "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{maskIdentifier(row.smartflo_lead_id)}</td>
                  <td className="px-3 py-2 text-xs">{row.smartflo_dial_status ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{row.smartflo_disposition ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">
                    {row.smartflo_last_call_at ? new Date(row.smartflo_last_call_at).toLocaleString("en-IN") : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Btn variant="outline" onClick={() => onView(row.opportunity_id)}>
                        View
                      </Btn>
                      <Btn
                        variant="secondary"
                        disabled={busyId === row.opportunity_id || syncing}
                        onClick={() => onSync(row.opportunity_id)}
                      >
                        {row.smartflo_sync_status === "FAILED" ? "Retry" : "Sync"}
                      </Btn>
                    </div>
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
