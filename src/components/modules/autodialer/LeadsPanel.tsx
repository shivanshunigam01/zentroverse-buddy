import { Btn, Section } from "@/components/shared/ModuleShell";
import { maskIdentifier } from "@/domain/dialer/status-map";
import type { DialerLeadRow } from "@/domain/dialer/types";

type Props = {
  leads: DialerLeadRow[];
  busyId: string | null;
  onSync: (id: string) => void;
  onView: (id: string) => void;
};

export function LeadsPanel({ leads, busyId, onSync, onView }: Props) {
  return (
    <Section title="Auto Dialer leads">
      {leads.length === 0 ? (
        <p className="text-sm text-muted-foreground">No leads loaded from the API yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {["Name", "Phone", "Sync", "Smartflo ID", "Dial status", "Disposition", "Last call", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-3 py-2">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {leads.map((row) => (
                <tr key={row.opportunity_id} className="border-b border-border/50">
                  <td className="px-3 py-2 font-semibold">{row.customer_name ?? row.lead_id}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.customer_mobile ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{row.smartflo_sync_status ?? "PENDING"}</td>
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
                        disabled={busyId === row.opportunity_id}
                        onClick={() => onSync(row.opportunity_id)}
                      >
                        {row.smartflo_sync_status === "FAILED" ? "Retry sync" : "Sync"}
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
