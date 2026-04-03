/** Tab ids aligned with sidebar */

export type FlowTabId =
  | "dashboard"
  | "leads"
  | "engagement"
  | "classification"
  | "action"
  | "lifecycle"
  | "vehicle"
  | "workflow"
  | "monetization"
  | "analytics"
  | "notifications";

/** Full master journey — 8 steps, two land on Lead intake */
export type JourneyStep = {
  order: number;
  /** Compact label for tight UI */
  short: string;
  /** Full step name */
  title: string;
  /** One-line context (product language, not spec notes) */
  hint: string;
  tabId: FlowTabId;
};

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    order: 1,
    short: "Source",
    title: "Lead Source",
    hint: "Walk-in, website, ads, field, referral",
    tabId: "leads",
  },
  {
    order: 2,
    short: "CRM",
    title: "Lead Capture (CRM)",
    hint: "Single record, tags, dedupe on mobile",
    tabId: "leads",
  },
  {
    order: 3,
    short: "WhatsApp",
    title: "AI Engagement (WhatsApp Bot)",
    hint: "Starts when the lead is created",
    tabId: "engagement",
  },
  {
    order: 4,
    short: "Classify",
    title: "AI Classification",
    hint: "From replies, clicks, calls, and timing",
    tabId: "classification",
  },
  {
    order: 5,
    short: "Action",
    title: "Action Engine",
    hint: "Sales desk or auto dialer — then loop",
    tabId: "action",
  },
  {
    order: 6,
    short: "Outcome",
    title: "Conversion OR Recycling",
    hint: "Won, lost, or nurture cycle",
    tabId: "analytics",
  },
  {
    order: 7,
    short: "Lifecycle",
    title: "Lifecycle Automation (Post-Sale)",
    hint: "Kicks in after delivery",
    tabId: "lifecycle",
  },
  {
    order: 8,
    short: "Ongoing",
    title: "Continuous Engagement",
    hint: "Care, alerts, renewals, loyalty",
    tabId: "vehicle",
  },
];

/** Legacy shape for any code still expecting { label, full, tabId } */
export type PipelineStep = { label: string; full: string; tabId: FlowTabId };

export const PIPELINE_STEPS: PipelineStep[] = JOURNEY_STEPS.map((s) => ({
  label: s.short,
  full: s.hint,
  tabId: s.tabId,
}));

export function journeyMaxOrderForTab(tab: FlowTabId): number | null {
  const steps = JOURNEY_STEPS.filter((s) => s.tabId === tab);
  if (!steps.length) return null;
  return Math.max(...steps.map((s) => s.order));
}

export function journeyMinOrderForTab(tab: FlowTabId): number | null {
  const steps = JOURNEY_STEPS.filter((s) => s.tabId === tab);
  if (!steps.length) return null;
  return Math.min(...steps.map((s) => s.order));
}

/** Next step in the numbered journey (by order), or null at end / off-journey */
export function getNextJourneyStep(activeTab: FlowTabId): JourneyStep | null {
  const max = journeyMaxOrderForTab(activeTab);
  if (max === null) return null;
  return JOURNEY_STEPS.find((s) => s.order === max + 1) ?? null;
}

export const MODULE_META: Record<
  FlowTabId,
  { title: string; subtitle: string; pipelineStep?: number; badge?: string }
> = {
  dashboard: {
    title: "Command center",
    subtitle: "Engines, journey, and health at a glance",
    badge: "Overview",
  },
  leads: {
    title: "Lead intake & CRM",
    subtitle: "Stages 1–2: every source into one profile, tagged and deduped",
    pipelineStep: 1,
    badge: "Stages 1–2",
  },
  engagement: {
    title: "AI engagement",
    subtitle: "Stage 3: WhatsApp bot immediately after lead creation",
    pipelineStep: 3,
    badge: "Stage 3",
  },
  classification: {
    title: "AI classification",
    subtitle: "Stage 4: categories from bot, clicks, calls, and delays",
    pipelineStep: 4,
    badge: "Stage 4",
  },
  action: {
    title: "Action engine",
    subtitle: "Stage 5: responsive → sales; quiet → dialer; then back to classify",
    pipelineStep: 5,
    badge: "Stage 5",
  },
  lifecycle: {
    title: "Lifecycle automation",
    subtitle: "Stage 7: PDI, delivery, service, renewals, upsell",
    pipelineStep: 7,
    badge: "Stage 7",
  },
  vehicle: {
    title: "Vehicle care & engagement",
    subtitle: "Stage 8: education, alerts, ongoing programs",
    pipelineStep: 8,
    badge: "Stage 8",
  },
  workflow: {
    title: "Workflow automation",
    subtitle: "Cross-engine triggers and schedules",
    badge: "Automation",
  },
  monetization: {
    title: "Smart monetization",
    subtitle: "Alternate paths for not-ready leads",
    badge: "Revenue",
  },
  analytics: {
    title: "Conversion or recycling",
    subtitle: "Stage 6: won, lost, nurture — funnel truth",
    pipelineStep: 6,
    badge: "Stage 6",
  },
  notifications: {
    title: "Notifications",
    subtitle: "Alerts across the stack",
    badge: "Alerts",
  },
};

/** Sidebar row; `navId` disambiguates React keys when two rows open the same tab (e.g. both lead stages → leads). */
export type SidebarNavItem = {
  id: FlowTabId;
  label: string;
  badge?: number;
  navId?: string;
};

export type SidebarGroup = { heading: string; items: SidebarNavItem[] };

/**
 * Nav order matches the master journey (top → bottom). Stages 1–2 both use the leads module.
 */
export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    heading: "Overview",
    items: [{ id: "dashboard", label: "Dashboard" }],
  },
  {
    heading: "Master flow",
    items: [
      { id: "leads", navId: "flow-lead-source", label: "Lead source", badge: 142 },
      { id: "leads", navId: "flow-lead-crm", label: "Lead capture (CRM)" },
      { id: "engagement", label: "AI engagement (WhatsApp Bot)" },
      { id: "classification", label: "AI classification" },
      { id: "action", label: "Action engine", badge: 23 },
      { id: "analytics", label: "Conversion or recycling" },
      { id: "lifecycle", label: "Lifecycle automation (post-sale)" },
      { id: "vehicle", label: "Continuous engagement" },
    ],
  },
  {
    heading: "Automation & revenue",
    items: [
      { id: "workflow", label: "Workflow" },
      { id: "monetization", label: "Smart monetization" },
    ],
  },
  {
    heading: "Alerts",
    items: [{ id: "notifications", label: "Notifications", badge: 8 }],
  },
];
