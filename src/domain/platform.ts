/**
 * Zentroverse platform model — maps product spec to developer-facing entities & flows.
 */

/** Client-facing engine names — match product architecture */
export const CORE_ENGINES = [
  { id: "intake", name: "Lead Intake Engine", description: "All sources into one CRM" },
  { id: "engagement", name: "AI Engagement Engine", description: "WhatsApp bot on every new lead" },
  { id: "classification", name: "AI Classification Engine", description: "Scores, tags, and next-best action" },
  { id: "action", name: "Action Engine", description: "Dialer, sales queues, and automation" },
  { id: "lifecycle", name: "Lifecycle Automation Engine", description: "Post-sale through renewals and upsell" },
] as const;

/** Canonical master journey (8 steps) — UI labels only */
export const MASTER_FLOW_STEPS = [
  "Lead Source",
  "Lead Capture (CRM)",
  "AI Engagement (WhatsApp Bot)",
  "AI Classification",
  "Action Engine",
  "Conversion OR Recycling",
  "Lifecycle Automation (Post-Sale)",
  "Continuous Engagement",
] as const;

export const LEAD_SOURCES = [
  "Walk-in",
  "Website / App",
  "Meta Ads",
  "Google Ads",
  "Field Team App",
  "Referral / Call",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const CLASSIFICATION_PRE_SALES = [
  "New – Unresponsive",
  "New – Engaged",
  "Warm – Interested",
  "Hot – Ready to Buy",
  "Finance Required",
  "Test Drive Required",
] as const;

export const CLASSIFICATION_LOST = [
  "Lost – Price",
  "Lost – Postponed",
  "Lost – No Response",
] as const;

export const DEDUP_PRIMARY_KEY = "mobile" as const;

/** Developer module checklist from spec */
export const DEVELOPER_MODULES = [
  "Lead Management System",
  "WhatsApp Bot Engine",
  "AI Classification Engine",
  "Auto Dialer Integration",
  "Workflow Automation Engine",
  "Lifecycle Management Module",
  "Notification System",
  "Analytics Dashboard",
] as const;

/** Core DB entities */
export const DATA_ENTITIES = [
  "Leads",
  "Customers",
  "Interactions (bot + call)",
  "Categories",
  "Actions",
  "Lifecycle events",
] as const;

/** Internal / docs only — not shown in the product UI */
export const POSITIONING_LINE =
  "Our platform ensures that no lead is wasted, no customer is forgotten, and every interaction is converted into an opportunity.";

export const MASTER_POSITIONING =
  "We are building an intelligent system where every lead is continuously processed through AI, automation, and human intervention until it is either converted, nurtured, or monetized.";
