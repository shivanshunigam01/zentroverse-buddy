/** ZentroFlow navigation — macro funnel C0→C3 + lifecycle + parallel engines */

import { MACRO_STAGES, POSITIONING, type MacroStageId } from "./platform";

export type FlowTabId =
  | "dashboard"
  | "c0"
  | "c1"
  | "c1a"
  | "c2"
  | "c3"
  | "lifecycle"
  | "scoring"
  | "contact-health"
  | "action"
  | "workflow"
  | "analytics"
  | "notifications";

export type MacroFunnelStep = {
  order: number;
  code: string;
  short: string;
  title: string;
  hint: string;
  tabId: FlowTabId;
};

/** Main sales funnel — C0 through C3 only (lifecycle is after C3) */
export const MACRO_FUNNEL_STEPS: MacroFunnelStep[] = [
  { order: 1, code: "C0", short: "C0", title: "Lead Maturity", hint: "Capture, contact health, engage, qualify, score", tabId: "c0" },
  { order: 2, code: "C1", short: "C1", title: "Sales & Objection", hint: "Quote, objection, affordability, finance discussion", tabId: "c1" },
  { order: 3, code: "C1A", short: "C1A", title: "Finance & Intent", hint: "Application, approval, margin, booking intent", tabId: "c1a" },
  { order: 4, code: "C2", short: "C2", title: "Booking → Billing", hint: "Booking, allocation, insurance, registration, PDI", tabId: "c2" },
  { order: 5, code: "C3", short: "C3", title: "Retail / Delivery", hint: "Payment, delivery, feedback, lifecycle activation", tabId: "c3" },
];

export const LIFECYCLE_STEP: MacroFunnelStep = {
  order: 6,
  code: "L",
  short: "Lifecycle",
  title: "Lifecycle Revenue",
  hint: "Service, renewal, upgrade, exchange, referral, repeat sale",
  tabId: "lifecycle",
};

export const FULL_JOURNEY_STEPS: MacroFunnelStep[] = [...MACRO_FUNNEL_STEPS, LIFECYCLE_STEP];

export const MODULE_META: Record<FlowTabId, { title: string; subtitle: string; macroCode?: string; badge?: string }> = {
  dashboard: {
    title: "Command center",
    subtitle: `${POSITIONING.tagline} — funnel, engines, and lead health`,
    badge: "Overview",
  },
  c0: {
    title: "C0 — Lead Maturity",
    subtitle: "Capture, duplicate check, contact health, bot, dialer, discovery, qualification, scoring, NBA, quote readiness",
    macroCode: "C0",
    badge: "Lead Maturity",
  },
  c1: {
    title: "C1 — Sales Discussion & Objection",
    subtitle: "Quote shared → acknowledged → objections → affordability → finance discussion → eligibility",
    macroCode: "C1",
    badge: "Sales",
  },
  c1a: {
    title: "C1A — Finance Approval & Intent",
    subtitle: "Application through approval, margin, variant lock, add-ons, booking intent",
    macroCode: "C1A",
    badge: "Finance",
  },
  c2: {
    title: "C2 — Booking to Billing",
    subtitle: "Booking, allocation, billing docs, disbursement, DP, insurance, registration, HSRP, PDI",
    macroCode: "C2",
    badge: "Booking",
  },
  c3: {
    title: "C3 — Retail / Delivery",
    subtitle: "Final payment through delivery, feedback, testimonial, referral, lifecycle activation",
    macroCode: "C3",
    badge: "Delivery",
  },
  lifecycle: {
    title: "After C3 — Lifecycle Revenue Engine",
    subtitle: "10-year revenue: service, insurance, AMC, upgrade, exchange, repeat purchase, referral",
    macroCode: "L",
    badge: "Post-sale",
  },
  scoring: {
    title: "Lead Scoring Engine",
    subtitle: "Parallel engine — not a funnel stage. Real-time Cold / Warm / Hot / Critical",
    badge: "Parallel",
  },
  "contact-health": {
    title: "Contact Health Engine",
    subtitle: "Mobile, WhatsApp, call, email, territory, duplicate, contactability score",
    badge: "Parallel",
  },
  action: {
    title: "Action Engine",
    subtitle: "One lead = one stage + one owner + one current action + next action + SLA",
    badge: "Backbone",
  },
  workflow: {
    title: "Automation & SLA",
    subtitle: "Event-driven rules, SLA escalation, re-engagement, nurture queues",
    badge: "Automation",
  },
  analytics: {
    title: "Analytics & KPIs",
    subtitle: "Funnel leakage, source ROI, executive performance, SLA missed %",
    badge: "Insights",
  },
  notifications: {
    title: "Notifications & Alerts",
    subtitle: "Escalations, SLA breaches, manager alerts across all stages",
    badge: "Alerts",
  },
};

export type SidebarNavItem = {
  id: FlowTabId;
  label: string;
  badge?: number | string;
  navId?: string;
};

export type SidebarGroup = { heading: string; items: SidebarNavItem[] };

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    heading: "Overview",
    items: [{ id: "dashboard", label: "Dashboard" }],
  },
  {
    heading: "Sales funnel (C0 → C3)",
    items: MACRO_STAGES.filter((m) => m.id !== "lifecycle").map((m) => ({
      id: m.tabId,
      label: `${m.code} — ${m.name}`,
      navId: `macro-${m.id}`,
    })),
  },
  {
    heading: "After C3",
    items: [{ id: "lifecycle", label: "Lifecycle revenue engine" }],
  },
  {
    heading: "Parallel engines",
    items: [
      { id: "scoring", label: "Lead scoring", badge: "Live" },
      { id: "contact-health", label: "Contact health" },
      { id: "action", label: "Action engine", badge: 23 },
    ],
  },
  {
    heading: "Operations",
    items: [
      { id: "workflow", label: "Automation & SLA" },
      { id: "analytics", label: "Analytics & KPIs" },
      { id: "notifications", label: "Notifications", badge: 8 },
    ],
  },
];

export function macroIdFromTab(tab: FlowTabId): MacroStageId | null {
  if (tab === "c0" || tab === "c1" || tab === "c1a" || tab === "c2" || tab === "c3" || tab === "lifecycle") {
    return tab;
  }
  return null;
}

export function getNextMacroStep(activeTab: FlowTabId): MacroFunnelStep | null {
  const idx = FULL_JOURNEY_STEPS.findIndex((s) => s.tabId === activeTab);
  if (idx < 0 || idx >= FULL_JOURNEY_STEPS.length - 1) return null;
  return FULL_JOURNEY_STEPS[idx + 1];
}

export function funnelIndexForTab(tab: FlowTabId): number | null {
  const step = FULL_JOURNEY_STEPS.find((s) => s.tabId === tab);
  return step?.order ?? null;
}

/** @deprecated Use MACRO_FUNNEL_STEPS — kept for gradual migration */
export const JOURNEY_STEPS = FULL_JOURNEY_STEPS.map((s) => ({
  order: s.order,
  short: s.short,
  title: s.title,
  hint: s.hint,
  tabId: s.tabId,
}));

export function journeyMaxOrderForTab(tab: FlowTabId): number | null {
  return funnelIndexForTab(tab);
}

export function journeyMinOrderForTab(tab: FlowTabId): number | null {
  return funnelIndexForTab(tab);
}

export function getNextJourneyStep(activeTab: FlowTabId): MacroFunnelStep | null {
  return getNextMacroStep(activeTab);
}
