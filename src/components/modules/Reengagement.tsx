import { useMemo } from "react";
import ModuleShell, { Btn, Section } from "@/components/shared/ModuleShell";
import { useOpportunityLeads } from "@/store/selectors";
import { useOpportunityActions } from "@/hooks/use-opportunity-actions";
import { useZentroFlowStore } from "@/store/opportunity-store";

const BUCKETS = [
  "No Response",
  "Price Hold",
  "Finance Rejected",
  "Competitor Purchased",
  "Family Discussion",
  "Tender Delayed",
  "Future Prospect",
] as const;

function bucketForLead(
  status: string,
  reason: string | undefined,
  micro: string,
): (typeof BUCKETS)[number] {
  const r = (reason ?? "").toLowerCase();
  if (r.includes("finance") || micro.startsWith("C1A")) return "Finance Rejected";
  if (r.includes("competitor")) return "Competitor Purchased";
  if (r.includes("price") || r.includes("afford")) return "Price Hold";
  if (r.includes("family") || r.includes("approval")) return "Family Discussion";
  if (r.includes("tender")) return "Tender Delayed";
  if (r.includes("future") || r.includes("nurture") || micro === "C1.9") return "Future Prospect";
  if (status === "Hold" || r.includes("no response")) return "No Response";
  return "No Response";
}

const Reengagement = () => {
  const leads = useOpportunityLeads();
  const opportunities = useZentroFlowStore((s) => s.opportunities);
  const dormant = useMemo(
    () =>
      leads.filter((l) => {
        const opp = opportunities[l.opportunityId];
        return (
          l.status === "Hold" ||
          l.status === "Lost" ||
          l.microStageCode === "C1.9" ||
          (opp?.sla_status === "Breached" && l.scoreLabel === "Cold")
        );
      }),
    [leads, opportunities],
  );
  const { run } = useOpportunityActions(dormant[0]?.opportunityId);

  const bucketCounts = useMemo(() => {
    const counts = Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Record<(typeof BUCKETS)[number], number>;
    for (const l of dormant) {
      const opp = opportunities[l.opportunityId];
      const reason =
        opp?.stage_step_data?.[l.microStageCode]?.notes ??
        String(opp?.stage_step_data?.[l.microStageCode]?.fields?.nurture_reason ?? "");
      const bucket = bucketForLead(l.status, reason, l.microStageCode);
      counts[bucket] += 1;
    }
    return counts;
  }, [dormant, opportunities]);

  return (
    <ModuleShell moduleId="re-engagement">
      <Section title="Dormant / recycle buckets">
        <p className="mb-3 text-sm text-muted-foreground">
          {dormant.length} leads in Hold/Lost/C1.9 nurture or cold SLA breach — reason-based 30/60/90 recycling.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BUCKETS.map((b) => (
            <div key={b} className="rounded-xl border border-border/70 p-4">
              <p className="font-semibold text-foreground">{b}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{bucketCounts[b]}</p>
              <p className="text-xs text-muted-foreground">leads</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Re-engagement actions">
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => run("Start Nurture Campaign")}>Start Nurture Campaign</Btn>
          <Btn variant="outline" onClick={() => run("Send Finance Scheme")}>Send Finance Scheme</Btn>
          <Btn variant="outline" onClick={() => run("Send Exchange Offer")}>Send Exchange Offer</Btn>
          <Btn variant="secondary" onClick={() => run("Schedule Recycle Date")}>Schedule Recycle Date</Btn>
          <Btn variant="secondary" onClick={() => run("Reopen Lead")}>Reopen Lead</Btn>
          <Btn variant="secondary" onClick={() => run("Assign Executive")}>Assign Executive</Btn>
        </div>
      </Section>
    </ModuleShell>
  );
};

export default Reengagement;
