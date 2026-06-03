/**
 * ZentroFlow — positioning, navigation metadata, and constants not tied to stage definitions.
 */

export const POSITIONING = {
  name: "ZentroFlow",
  tagline: "AI Powered Automotive Revenue Lifecycle Platform",
  description:
    "Lead intelligence + AI engagement + sales automation + finance flow + delivery management + service lifecycle + exchange / upgrade + referral revenue.",
  not: ["CRM only", "Lead management only", "WhatsApp bot only", "Dialer only"],
} as const;

/** Five reportable sales stages + lifecycle (L1–L7) */
export const MACRO_STAGES = [
  { id: "c0", code: "C0", name: "Lead Maturity", purpose: "Contact through quote readiness", tabId: "c0" as const },
  { id: "c1", code: "C1", name: "Sales Discussion", purpose: "Quote, objection, negotiation", tabId: "c1" as const },
  { id: "c1a", code: "C1A", name: "Finance Approval & Intent", purpose: "Convert sales discussion into commercial readiness", tabId: "c1a" as const },
  { id: "c2", code: "C2", name: "Booking to Billing", purpose: "Complete booking and delivery preparation", tabId: "c2" as const },
  { id: "c3", code: "C3", name: "Retail / Delivery", purpose: "Complete sale and activate lifecycle", tabId: "c3" as const },
  { id: "lifecycle", code: "L", name: "Lifecycle Revenue", purpose: "L1 Service through L7 Referral", tabId: "lifecycle" as const },
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

export const LIFECYCLE_TIMELINE = [
  { day: "Day 1", action: "Thank-you message", owner: "CRM Executive" },
  { day: "Day 3", action: "Delivery feedback", owner: "CRM Executive" },
  { day: "Day 7", action: "Usage tips / video", owner: "CRM Executive" },
  { day: "Day 15", action: "Mileage guidance", owner: "CRM Executive" },
  { day: "Day 30", action: "Service reminder (L1)", owner: "Service Coordinator" },
  { day: "Day 90", action: "AMC pitch (L3)", owner: "Service Coordinator" },
  { day: "180 Days", action: "Insurance renewal (L2)", owner: "CRM Executive" },
  { day: "1 Year", action: "Insurance renewal + service package", owner: "CRM Executive" },
  { day: "3 Years", action: "Upgrade campaign (L4)", owner: "Sales Executive" },
  { day: "5 Years", action: "Exchange valuation (L5)", owner: "Used Vehicle Executive" },
] as const;

export const DUPLICATE_TYPES = [
  "Exact Duplicate", "Cross Sell", "Upgrade", "Exchange",
  "Fleet Expansion", "Existing Customer Opportunity", "Reopened Opportunity", "New Opportunity",
] as const;

export const LEAD_TYPES = [
  "New Opportunity", "Cross Sell Opportunity", "Upgrade Opportunity", "Exchange Opportunity",
  "Fleet Expansion Opportunity", "Existing Customer Opportunity", "Reopened Opportunity",
] as const;

/** Backbone fields — sourced from opportunity_master, displayed on every card */
export const LEAD_BACKBONE_FIELDS = [
  { key: "currentStage", label: "Current Stage", example: "C1" },
  { key: "microStage", label: "Current Micro Stage", example: "C1.5 Finance Discussion" },
  { key: "currentOwner", label: "Current Owner", example: "Finance Executive" },
  { key: "currentAction", label: "Current Action", example: "Collect CIBIL Consent" },
  { key: "nextAction", label: "Next Action", example: "Generate Eligibility Report" },
  { key: "nextActionAt", label: "Next Action Date", example: "2026-06-03 18:00" },
  { key: "priority", label: "Priority", example: "P1" },
  { key: "leadScore", label: "Lead Score", example: "72 (Warm)" },
  { key: "slaTime", label: "SLA", example: "4 Hours" },
  { key: "escalationOwner", label: "Escalation Owner", example: "Finance Manager" },
  { key: "status", label: "Status", example: "Open" },
] as const;

export const DATABASE_TABLES = [
  "customer_master",
  "opportunity_master",
  "lead_activity",
  "stage_history",
  "communication_logs",
  "contact_health_attributes",
  "lead_score_ledger",
  "opportunity_ownership",
  "sla_tracking",
  "domain_event_outbox",
] as const;
