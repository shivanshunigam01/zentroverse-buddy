import type { BusinessMicroStage, LifecycleStage, SalesStage } from "./types";

export const SALES_STAGES: ReadonlyArray<{
  code: SalesStage;
  name: string;
  purpose: string;
}> = [
  { code: "C0", name: "Lead Maturity", purpose: "Contact through quote readiness" },
  { code: "C1", name: "Sales Discussion", purpose: "Quote, objection, negotiation, finance discussion" },
  { code: "C1A", name: "Finance Approval", purpose: "Application through booking intent" },
  { code: "C2", name: "Booking to Billing", purpose: "Booking through PDI" },
  { code: "C3", name: "Retail / Delivery", purpose: "Payment through lifecycle activation" },
] as const;

export const LIFECYCLE_STAGES: ReadonlyArray<{
  code: LifecycleStage;
  name: string;
  purpose: string;
}> = [
  { code: "L1", name: "Service", purpose: "Service reminders and bookings" },
  { code: "L2", name: "Insurance", purpose: "Insurance renewal campaigns" },
  { code: "L3", name: "AMC", purpose: "Annual maintenance contracts" },
  { code: "L4", name: "Upgrade", purpose: "Upgrade opportunities" },
  { code: "L5", name: "Exchange", purpose: "Exchange valuation and conversion" },
  { code: "L6", name: "Repeat Sale", purpose: "Fleet expansion and repeat purchase" },
  { code: "L7", name: "Referral", purpose: "Referral program revenue" },
] as const;

export const C0_MICRO_STAGES: BusinessMicroStage[] = [
  { code: "C0.1", macro: "C0", title: "Contact", trigger: "Lead captured", systemAction: "Validate contact details", owner: "System", sla: "Instant", exitCondition: "Contact established" },
  { code: "C0.2", macro: "C0", title: "Discovery", trigger: "Contact valid", systemAction: "Capture usage, route, load, pain point", owner: "Sales Executive", sla: "Same day", exitCondition: "Requirement captured" },
  { code: "C0.3", macro: "C0", title: "Qualification", trigger: "Discovery complete", systemAction: "Validate need, budget band, timeline", owner: "Sales Executive", sla: "Same day", exitCondition: "Qualified or disqualified" },
  { code: "C0.4", macro: "C0", title: "Variant", trigger: "Qualified", systemAction: "Lock vehicle type and variant interest", owner: "Sales Executive", sla: "Same day", exitCondition: "Variant known" },
  { code: "C0.5", macro: "C0", title: "Budget", trigger: "Variant known", systemAction: "Capture budget, EMI expectation, DP", owner: "Sales Executive", sla: "Same day", exitCondition: "Budget discussed" },
  { code: "C0.6", macro: "C0", title: "Competition", trigger: "Budget captured", systemAction: "Map competitor offers", owner: "Sales Executive", sla: "Same day", exitCondition: "Competition logged" },
  { code: "C0.7", macro: "C0", title: "Demo", trigger: "Customer requests demo", systemAction: "Schedule test drive / route demo", owner: "Sales Executive", sla: "Same day", exitCondition: "Demo completed or waived" },
  { code: "C0.8", macro: "C0", title: "Authority", trigger: "Demo complete", systemAction: "Identify decision maker and influencers", owner: "Sales Executive", sla: "Same day", exitCondition: "Authority known" },
  { code: "C0.9", macro: "C0", title: "Scoring Gate", trigger: "All C0 fields captured", systemAction: "Confirm score band meets quote threshold", owner: "System", sla: "Real-time", exitCondition: "Score gate passed" },
  { code: "C0.10", macro: "C0", title: "Quote Ready", trigger: "Score gate passed", systemAction: "Enable quote creation", owner: "Sales Executive", sla: "1 hr", exitCondition: "Move to C1" },
];

export const C1_MICRO_STAGES: BusinessMicroStage[] = [
  { code: "C1.1", macro: "C1", title: "Quote Shared", trigger: "C0.10 complete", systemAction: "Send quote, EMI, brochure", owner: "Sales Executive", sla: "1 hr", exitCondition: "Quote delivered" },
  { code: "C1.2", macro: "C1", title: "Quote Reviewed", trigger: "Customer opens quote", systemAction: "Mark quote viewed; schedule follow-up", owner: "Sales Executive", sla: "2 hrs", exitCondition: "Customer understood" },
  { code: "C1.3", macro: "C1", title: "Objection", trigger: "Customer raises concern", systemAction: "Tag objection category", owner: "Sales Executive", sla: "Same day", exitCondition: "Objection captured" },
  { code: "C1.4", macro: "C1", title: "Affordability", trigger: "Price/EMI discussion", systemAction: "Capture DP, EMI, income", owner: "Sales Executive", sla: "Same day", exitCondition: "Affordability assessed" },
  { code: "C1.5", macro: "C1", title: "Finance Discussion", trigger: "Finance required", systemAction: "EMI, lender, CIBIL consent", owner: "Finance Executive", sla: "Same day", exitCondition: "Finance path confirmed" },
  { code: "C1.6", macro: "C1", title: "Negotiation", trigger: "Terms discussion", systemAction: "Capture discount, margin, deal terms", owner: "Sales Executive", sla: "Same day", exitCondition: "Terms aligned" },
  { code: "C1.7", macro: "C1", title: "Approval Loop", trigger: "Discount / exception", systemAction: "Route for manager approval", owner: "Sales Manager", sla: "4 hrs", exitCondition: "Approval recorded" },
  { code: "C1.8", macro: "C1", title: "Manager Support", trigger: "Hot lead stuck", systemAction: "Manager intervention call", owner: "Sales Manager", sla: "30 min", exitCondition: "Manager action logged" },
  { code: "C1.9", macro: "C1", title: "Decision Pending", trigger: "Customer delays", systemAction: "Set decision follow-up date", owner: "Sales Executive", sla: "Per agreement", exitCondition: "Decision received" },
  { code: "C1.10", macro: "C1", title: "Finance Ready", trigger: "Deal terms final", systemAction: "Handoff to C1A application", owner: "Finance Executive", sla: "24 hrs", exitCondition: "Move to C1A" },
];

export const C1A_MICRO_STAGES: BusinessMicroStage[] = [
  { code: "C1A.1", macro: "C1A", title: "Application", trigger: "Customer agrees finance", systemAction: "Create finance application", owner: "Finance Executive", sla: "Same day", exitCondition: "Application submitted" },
  { code: "C1A.2", macro: "C1A", title: "Documents", trigger: "Application created", systemAction: "Collect and verify KYC/income docs", owner: "Finance Executive", sla: "24 hrs", exitCondition: "Docs complete" },
  { code: "C1A.3", macro: "C1A", title: "FI", trigger: "Docs verified", systemAction: "Assign field investigation", owner: "Finance Executive", sla: "24 hrs", exitCondition: "FI assigned" },
  { code: "C1A.4", macro: "C1A", title: "Verification", trigger: "FI completed", systemAction: "Update verification outcome", owner: "Finance Executive", sla: "24 hrs", exitCondition: "Verification done" },
  { code: "C1A.5", macro: "C1A", title: "Approval", trigger: "Lender decision", systemAction: "Record approved / rejected / pending", owner: "Finance Executive", sla: "48 hrs", exitCondition: "Decision recorded" },
  { code: "C1A.6", macro: "C1A", title: "Margin", trigger: "Loan approved", systemAction: "Confirm down payment / margin", owner: "Finance Executive", sla: "Same day", exitCondition: "Margin confirmed" },
  { code: "C1A.7", macro: "C1A", title: "Variant Lock", trigger: "Margin confirmed", systemAction: "Lock product, variant, color", owner: "Sales Manager", sla: "Same day", exitCondition: "Variant locked" },
  { code: "C1A.8", macro: "C1A", title: "Addons", trigger: "Variant locked", systemAction: "Finalize accessories, body, insurance", owner: "Sales Executive", sla: "Same day", exitCondition: "Deal value final" },
  { code: "C1A.9", macro: "C1A", title: "Intent", trigger: "Deal final", systemAction: "Confirm booking intent", owner: "Sales Executive", sla: "Same day", exitCondition: "Move to C2" },
];

export const C2_MICRO_STAGES: BusinessMicroStage[] = [
  { code: "C2.1", macro: "C2", title: "Booking", trigger: "Booking amount received", systemAction: "Generate booking receipt", owner: "Accounts Executive", sla: "Same day", exitCondition: "Booking confirmed" },
  { code: "C2.2", macro: "C2", title: "Allocation", trigger: "Booking done", systemAction: "Allocate vehicle from stock", owner: "Stock Coordinator", sla: "Same day", exitCondition: "Vehicle allotted" },
  { code: "C2.3", macro: "C2", title: "Billing", trigger: "Allocation confirmed", systemAction: "Collect billing documents", owner: "Billing Executive", sla: "24 hrs", exitCondition: "Billing docs complete" },
  { code: "C2.4", macro: "C2", title: "Insurance", trigger: "Billing ready", systemAction: "Issue insurance policy", owner: "Insurance Coordinator", sla: "Same day", exitCondition: "Insurance active" },
  { code: "C2.5", macro: "C2", title: "Registration", trigger: "Insurance done", systemAction: "Submit RTO registration", owner: "RTO Coordinator", sla: "Per RTO", exitCondition: "Registration submitted" },
  { code: "C2.6", macro: "C2", title: "HSRP", trigger: "Registration done", systemAction: "Track HSRP plate status", owner: "Delivery Coordinator", sla: "Per RTO", exitCondition: "HSRP ready" },
  { code: "C2.7", macro: "C2", title: "PDI", trigger: "Vehicle ready", systemAction: "Complete pre-delivery inspection", owner: "PDI Inspector", sla: "Before delivery", exitCondition: "Move to C3" },
];

export const C3_MICRO_STAGES: BusinessMicroStage[] = [
  { code: "C3.1", macro: "C3", title: "Payment", trigger: "Delivery planned", systemAction: "Confirm final payment", owner: "Accounts Executive", sla: "Before delivery", exitCondition: "Payment complete" },
  { code: "C3.2", macro: "C3", title: "Vehicle Ready", trigger: "PDI approved", systemAction: "Prepare vehicle for handover", owner: "Delivery Coordinator", sla: "Same day", exitCondition: "Vehicle ready" },
  { code: "C3.3", macro: "C3", title: "Delivery", trigger: "Customer handover", systemAction: "Capture delivery proof", owner: "Delivery Coordinator", sla: "Delivery day", exitCondition: "Retail completed" },
  { code: "C3.4", macro: "C3", title: "Feedback", trigger: "Delivery complete", systemAction: "Send CSI / feedback form", owner: "CRM Executive", sla: "Day 1–3", exitCondition: "Feedback recorded" },
  { code: "C3.5", macro: "C3", title: "Referral", trigger: "Positive feedback", systemAction: "Request referral", owner: "CRM Executive", sla: "Day 7–45", exitCondition: "Referral captured" },
  { code: "C3.6", macro: "C3", title: "Lifecycle Activation", trigger: "Retail done", systemAction: "Activate L1–L7 programs", owner: "System", sla: "Instant", exitCondition: "Enter L1 Service" },
];

export const LIFECYCLE_MICRO_STAGES: BusinessMicroStage[] = LIFECYCLE_STAGES.map((s) => ({
  code: s.code,
  macro: "lifecycle" as const,
  title: s.name,
  trigger: `${s.name} program due`,
  systemAction: s.purpose,
  owner: "CRM Executive",
  sla: "Per program",
  exitCondition: "Campaign logged",
}));

export function getMicroStagesForMacro(macroId: import("./types").MacroStageId): BusinessMicroStage[] {
  switch (macroId) {
    case "c0": return C0_MICRO_STAGES;
    case "c1": return C1_MICRO_STAGES;
    case "c1a": return C1A_MICRO_STAGES;
    case "c2": return C2_MICRO_STAGES;
    case "c3": return C3_MICRO_STAGES;
    case "lifecycle": return LIFECYCLE_MICRO_STAGES;
    default: return [];
  }
}
