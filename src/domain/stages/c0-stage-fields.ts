import { classifyScore } from "@/domain/engines/scoring";

/** C0 Lead Maturity — per-step form fields for Lead Detail journey (manual entry; automation later). */

export type StageFieldType = "text" | "textarea" | "select" | "number" | "date";

export type StageFieldOption = { value: string; label: string };

export type StageFieldDef = {
  key: string;
  label: string;
  type: StageFieldType;
  options?: StageFieldOption[];
  placeholder?: string;
  hint?: string;
  readOnly?: boolean;
  fullWidth?: boolean;
};

const SELECT = { value: "", label: "— Select —" };

export const YES_NO: StageFieldOption[] = [
  SELECT,
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const VALID_STATUS: StageFieldOption[] = [
  SELECT,
  { value: "valid", label: "Valid" },
  { value: "invalid", label: "Invalid" },
  { value: "pending", label: "Pending verification" },
];

export const PRIORITY_OPTIONS: StageFieldOption[] = [
  SELECT,
  { value: "P1", label: "P1 — Hot callback" },
  { value: "P2", label: "P2 — WhatsApp read no reply" },
  { value: "P3", label: "P3 — WhatsApp inactive" },
  { value: "P4", label: "P4 — Fresh no response" },
  { value: "P5", label: "P5 — Dormant old lead" },
];

export const TIMELINE_OPTIONS: StageFieldOption[] = [
  SELECT,
  { value: "immediate", label: "Immediate" },
  { value: "1-2_weeks", label: "1–2 weeks" },
  { value: "1_month", label: "Within 1 month" },
  { value: "3_months", label: "Within 3 months" },
  { value: "6_plus", label: "6+ months" },
  { value: "unknown", label: "Unknown" },
];

export const FINANCE_CASH_OPTIONS: StageFieldOption[] = [
  SELECT,
  { value: "cash", label: "Cash" },
  { value: "finance", label: "Finance" },
  { value: "both", label: "Both" },
  { value: "undecided", label: "Undecided" },
];

export const KNOWN_STATUS: StageFieldOption[] = [
  SELECT,
  { value: "yes", label: "Yes — known" },
  { value: "no", label: "No — not yet" },
  { value: "partial", label: "Partially known" },
];

export const SCORE_OUTPUT_OPTIONS: StageFieldOption[] = [
  SELECT,
  { value: "Cold", label: "Cold" },
  { value: "Warm", label: "Warm" },
  { value: "Hot", label: "Hot" },
  { value: "Critical", label: "Critical" },
];

export const SOURCE_OPTIONS: StageFieldOption[] = [
  SELECT,
  { value: "website", label: "Website" },
  { value: "walk_in", label: "Walk-in" },
  { value: "referral", label: "Referral" },
  { value: "campaign", label: "Campaign" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
  { value: "excel", label: "Excel import" },
  { value: "other", label: "Other" },
];

export const DUPLICATE_STATUS: StageFieldOption[] = [
  SELECT,
  { value: "unique", label: "Unique — no duplicate" },
  { value: "duplicate_found", label: "Duplicate found" },
  { value: "merged", label: "Merged with existing" },
  { value: "pending", label: "Pending check" },
];

export const CALL_OUTCOME_OPTIONS: StageFieldOption[] = [
  SELECT,
  { value: "answered", label: "Answered" },
  { value: "no_answer", label: "No answer" },
  { value: "busy", label: "Busy" },
  { value: "wrong_number", label: "Wrong number" },
  { value: "callback_scheduled", label: "Callback scheduled" },
  { value: "voicemail", label: "Voicemail" },
];

export const BUYER_TYPE_OPTIONS: StageFieldOption[] = [
  SELECT,
  { value: "individual", label: "Individual" },
  { value: "fleet", label: "Fleet" },
  { value: "dealer", label: "Dealer" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

export const QUALIFICATION_STATUS: StageFieldOption[] = [
  SELECT,
  { value: "qualified", label: "Qualified" },
  { value: "not_qualified", label: "Not qualified" },
  { value: "nurture", label: "Move to nurture" },
];

export const NEXT_BEST_ACTIONS: StageFieldOption[] = [
  SELECT,
  { value: "send_brochure", label: "Send brochure" },
  { value: "schedule_call", label: "Schedule call" },
  { value: "assign_executive", label: "Assign executive" },
  { value: "send_emi", label: "Send EMI" },
  { value: "arrange_visit", label: "Arrange visit" },
  { value: "move_nurture", label: "Move to nurture" },
  { value: "escalate", label: "Escalate" },
  { value: "other", label: "Other" },
];

export const SCORING_SIGNAL: StageFieldOption[] = [
  SELECT,
  { value: "yes", label: "Yes (+points apply)" },
  { value: "no", label: "No" },
];

export const C0_STAGE_FIELDS: Record<string, StageFieldDef[]> = {
  "C0.1": [
    { key: "source", label: "Source", type: "select", options: SOURCE_OPTIONS },
    { key: "campaign", label: "Campaign", type: "text", placeholder: "Campaign name / UTM" },
    { key: "product", label: "Product", type: "text", placeholder: "e.g. LPT1916" },
    { key: "territory", label: "Territory / branch", type: "text", placeholder: "District or branch" },
    { key: "customer_name", label: "Customer name", type: "text" },
    { key: "customer_mobile", label: "Mobile", type: "text" },
    { key: "customer_email", label: "Email", type: "text", placeholder: "Optional" },
    { key: "customer_address", label: "Address / location", type: "textarea", fullWidth: true },
  ],
  "C0.2": [
    { key: "customer_id", label: "Customer ID", type: "text", readOnly: true },
    { key: "lead_id", label: "Lead ID", type: "text", readOnly: true },
    { key: "opportunity_id", label: "Opportunity ID", type: "text", readOnly: true },
    { key: "duplicate_status", label: "Duplicate status", type: "select", options: DUPLICATE_STATUS },
    { key: "duplicate_of_lead_id", label: "Duplicate of (Lead ID)", type: "text", placeholder: "If duplicate found" },
  ],
  "C0.3": [
    { key: "mobile_valid", label: "Mobile valid", type: "select", options: VALID_STATUS },
    { key: "whatsapp_active", label: "WhatsApp active", type: "select", options: VALID_STATUS },
    { key: "call_reachable", label: "Call reachable", type: "select", options: VALID_STATUS },
    { key: "email_valid", label: "Email valid", type: "select", options: VALID_STATUS },
    { key: "territory_valid", label: "Territory valid", type: "select", options: VALID_STATUS },
    { key: "duplicate_status", label: "Duplicate status", type: "select", options: DUPLICATE_STATUS },
    { key: "contactability_score", label: "Contactability score (0–100)", type: "number", placeholder: "0–100" },
  ],
  "C0.4": [
    { key: "product_required", label: "Product required", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "purchase_timeline", label: "Purchase timeline", type: "select", options: TIMELINE_OPTIONS },
    { key: "finance_or_cash", label: "Finance or cash", type: "select", options: FINANCE_CASH_OPTIONS },
    { key: "callback_need", label: "Callback needed", type: "select", options: YES_NO },
    { key: "quote_need", label: "Quote needed", type: "select", options: YES_NO },
    { key: "test_drive_need", label: "Test drive needed", type: "select", options: YES_NO },
    { key: "bot_response_summary", label: "Bot conversation summary", type: "textarea", fullWidth: true },
  ],
  "C0.5": [
    { key: "call_priority", label: "Call priority", type: "select", options: PRIORITY_OPTIONS },
    { key: "priority_reason", label: "Priority reason", type: "text", placeholder: "Why this priority band" },
    { key: "call_attempts", label: "Call attempts", type: "number", placeholder: "1" },
    { key: "call_outcome", label: "Call outcome", type: "select", options: CALL_OUTCOME_OPTIONS },
    { key: "ai_summary", label: "AI / call summary", type: "textarea", fullWidth: true },
  ],
  "C0.6": [
    { key: "usage", label: "Usage", type: "text", placeholder: "Application / usage type" },
    { key: "route", label: "Route", type: "text" },
    { key: "load", label: "Load", type: "text", placeholder: "Payload / tonnage" },
    { key: "existing_vehicle", label: "Existing vehicle", type: "text" },
    { key: "pain_point", label: "Pain point", type: "textarea", fullWidth: true },
    { key: "budget", label: "Budget", type: "text", placeholder: "Budget band or amount" },
    { key: "timeline", label: "Timeline", type: "select", options: TIMELINE_OPTIONS },
    { key: "buyer_type", label: "Buyer type", type: "select", options: BUYER_TYPE_OPTIONS },
    { key: "finance_need", label: "Finance need", type: "select", options: FINANCE_CASH_OPTIONS },
  ],
  "C0.7": [
    { key: "vehicle_type", label: "Vehicle type", type: "text" },
    { key: "variant", label: "Variant", type: "text" },
    { key: "budget", label: "Budget", type: "text" },
    { key: "finance", label: "Finance", type: "select", options: FINANCE_CASH_OPTIONS },
    { key: "exchange", label: "Exchange", type: "select", options: YES_NO },
    { key: "decision_maker", label: "Decision maker", type: "text" },
    { key: "competition", label: "Competition", type: "text", placeholder: "Competitor brands / offers" },
    { key: "timeline", label: "Timeline", type: "select", options: TIMELINE_OPTIONS },
    { key: "qualification_status", label: "Qualification result", type: "select", options: QUALIFICATION_STATUS },
  ],
  "C0.8": [
    { key: "call_answered", label: "Call answered (+10)", type: "select", options: SCORING_SIGNAL },
    { key: "whatsapp_reply", label: "WhatsApp reply (+15)", type: "select", options: SCORING_SIGNAL },
    { key: "brochure_viewed", label: "Brochure viewed (+10)", type: "select", options: SCORING_SIGNAL },
    { key: "finance_inquiry", label: "Finance inquiry (+20)", type: "select", options: SCORING_SIGNAL },
    { key: "test_drive_request", label: "Test drive request (+30)", type: "select", options: SCORING_SIGNAL },
    { key: "no_response", label: "No response (−10)", type: "select", options: SCORING_SIGNAL },
    { key: "wrong_number", label: "Wrong number (−100)", type: "select", options: SCORING_SIGNAL },
    { key: "calculated_score", label: "Lead score (manual)", type: "number", placeholder: "Total score" },
    { key: "score_output", label: "Score output", type: "select", options: SCORE_OUTPUT_OPTIONS },
    { key: "priority", label: "Priority", type: "select", options: PRIORITY_OPTIONS },
  ],
  "C0.9": [
    { key: "suggested_action", label: "Next best action", type: "select", options: NEXT_BEST_ACTIONS },
    { key: "assigned_owner", label: "Assigned owner", type: "text" },
    { key: "action_due", label: "Action due date", type: "date" },
    { key: "action_notes", label: "Action notes", type: "textarea", fullWidth: true },
  ],
  "C0.10": [
    { key: "variant_known", label: "Variant known", type: "select", options: KNOWN_STATUS },
    { key: "budget_discussed", label: "Budget discussed", type: "select", options: KNOWN_STATUS },
    { key: "finance_need_known", label: "Finance need known", type: "select", options: KNOWN_STATUS },
    { key: "decision_maker_known", label: "Decision maker known", type: "select", options: KNOWN_STATUS },
    { key: "timeline_known", label: "Timeline known", type: "select", options: KNOWN_STATUS },
    { key: "competition_known", label: "Competition known", type: "select", options: KNOWN_STATUS },
    { key: "ready_for_c1", label: "Ready to move to C1", type: "select", options: [
      SELECT,
      { value: "ready", label: "Ready — all criteria met" },
      { value: "not_ready", label: "Not ready yet" },
    ] },
  ],
};

export const C0_STAGE_PURPOSE =
  "Capture, clean, verify, engage, qualify, and score lead before quote readiness.";

/** What each C0 step captures — shown as checklist on Lead Detail */
export const C0_STAGE_CHECKLIST: Record<string, readonly string[]> = {
  "C0.1": ["Source", "Campaign", "Product", "Territory", "Customer details"],
  "C0.2": ["Customer ID", "Lead ID", "Opportunity ID", "Duplicate check"],
  "C0.3": [
    "Mobile valid",
    "WhatsApp active",
    "Call reachable",
    "Email valid",
    "Territory valid",
    "Duplicate status",
    "Contactability score",
  ],
  "C0.4": [
    "Product required",
    "Location",
    "Purchase timeline",
    "Finance or cash",
    "Callback / quote / test drive need",
  ],
  "C0.5": [
    "P1 Hot callback",
    "P2 WhatsApp read no reply",
    "P3 WhatsApp inactive",
    "P4 Fresh no response",
    "P5 Dormant old lead",
  ],
  "C0.6": [
    "Usage",
    "Route",
    "Load",
    "Existing vehicle",
    "Pain point",
    "Budget",
    "Timeline",
    "Buyer type",
    "Finance need",
  ],
  "C0.7": [
    "Vehicle type",
    "Variant",
    "Budget",
    "Finance",
    "Exchange",
    "Decision maker",
    "Competition",
    "Timeline",
  ],
  "C0.8": [
    "Call answered +10",
    "WhatsApp reply +15",
    "Brochure viewed +10",
    "Finance inquiry +20",
    "Test drive request +30",
    "No response −10",
    "Wrong number −100",
    "Output: Cold / Warm / Hot / Critical",
  ],
  "C0.9": [
    "Send brochure",
    "Schedule call",
    "Assign executive",
    "Send EMI",
    "Arrange visit",
    "Move to nurture",
    "Escalate",
  ],
  "C0.10": [
    "Variant known",
    "Budget discussed",
    "Finance need known",
    "Decision maker known",
    "Timeline known",
    "Competition known",
  ],
};

const C0_SCORE_POINTS: Record<string, number> = {
  call_answered: 10,
  whatsapp_reply: 15,
  brochure_viewed: 10,
  finance_inquiry: 20,
  test_drive_request: 30,
  no_response: -10,
  wrong_number: -100,
};

/** Auto-calculate score from C0.8 signal dropdowns (automation can overwrite later). */
export function computeC0ScoreFromFields(fields: Record<string, string>): {
  score: number;
  output: ReturnType<typeof classifyScore>;
} {
  let score = 0;
  for (const [key, points] of Object.entries(C0_SCORE_POINTS)) {
    if (fields[key] === "yes") score += points;
  }
  return { score, output: classifyScore(Math.max(score, 0)) };
}

export function formatFieldValue(field: StageFieldDef, raw: string | undefined): string {
  if (!raw) return "—";
  if (field.type === "select" && field.options) {
    return field.options.find((o) => o.value === raw)?.label ?? raw;
  }
  return raw;
}

/** Build label/value rows for status grids from saved step fields */
export function buildStatusGridFromStep(
  code: string,
  rawFields?: Record<string, string | number | boolean>,
): [string, string][] {
  const defs = getC0StageFields(code);
  if (!defs.length || !rawFields) return [];
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawFields)) {
    fields[k] = v === undefined || v === null ? "" : String(v);
  }
  return defs
    .filter((d) => !d.readOnly)
    .map((d) => [d.label, formatFieldValue(d, fields[d.key])]);
}

export function isC0Stage(code: string): boolean {
  return code.startsWith("C0.");
}

export function getC0StageFields(code: string): StageFieldDef[] {
  return C0_STAGE_FIELDS[code] ?? [];
}

/** Seed empty forms from lead / opportunity backbone (automation can overwrite later). */
export function getC0StagePrefill(
  code: string,
  lead: {
    customerName: string;
    mobile: string;
    email?: string;
    district: string;
    product: string;
    source: string;
    campaign?: string;
    branch: string;
    customerId: string;
    leadId: string;
    opportunityId: string;
    leadScore: number;
    scoreLabel: string;
    priority: string;
    currentOwner: string;
    nextAction: string;
  },
  opportunity?: { variant?: string | null },
): Record<string, string> {
  switch (code) {
    case "C0.1":
      return {
        source: lead.source?.toLowerCase().replace(/\s+/g, "_") ?? "",
        campaign: lead.campaign ?? "",
        product: lead.product,
        territory: lead.branch || lead.district,
        customer_name: lead.customerName,
        customer_mobile: lead.mobile,
        customer_email: lead.email ?? "",
      };
    case "C0.2":
      return {
        customer_id: lead.customerId,
        lead_id: lead.leadId,
        opportunity_id: lead.opportunityId,
        duplicate_status: "unique",
      };
    case "C0.5":
      return { call_priority: lead.priority };
    case "C0.7":
      return { variant: opportunity?.variant ?? "" };
    case "C0.8":
      return {
        calculated_score: String(lead.leadScore),
        score_output: lead.scoreLabel,
        priority: lead.priority,
      };
    case "C0.9":
      return {
        assigned_owner: lead.currentOwner,
        suggested_action: "",
        action_notes: lead.nextAction,
      };
    default:
      return {};
  }
}
