import { useMemo } from "react";
import ModuleShell, { Btn, Section } from "@/components/shared/ModuleShell";
import { useOpportunityLeads } from "@/store/selectors";
import { useOpportunityActions } from "@/hooks/use-opportunity-actions";

const BUCKETS = [
  "No Response",
  "Price Hold",
  "Finance Rejected",
  "Competitor Purchased",
  "Family Discussion",
  "Tender Delayed",
  "Future Prospect",
] as const;

const Reengagement = () => {
  const leads = useOpportunityLeads();
  const holdLeads = useMemo(() => leads.filter((l) => l.status === "Hold"), [leads]);
  const { run } = useOpportunityActions(holdLeads[0]?.opportunityId);

  const bucketCounts = useMemo(() => {
    const base = holdLeads.length;
    if (base === 0) return BUCKETS.map(() => 0);
    return BUCKETS.map((_, i) => Math.max(0, Math.floor(base / BUCKETS.length) + (i < base % BUCKETS.length ? 1 : 0)));
  }, [holdLeads.length]);

  return (
    <ModuleShell moduleId="re-engagement">
      <Section title="Dormant lead buckets (from API data · Hold status)">
        <p className="mb-3 text-sm text-muted-foreground">
          {holdLeads.length} leads on Hold · synced via GET /bootstrap
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BUCKETS.map((b, i) => (
            <div key={b} className="rounded-xl border border-border/70 p-4">
              <p className="font-semibold text-foreground">{b}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{bucketCounts[i]}</p>
              <p className="text-xs text-muted-foreground">leads</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Re-engagement actions (API)">
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
