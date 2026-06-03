/**
 * ZentroFlow — AI Powered Automotive Revenue Lifecycle Platform
 * Macro funnel: C0 → C1 → C1A → C2 → C3 → Lifecycle (after C3)
 * Scoring, contact health, and action engine run parallel — not funnel stages.
 */

export const POSITIONING = {
  name: "ZentroFlow",
  tagline: "AI Powered Automotive Revenue Lifecycle Platform",
  description:
    "Lead intelligence + AI engagement + sales automation + finance flow + delivery management + service lifecycle + exchange / upgrade + referral revenue.",
  not: ["CRM only", "Lead management only", "WhatsApp bot only", "Dialer only"],
} as const;

/** Main automotive sales funnel — never use C0–C9 as macro stages */
export const MACRO_STAGES = [
  {
    id: "c0",
    code: "C0",
    name: "Lead Maturity",
    purpose: "Capture, clean, verify, engage, qualify, and score lead.",
    tabId: "c0" as const,
  },
  {
    id: "c1",
    code: "C1",
    name: "Sales Discussion & Objection",
    purpose: "Quotation, explanation, objection handling, affordability check.",
    tabId: "c1" as const,
  },
  {
    id: "c1a",
    code: "C1A",
    name: "Finance Approval & Intent",
    purpose: "Convert sales discussion into commercial readiness.",
    tabId: "c1a" as const,
  },
  {
    id: "c2",
    code: "C2",
    name: "Booking to Billing",
    purpose: "Complete booking and delivery preparation.",
    tabId: "c2" as const,
  },
  {
    id: "c3",
    code: "C3",
    name: "Retail / Delivery",
    purpose: "Complete sale and activate lifecycle.",
    tabId: "c3" as const,
  },
  {
    id: "lifecycle",
    code: "L",
    name: "Lifecycle Revenue Engine",
    purpose: "Turn one sale into 10-year revenue (service, referral, exchange, upgrade).",
    tabId: "lifecycle" as const,
  },
] as const;

export type MacroStageId = (typeof MACRO_STAGES)[number]["id"];

/** Parallel engines — support the journey, do not replace the funnel */
export const PARALLEL_ENGINES = [
  {
    id: "scoring",
    name: "Lead Scoring Engine",
    description: "Real-time score; Cold / Warm / Hot / Critical — runs on every activity",
    tabId: "scoring" as const,
  },
  {
    id: "contact-health",
    name: "Contact Health Engine",
    description: "Mobile, WhatsApp, call, email, territory, duplicate, contactability score",
    tabId: "contact-health" as const,
  },
  {
    id: "action",
    name: "Action Engine",
    description: "Every lead: one stage, one owner, one current action, next action, SLA",
    tabId: "action" as const,
  },
  {
    id: "sla",
    name: "SLA & Escalation",
    description: "P1 hot 5 min, quote follow-up 24h, finance docs 48h, booking stuck 72h",
    tabId: "workflow" as const,
  },
  {
    id: "re-engagement",
    name: "Re-engagement Engine",
    description: "Nurture, alternate finance, recycle, plan hold, tender follow-up",
    tabId: "workflow" as const,
  },
] as const;

export type MicroStage = {
  code: string;
  title: string;
  trigger: string;
  systemAction: string;
  owner: string;
  sla: string;
  exitCondition: string;
};

export const C0_MICRO_STAGES: MicroStage[] = [
  { code: "C0.1", title: "Lead Captured", trigger: "New lead enters", systemAction: "Generate Lead ID, Customer ID, Opportunity ID", owner: "System", sla: "Instant", exitCondition: "Lead saved" },
  { code: "C0.2", title: "Duplicate Check", trigger: "Mobile/email matched", systemAction: "Merge / reopen / create new opportunity", owner: "System + Manager if conflict", sla: "Instant", exitCondition: "Duplicate resolved" },
  { code: "C0.3", title: "Contact Health", trigger: "Mobile, WhatsApp, email, territory", systemAction: "Validate number, WA status, call status, territory", owner: "System", sla: "1 min", exitCondition: "Contactability score generated" },
  { code: "C0.4", title: "Bot Engagement", trigger: "WhatsApp active", systemAction: "Send welcome bot; collect product/location/timeline/finance", owner: "Bot", sla: "Immediate", exitCondition: "Customer replies or no response" },
  { code: "C0.5", title: "AI Call / Autodialer", trigger: "WA no reply / inactive", systemAction: "Priority call P1–P5", owner: "Dialer", sla: "5–30 min", exitCondition: "Connected / retry / dormant" },
  { code: "C0.6", title: "Lead Discovery", trigger: "Customer engaged", systemAction: "Capture usage, route, load, budget, pain point", owner: "Executive / Bot", sla: "Same day", exitCondition: "Requirement captured" },
  { code: "C0.7", title: "Qualification", trigger: "Discovery completed", systemAction: "Validate variant, budget, decision maker, timeline", owner: "Executive", sla: "Same day", exitCondition: "Qualified / not qualified" },
  { code: "C0.8", title: "Lead Scoring", trigger: "Any activity", systemAction: "Add/deduct score dynamically (parallel)", owner: "System", sla: "Real-time", exitCondition: "Cold/Warm/Hot/Critical assigned" },
  { code: "C0.9", title: "Next Best Action", trigger: "Score + stage + behavior", systemAction: "Suggest call, quote, finance, visit, nurture, escalation", owner: "System", sla: "Real-time", exitCondition: "Next action created" },
  { code: "C0.10", title: "Quote Readiness", trigger: "Variant + budget + timeline known", systemAction: "Allow quote only after mandatory fields", owner: "Executive + Manager", sla: "1 hr", exitCondition: "Move to C1" },
];

export const C1_MICRO_STAGES: MicroStage[] = [
  { code: "C1.1", title: "Quote Shared", trigger: "C0.10 complete", systemAction: "Send quote, EMI, brochure, comparison", owner: "Executive", sla: "1 hr", exitCondition: "Quote delivered" },
  { code: "C1.2", title: "Quote Acknowledged", trigger: "Customer opens / confirms", systemAction: "Mark quote received; schedule follow-up", owner: "System + Executive", sla: "2 hrs", exitCondition: "Customer understood" },
  { code: "C1.3", title: "Objection Captured", trigger: "Customer raises concern", systemAction: "Tag objection; auto-suggest script", owner: "Executive", sla: "Same day", exitCondition: "Objection tagged" },
  { code: "C1.4", title: "Affordability Check", trigger: "Price/EMI discussion", systemAction: "Capture DP, EMI, income, loan, margin", owner: "Executive / Finance", sla: "Same day", exitCondition: "Affordable / not affordable" },
  { code: "C1.5", title: "Finance Discussion", trigger: "Finance required", systemAction: "EMI, lender, CIBIL consent, doc checklist", owner: "Finance Team", sla: "Same day", exitCondition: "Finance eligibility started" },
  { code: "C1.6", title: "Competitor Mapping", trigger: "Customer comparing", systemAction: "Capture competitor offer; counter pitch", owner: "Executive", sla: "Same day", exitCondition: "Counter pitch generated" },
  { code: "C1.7", title: "Test Drive / Demo", trigger: "Customer asks demo", systemAction: "Schedule test drive / route demo", owner: "Executive", sla: "Same day", exitCondition: "Demo completed" },
  { code: "C1.8", title: "Manager Intervention", trigger: "Hot lead stuck / high value", systemAction: "Auto alert manager", owner: "Manager", sla: "30 min", exitCondition: "Manager action updated" },
  { code: "C1.9", title: "Nurture Hold", trigger: "Customer delays", systemAction: "Move to nurture with reason", owner: "System", sla: "Real-time", exitCondition: "Re-engagement date set" },
  { code: "C1.10", title: "Finance Eligibility Ready", trigger: "Finance details complete", systemAction: "Move to C1A or alternate finance queue", owner: "Finance Team", sla: "24 hrs", exitCondition: "Application ready" },
];

export const C1A_MICRO_STAGES: MicroStage[] = [
  { code: "C1A.1", title: "Application Submitted", trigger: "Customer agrees finance", systemAction: "Create finance case", owner: "Finance Team", sla: "Same day", exitCondition: "Application ID created" },
  { code: "C1A.2", title: "Docs Collected", trigger: "Document upload", systemAction: "Verify PAN, Aadhaar, bank, income", owner: "Finance Team", sla: "24 hrs", exitCondition: "Docs complete" },
  { code: "C1A.3", title: "FI Assigned", trigger: "Docs verified", systemAction: "Assign field investigation", owner: "Finance Team", sla: "24 hrs", exitCondition: "FI assigned" },
  { code: "C1A.4", title: "Verification Done", trigger: "FI completed", systemAction: "Update verification result", owner: "Finance Team", sla: "24 hrs", exitCondition: "FI passed/failed" },
  { code: "C1A.5", title: "Decision", trigger: "Lender decision", systemAction: "Approved / rejected / pending", owner: "Finance Team", sla: "48 hrs", exitCondition: "Decision recorded" },
  { code: "C1A.6", title: "Approval Received", trigger: "Loan approved", systemAction: "Share sanction details", owner: "Finance Team", sla: "Same day", exitCondition: "Approval confirmed" },
  { code: "C1A.7", title: "Margin Confirmed", trigger: "DP/margin discussed", systemAction: "Collect margin commitment", owner: "Executive + Finance", sla: "Same day", exitCondition: "Margin confirmed" },
  { code: "C1A.8", title: "Variant Locked", trigger: "Customer confirms model", systemAction: "Lock product/variant/color", owner: "Sales Manager", sla: "Same day", exitCondition: "Variant locked" },
  { code: "C1A.9", title: "Add-ons Finalized", trigger: "Body, insurance, accessories", systemAction: "Finalize add-ons", owner: "Executive", sla: "Same day", exitCondition: "Final deal value ready" },
  { code: "C1A.10", title: "Payment / Booking Intent", trigger: "Customer ready", systemAction: "Trigger booking workflow", owner: "Executive", sla: "Same day", exitCondition: "Move to C2" },
];

export const C2_MICRO_STAGES: MicroStage[] = [
  { code: "C2.1", title: "Booking Done", trigger: "Booking amount received", systemAction: "Generate booking receipt", owner: "Accounts / Sales", sla: "Same day", exitCondition: "Booking confirmed" },
  { code: "C2.2", title: "Vehicle Allocation", trigger: "Booking done", systemAction: "Allocate vehicle from stock", owner: "Stock Team", sla: "Same day", exitCondition: "Vehicle allotted" },
  { code: "C2.3", title: "Variant Lock", trigger: "Allocation confirmed", systemAction: "Freeze variant/color/model", owner: "Sales Manager", sla: "Same day", exitCondition: "No change without approval" },
  { code: "C2.4", title: "Billing Docs", trigger: "Customer docs pending", systemAction: "Send doc checklist + reminder", owner: "Billing Team", sla: "24 hrs", exitCondition: "Docs complete" },
  { code: "C2.5", title: "Disbursement", trigger: "Finance approved", systemAction: "Track lender disbursement", owner: "Finance Team", sla: "24–48 hrs", exitCondition: "Payment received" },
  { code: "C2.6", title: "Down Payment", trigger: "Margin pending", systemAction: "Payment reminder + receipt", owner: "Accounts", sla: "Same day", exitCondition: "DP received" },
  { code: "C2.7", title: "Insurance", trigger: "Billing ready", systemAction: "Generate insurance quote/policy", owner: "Insurance Team", sla: "Same day", exitCondition: "Insurance active" },
  { code: "C2.8", title: "Registration", trigger: "Insurance done", systemAction: "Start RTO process", owner: "RTO Team", sla: "As per RTO", exitCondition: "Registration submitted" },
  { code: "C2.9", title: "HSRP", trigger: "Registration done", systemAction: "Track HSRP status", owner: "Delivery Team", sla: "As per RTO", exitCondition: "HSRP ready" },
  { code: "C2.10", title: "PDI", trigger: "Vehicle ready", systemAction: "Conduct PDI checklist", owner: "PDI Team", sla: "Before delivery", exitCondition: "Vehicle delivery-ready" },
];

export const C3_MICRO_STAGES: MicroStage[] = [
  { code: "C3.1", title: "Final Payment", trigger: "Delivery planned", systemAction: "Confirm full payment", owner: "Accounts", sla: "Before delivery", exitCondition: "Payment complete" },
  { code: "C3.2", title: "Insurance Active", trigger: "Policy issued", systemAction: "Verify policy details", owner: "Insurance Team", sla: "Before delivery", exitCondition: "Insurance valid" },
  { code: "C3.3", title: "Registration Complete", trigger: "RTO done", systemAction: "Update RC/temporary number", owner: "RTO Team", sla: "Before delivery", exitCondition: "Registration complete" },
  { code: "C3.4", title: "PDI Complete", trigger: "Checklist submitted", systemAction: "Approve delivery readiness", owner: "PDI Manager", sla: "Before delivery", exitCondition: "PDI approved" },
  { code: "C3.5", title: "Vehicle Ready", trigger: "All checks complete", systemAction: "Clean vehicle, fuel, accessories", owner: "Delivery Team", sla: "Same day", exitCondition: "Ready for handover" },
  { code: "C3.6", title: "Delivery Done", trigger: "Customer receives vehicle", systemAction: "Capture delivery proof/photo", owner: "Delivery Team", sla: "Delivery day", exitCondition: "Retail completed" },
  { code: "C3.7", title: "Feedback Taken", trigger: "Delivery complete", systemAction: "Send feedback/CSI form", owner: "CRM Team", sla: "Day 1–3", exitCondition: "Feedback recorded" },
  { code: "C3.8", title: "Testimonial Captured", trigger: "Happy customer", systemAction: "Ask photo/video testimonial", owner: "CRM / Sales", sla: "Day 1–7", exitCondition: "Testimonial stored" },
  { code: "C3.9", title: "Referral Asked", trigger: "Positive feedback", systemAction: "Trigger referral request", owner: "CRM / Bot", sla: "Day 7–45", exitCondition: "Referral captured" },
  { code: "C3.10", title: "Lifecycle Activated", trigger: "Retail done", systemAction: "Start service, insurance, upgrade lifecycle", owner: "System", sla: "Instant", exitCondition: "Customer moved to lifecycle" },
];

export const LIFECYCLE_MICRO_STAGES: MicroStage[] = [
  { code: "L1", title: "Service Reminder", trigger: "Day 30 / service due", systemAction: "Service due reminder", owner: "Service Team", sla: "Day 30", exitCondition: "Service booked or logged" },
  { code: "L2", title: "Insurance Renewal", trigger: "180 days / 1 year", systemAction: "Renewal campaign", owner: "CRM Team", sla: "Per policy", exitCondition: "Renewal tracked" },
  { code: "L3", title: "AMC Campaign", trigger: "Ownership active", systemAction: "AMC promotion", owner: "Service Team", sla: "Day 90+", exitCondition: "AMC offered" },
  { code: "L4", title: "Upgrade Campaign", trigger: "3 years", systemAction: "Upgrade offer", owner: "Sales Team", sla: "3 years", exitCondition: "Upgrade lead created" },
  { code: "L5", title: "Exchange Campaign", trigger: "5 years / high KM", systemAction: "Exchange valuation", owner: "Used Vehicle Team", sla: "5 years", exitCondition: "Exchange lead created" },
  { code: "L6", title: "Repeat Purchase", trigger: "Eligible customer", systemAction: "New vehicle pitch", owner: "Sales Team", sla: "Ongoing", exitCondition: "New opportunity in C0" },
  { code: "L7", title: "Referral Program", trigger: "Day 7–45 post delivery", systemAction: "Referral generation", owner: "CRM Team", sla: "Day 7–45", exitCondition: "Referral captured" },
];

export const LIFECYCLE_TIMELINE = [
  { day: "Day 1", action: "Thank-you message", owner: "Bot" },
  { day: "Day 3", action: "Delivery feedback", owner: "CRM" },
  { day: "Day 7", action: "Usage tips / video", owner: "Bot" },
  { day: "Day 15", action: "Mileage guidance", owner: "Bot" },
  { day: "Day 30", action: "Service reminder", owner: "Service Team" },
  { day: "Day 90", action: "Service / insurance / accessory pitch", owner: "CRM" },
  { day: "180 Days", action: "Insurance / maintenance reminder", owner: "CRM" },
  { day: "1 Year", action: "Insurance renewal + service package", owner: "CRM" },
  { day: "3 Years", action: "Upgrade campaign", owner: "Sales" },
  { day: "5 Years", action: "Exchange valuation campaign", owner: "Used Vehicle" },
] as const;

export const SCORING_RULES = [
  { activity: "Call answered", points: 10 },
  { activity: "WhatsApp reply", points: 15 },
  { activity: "Brochure viewed", points: 10 },
  { activity: "Finance inquiry", points: 20 },
  { activity: "Test drive request", points: 30 },
  { activity: "No response", points: -10 },
  { activity: "Wrong number", points: -100 },
] as const;

export const SCORE_BANDS = [
  { label: "Hot", min: 80, max: 999 },
  { label: "Warm", min: 50, max: 79 },
  { label: "Cold", min: 20, max: 49 },
  { label: "Nurture", min: 0, max: 19 },
  { label: "Critical", min: 90, max: 999, note: "High-priority overlay on Hot" },
] as const;

export const DIALER_PRIORITIES = [
  { code: "P1", label: "Hot callback", description: "Hot lead / callback requested" },
  { code: "P2", label: "WA read no reply", description: "WhatsApp read but no response" },
  { code: "P3", label: "WA inactive", description: "WhatsApp not active" },
  { code: "P4", label: "Fresh no response", description: "Fresh lead no response" },
  { code: "P5", label: "Dormant old lead", description: "Dormant / recycle queue" },
] as const;

export const C1_OBJECTION_CATEGORIES = [
  "Price", "Discount", "Delivery", "Registration", "Insurance", "Finance",
  "Down payment", "Body fabrication", "Past issue", "Aftersales",
  "Competition offer", "Behaviour", "Plan hold", "Tender postponed",
] as const;

export const DUPLICATE_TYPES = [
  "EXACT_DUPLICATE", "POSSIBLE_DUPLICATE", "REOPENED", "EXISTING_CUSTOMER",
  "UPGRADE", "CROSS_SELL", "FLEET_EXPANSION", "EXCHANGE", "NEW",
] as const;

export const LEAD_TYPES = [
  "New Lead", "Duplicate Lead", "Reopened Lead", "Existing Customer Lead",
  "Cross-Sell Lead", "Upgrade Lead", "Exchange Lead", "Fleet Expansion Lead",
] as const;

/** Golden rule — every lead record must always have these */
export const LEAD_BACKBONE_FIELDS = [
  { key: "macroStage", label: "Current Macro Stage", example: "C1" },
  { key: "microStage", label: "Current Micro Stage", example: "C1.5 Finance Discussion" },
  { key: "currentOwner", label: "Current Owner", example: "Finance Executive" },
  { key: "currentAction", label: "Current Action", example: "Collect CIBIL Consent" },
  { key: "nextAction", label: "Next Action", example: "Generate Eligibility Report" },
  { key: "nextOwner", label: "Next Owner", example: "Finance Executive" },
  { key: "nextActionAt", label: "Next Action Date", example: "2026-06-03 18:00" },
  { key: "priority", label: "Priority", example: "P1" },
  { key: "leadScore", label: "Lead Score", example: "72 (Warm)" },
  { key: "sla", label: "SLA", example: "4 Hours" },
  { key: "escalationOwner", label: "Escalation Owner", example: "Finance Manager" },
  { key: "status", label: "Status", example: "Open" },
] as const;

export const PLATFORM_EVENTS = [
  "lead.created", "lead.verified", "lead.engaged", "lead.qualified", "lead.scored",
  "quote.shared", "objection.captured", "finance.started", "finance.approved",
  "booking.done", "vehicle.allocated", "delivery.done", "service.due",
  "exchange.eligible", "referral.requested",
] as const;

export const DATABASE_TABLES = [
  "customer_master", "lead_master", "lead_activity", "lead_stage_history", "lead_score",
  "vehicle_interest", "quotation_master", "booking_master", "delivery_master",
  "service_history", "exchange_vehicle", "inspection_reports", "campaign_master",
  "automation_rules", "communication_logs", "task_master", "employee_master", "branch_master",
] as const;

export const REPORTING_STAGES = [
  "New", "Contacted", "Qualified", "Hot", "Warm", "Cold", "Follow-up",
  "Negotiation", "Booked", "Delivered", "Lost", "Invalid",
] as const;

export function getMicroStagesForMacro(macroId: MacroStageId): MicroStage[] {
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
