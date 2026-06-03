import { useState } from "react";
import ModuleShell, { Btn, Section, FormGrid, ActionBar } from "@/components/shared/ModuleShell";
import EmptyState from "@/components/shared/EmptyState";
import LeadCardStrip from "@/components/shared/LeadCardStrip";
import { SCORING_RULES } from "@/domain/platform";
import { useLeadById, useOpportunityLeads } from "@/store/selectors";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { useOpportunityActions } from "@/hooks/use-opportunity-actions";
import { getNextMicroStage } from "@/domain/stages/stage-gates";
import { useZentroFlowStore } from "@/store/opportunity-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = { leadId?: string };

const DETAIL_TABS = [
  "Overview", "Activity Timeline", "Contact Health", "Engagement", "Qualification",
  "Quote", "Finance", "Booking", "Delivery", "Lifecycle", "Documents", "Notes",
] as const;

const MetaItem = ({
  label,
  value,
  highlight,
  className = "",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) => (
  <div className={className}>
    <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
    <p className={`mt-0.5 font-semibold leading-snug ${highlight ? "text-warning" : "text-foreground"}`}>{value}</p>
  </div>
);

const LeadDetail = ({ leadId }: Props) => {
  const leads = useOpportunityLeads();
  const resolved = useLeadById(leadId);
  const lead = resolved ?? leads[0];
  const opp = useZentroFlowStore((s) => (lead ? s.opportunities[lead.opportunityId] : undefined));
  const nextStep = opp ? getNextMicroStage(opp) : null;
  const [tab, setTab] = useState<string>("Overview");
  const { callLead, openWhatsApp } = useDashboardActions();
  const { run } = useOpportunityActions(lead?.opportunityId);

  if (!lead) {
    return (
      <ModuleShell moduleId="lead-detail">
        <EmptyState
          title="No lead selected"
          description="Upload Excel leads first, then open a lead from the inbox to work through C0 → C3 step by step."
        />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell moduleId="lead-detail">
      {nextStep && (
        <p className="rounded-xl bg-primary/5 px-4 py-2 text-sm text-primary">
          Next step: <strong>{nextStep}</strong> — only the matching action button is enabled.
        </p>
      )}
      {/* Top header */}
      <div className="surface-card overflow-hidden p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:gap-6">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{lead.customerName}</h2>
            <a href={`tel:${lead.mobile}`} className="mt-1 inline-block text-sm font-medium text-primary hover:underline">
              {lead.mobile}
            </a>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[lead.leadId, lead.customerId, lead.opportunityId].map((id) => (
                <span key={id} className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:text-xs">
                  {id}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary/40 p-3 text-xs sm:gap-3 sm:p-4 sm:text-sm lg:min-w-[240px]">
            <MetaItem label="Product" value={lead.product} />
            <MetaItem label="Score" value={`${lead.leadScore} ${lead.scoreLabel}`} />
            <MetaItem label="Priority" value={lead.priority} />
            <MetaItem label="Owner" value={lead.currentOwner} />
            <MetaItem label="Stage" value={`${lead.currentStage} · ${lead.microStage}`} className="col-span-2" />
            <MetaItem label="SLA" value={lead.slaCountdown ?? lead.slaTime} highlight className="col-span-2" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Btn onClick={() => callLead(lead.mobile, lead.customerName)}>Call Customer</Btn>
          <Btn variant="outline" onClick={() => openWhatsApp(lead.leadId)}>
            WhatsApp
          </Btn>
        </div>
        <div className="mt-3">
          <LeadCardStrip lead={lead} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="min-w-0">
        <div className="tabs-scroll rounded-xl bg-secondary/50 p-1.5">
          <TabsList className="inline-flex h-auto min-w-max gap-1 bg-transparent p-0">
            {DETAIL_TABS.map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-sm"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="Overview" className="mt-4 space-y-4">
          <OverviewTab lead={lead} run={run} />
        </TabsContent>
        <TabsContent value="Activity Timeline" className="mt-4">
          <TimelineTab leadId={lead.opportunityId} />
        </TabsContent>
        <TabsContent value="Contact Health" className="mt-4">
          <ContactHealthTab run={run} />
        </TabsContent>
        <TabsContent value="Engagement" className="mt-4">
          <EngagementTab run={run} />
        </TabsContent>
        <TabsContent value="Qualification" className="mt-4">
          <QualificationTab run={run} />
        </TabsContent>
        <TabsContent value="Quote" className="mt-4">
          <QuoteTab run={run} />
        </TabsContent>
        <TabsContent value="Finance" className="mt-4">
          <FinanceTab run={run} />
        </TabsContent>
        <TabsContent value="Booking" className="mt-4">
          <BookingTab run={run} />
        </TabsContent>
        <TabsContent value="Delivery" className="mt-4">
          <DeliveryTab run={run} />
        </TabsContent>
        <TabsContent value="Lifecycle" className="mt-4">
          <LifecycleTab run={run} />
        </TabsContent>
        <TabsContent value="Documents" className="mt-4">
          <Section title="Documents"><Btn onClick={() => run("Upload Document")}>Upload Document</Btn></Section>
        </TabsContent>
        <TabsContent value="Notes" className="mt-4">
          <Section title="Notes"><textarea className="input-app min-h-[120px] w-full" placeholder="Add note..." /></Section>
        </TabsContent>
      </Tabs>
    </ModuleShell>
  );
};

const OverviewTab = ({ lead, run }: { lead: import("@/adapters/lead-view.adapter").Lead; run: (label: string) => void }) => (
  <>
    <Section title={`${lead.microStage} · Current stage`}>
      <p className="text-sm text-muted-foreground">{lead.currentAction}</p>
      <ActionBar>
        <Btn onClick={() => run("Complete Contact")}>Complete Contact</Btn>
        <Btn variant="outline" onClick={() => run("Verify Number")}>Verify Number</Btn>
      </ActionBar>
    </Section>
    <Section title="C0.8 · Lead scoring">
      <div className="grid gap-2 sm:grid-cols-2">
        {SCORING_RULES.map((r) => (
          <div key={r.activity} className="flex justify-between rounded-lg bg-secondary/30 px-3 py-2 text-sm">
            <span>{r.activity}</span>
            <span className="font-mono font-bold">{r.points > 0 ? `+${r.points}` : r.points}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-lg font-bold">Output: {lead.scoreLabel}</p>
    </Section>
    <Section title="C0.9 · Next best action">
      <p className="text-sm"><strong>Suggested:</strong> {lead.nextAction}</p>
      <p className="text-sm text-muted-foreground">Owner: {lead.currentOwner} · SLA: {lead.slaTime} · Escalation: {lead.escalationOwner}</p>
      <ActionBar>
        <Btn onClick={() => run("Accept Action")}>Accept Action</Btn>
        <Btn onClick={() => run("Pass Score Gate")}>Pass Score Gate</Btn>
        <Btn variant="outline" onClick={() => run("Change Action")}>Change Action</Btn>
        <Btn variant="outline" onClick={() => run("Assign Owner")}>Assign Owner</Btn>
      </ActionBar>
    </Section>
    <Section title="C0.10 · Quote readiness checklist">
      <Checklist items={["Variant Known", "Budget Discussed", "Finance Need Known", "Decision Maker Known", "Timeline Known", "Competition Known"]} />
      <div className="mt-4">
        <Btn onClick={() => run("Move to C1")}>Move to C1</Btn>
      </div>
    </Section>
  </>
);

const ContactHealthTab = ({ run }: { run: (label: string) => void }) => (
  <div className="space-y-4">
    <Section title="C0.3 · Contact health">
      <StatusGrid items={[
        ["Mobile Valid", "Yes"], ["WhatsApp Active", "Yes"], ["Call Reachable", "Yes"],
        ["Email Valid", "—"], ["Territory Valid", "Yes"], ["Contactability Score", "82"],
      ]} />
      <ActionBar>
        <Btn onClick={() => run("Verify Number")}>Verify Number</Btn>
        <Btn variant="outline" onClick={() => run("Check WhatsApp")}>Check WhatsApp</Btn>
        <Btn variant="outline" onClick={() => run("Send Test Message")}>Send Test Message</Btn>
        <Btn variant="secondary" onClick={() => run("Move to Bot")}>Move to Bot</Btn>
        <Btn variant="secondary" onClick={() => run("Move to Dialer")}>Move to Dialer</Btn>
        <Btn variant="danger" onClick={() => run("Mark Invalid")}>Mark Invalid</Btn>
      </ActionBar>
    </Section>
    <Section title="C0.2 · Duplicate check">
      <StatusGrid items={[["Existing Customer?", "No"], ["Same Mobile?", "Yes"], ["Same Product?", "No"], ["Different Product?", "Cross-sell"], ["Old Lead?", "—"]]} />
      <ActionBar>
        <Btn variant="secondary" onClick={() => run("Merge Lead")}>Merge Lead</Btn>
        <Btn variant="secondary" onClick={() => run("New Opportunity")}>New Opportunity</Btn>
        <Btn variant="secondary" onClick={() => run("Reopen Old Lead")}>Reopen Old Lead</Btn>
        <Btn variant="outline" onClick={() => run("Alert Manager")}>Alert Manager</Btn>
      </ActionBar>
    </Section>
  </div>
);

const EngagementTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="C0.4 · Bot engagement">
    <StatusGrid items={[["Welcome Sent", "Yes"], ["Product Asked", "Yes"], ["Location Asked", "Pending"], ["Timeline Asked", "—"], ["Finance Asked", "—"], ["Callback Asked", "—"]]} />
    <div className="mt-4 flex flex-wrap gap-2">
      <Btn onClick={() => run("Send Bot Message")}>Send Bot Message</Btn>
      <Btn variant="outline" onClick={() => run("Resend Message")}>Resend Message</Btn>
      <Btn variant="outline" onClick={() => run("View Reply")}>View Reply</Btn>
      <Btn variant="secondary" onClick={() => run("Transfer to Executive")}>Transfer to Executive</Btn>
    </div>
  </Section>
);

const QualificationTab = ({ run }: { run: (label: string) => void }) => (
  <>
    <Section title="C0.6 · Discovery">
      <FormGrid fields={["Usage", "Route", "Load", "Current Vehicle", "Pain Point", "Budget", "Timeline", "Buyer Type", "Finance Need"]} />
      <ActionBar>
        <Btn onClick={() => run("Save Discovery")}>Save Discovery</Btn>
        <Btn variant="outline" onClick={() => run("Lock Variant")}>Lock Variant</Btn>
        <Btn variant="outline" onClick={() => run("Confirm Budget")}>Confirm Budget</Btn>
      </ActionBar>
    </Section>
    <Section title="C0.7 · Qualification">
      <FormGrid fields={["Vehicle Type", "Variant", "Budget", "Finance", "Exchange", "Decision Maker", "Competition", "Timeline"]} />
      <ActionBar>
        <Btn onClick={() => run("Mark Qualified")}>Mark Qualified</Btn>
        <Btn variant="outline" onClick={() => run("Add Competitor Offer")}>Add Competitor Offer</Btn>
        <Btn variant="outline" onClick={() => run("Schedule Demo")}>Schedule Demo</Btn>
        <Btn variant="outline" onClick={() => run("Confirm Authority")}>Confirm Authority</Btn>
      </ActionBar>
    </Section>
  </>
);

const QuoteTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="C1 · Sales pipeline actions">
    <p className="mb-3 text-xs text-muted-foreground">C1.1 Quote Shared through C1.10 Finance Ready</p>
    <div className="flex flex-wrap gap-2">
      {["Create Quote", "Send Quote", "Capture Objection", "Add Competitor Offer", "Schedule Demo", "Check Affordability", "Start Finance", "Escalate Manager", "Move to Nurture", "Move to C1A"].map((a) => (
        <Btn key={a} variant={a.includes("Move") ? "primary" : "outline"} onClick={() => run(a)}>{a}</Btn>
      ))}
    </div>
  </Section>
);

const FinanceTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="C1A · Finance desk">
    <StageList stages={[
      "Application Submitted",
      "Documents Collected",
      "FI Assigned",
      "Verification Done",
      "Decision Pending / Approved / Rejected",
      "Approval Received",
      "Margin Confirmed",
      "Variant Locked",
      "Add-ons Finalized",
      "Payment / Booking Intent Confirmed",
    ]} />
    <div className="mt-4 flex flex-wrap gap-2">
      {["Upload Docs", "Verify Docs", "Assign FI", "Update FI Result", "Mark Approved", "Mark Rejected", "Alternate Finance", "Confirm Margin", "Move to C2"].map((b) => (
        <Btn key={b} variant="outline" onClick={() => run(b)}>{b}</Btn>
      ))}
    </div>
  </Section>
);

const BookingTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="C2 · Booking & billing">
    <StageList stages={[
      "Booking Done",
      "Vehicle Allocation",
      "Variant Lock",
      "Billing Documents",
      "Disbursement",
      "Down Payment",
      "Insurance",
      "Registration",
      "HSRP",
      "PDI",
    ]} />
    <div className="mt-4 flex flex-wrap gap-2">
      {["Create Booking", "Allocate Vehicle", "Lock Booking Variant", "Upload Billing Docs", "Update Disbursement", "Collect Down Payment", "Create Insurance", "Start Registration", "Update HSRP", "Complete PDI", "Move to C3"].map((b) => (
        <Btn key={b} variant="outline" onClick={() => run(b)}>{b}</Btn>
      ))}
    </div>
  </Section>
);

const DeliveryTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="C3 · Delivery desk">
    <Checklist items={[
      "Final Payment",
      "Insurance Active",
      "Registration Complete",
      "PDI Complete",
      "Vehicle Ready",
      "Delivery Done",
      "Feedback Taken",
      "Photo / Video Testimonial",
      "Referral Asked",
      "Lifecycle Activated",
    ]} />
    <div className="mt-4 flex flex-wrap gap-2">
      {["Confirm Payment", "Verify Insurance", "Verify Registration", "Approve PDI", "Mark Vehicle Ready", "Complete Delivery", "Send Feedback Link", "Capture Testimonial", "Ask Referral", "Activate Lifecycle"].map((b) => (
        <Btn key={b} variant="outline" onClick={() => run(b)}>{b}</Btn>
      ))}
    </div>
  </Section>
);

const LifecycleTab = ({ run }: { run: (label: string) => void }) => (
  <Section title="Lifecycle timeline">
    {["Day 1 Thank You", "Day 3 Feedback", "Day 7 Usage Tips", "Day 30 Service Reminder", "1 Year Renewal", "3 Years Upgrade", "5 Years Exchange"].map((t) => (
      <div key={t} className="flex items-center justify-between border-b border-border/50 py-2 text-sm">
        <span>{t}</span>
        <Btn variant="outline" onClick={() => run("Send Message")}>Send Message</Btn>
      </div>
    ))}
  </Section>
);

const TimelineTab = ({ leadId }: { leadId?: string }) => {
  const activities = useZentroFlowStore((s) =>
    leadId ? s.activities.filter((a) => a.opportunity_id === leadId) : s.activities,
  );
  return (
  <Section title="Activity timeline">
    {activities.length === 0 ? (
      <p className="text-sm text-muted-foreground">No activity yet — actions you take will appear here.</p>
    ) : (
      activities.map((e) => (
        <div key={e.activity_id} className="border-l-2 border-primary/30 py-2 pl-4 text-sm">
          {e.remarks}
          <span className="ml-2 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
        </div>
      ))
    )}
  </Section>
  );
};

const StatusGrid = ({ items }: { items: [string, string][] }) => (
  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
    {items.map(([k, v]) => (
      <div key={k} className="rounded-lg bg-secondary/30 px-3 py-2">
        <p className="text-[10px] uppercase text-muted-foreground">{k}</p>
        <p className="font-semibold text-foreground">{v}</p>
      </div>
    ))}
  </div>
);

const Checklist = ({ items }: { items: string[] }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li key={item} className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 rounded border-border" />
        {item}
      </li>
    ))}
  </ul>
);

const StageList = ({ stages }: { stages: string[] }) => (
  <ol className="space-y-1 text-sm">
    {stages.map((s, i) => (
      <li key={s} className="flex gap-2 rounded-lg bg-secondary/20 px-3 py-2">
        <span className="font-mono text-xs text-primary">{i + 1}</span>
        {s}
      </li>
    ))}
  </ol>
);

export default LeadDetail;
