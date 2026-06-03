import ModuleShell, { Btn, Section } from "@/components/shared/ModuleShell";

const BUCKETS = [
  "No Response", "Price Hold", "Finance Rejected", "Competitor Purchased",
  "Family Discussion", "Tender Delayed", "Future Prospect",
];

const Reengagement = () => (
  <ModuleShell moduleId="re-engagement">
    <Section title="Dormant lead buckets">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {BUCKETS.map((b) => (
          <div key={b} className="rounded-xl border border-border/70 p-4">
            <p className="font-semibold text-foreground">{b}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{[42, 28, 19, 15, 31, 12, 8][BUCKETS.indexOf(b)]}</p>
            <p className="text-xs text-muted-foreground">leads</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Re-engagement actions">
      <div className="flex flex-wrap gap-2">
        <Btn>Start Nurture Campaign</Btn>
        <Btn variant="outline">Send Finance Scheme</Btn>
        <Btn variant="outline">Send Exchange Offer</Btn>
        <Btn variant="secondary">Schedule Recycle Date</Btn>
        <Btn variant="secondary">Reopen Lead</Btn>
        <Btn variant="secondary">Assign Executive</Btn>
      </div>
    </Section>
  </ModuleShell>
);

export default Reengagement;
