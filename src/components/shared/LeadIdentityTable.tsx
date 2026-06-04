import type { Lead } from "@/adapters/lead-view.adapter";

const ID_ROWS: { label: string; key: keyof Pick<Lead, "leadId" | "customerId" | "opportunityId"> }[] = [
  { label: "Lead ID", key: "leadId" },
  { label: "Customer ID", key: "customerId" },
  { label: "Opportunity ID", key: "opportunityId" },
];

/** Labeled Lead / Customer / Opportunity IDs */
const LeadIdentityTable = ({
  lead,
  compact,
}: {
  lead: Pick<Lead, "leadId" | "customerId" | "opportunityId">;
  compact?: boolean;
}) => (
  <div className={`overflow-hidden rounded-xl border border-border/70 ${compact ? "" : "bg-secondary/20"}`}>
    <table className="w-full text-left text-sm">
      <thead className={compact ? "sr-only" : ""}>
        <tr className="border-b border-border/60 bg-secondary/40 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <th className="px-3 py-2 sm:px-4 sm:py-2.5">Type</th>
          <th className="px-3 py-2 sm:px-4 sm:py-2.5">ID</th>
        </tr>
      </thead>
      <tbody>
        {ID_ROWS.map(({ label, key }) => (
          <tr key={key} className="border-b border-border/40 last:border-0">
            <td className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-muted-foreground sm:px-4 sm:py-2.5 sm:text-sm">
              {label}
            </td>
            <td className="px-3 py-2 font-mono text-[11px] font-medium text-foreground sm:px-4 sm:py-2.5 sm:text-xs">
              {lead[key]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default LeadIdentityTable;
