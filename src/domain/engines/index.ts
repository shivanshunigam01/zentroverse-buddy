/** Parallel automation engines — never replace business stages */

export const PARALLEL_ENGINES = [
  { id: "contact-health", name: "Contact Health Engine", description: "Mobile, WhatsApp, call, territory, duplicate attributes" },
  { id: "scoring", name: "Lead Scoring Engine", description: "Real-time score ledger and Hot/Warm/Cold/Critical" },
  { id: "action", name: "Action Engine", description: "Next action, owner, priority from stage + signals" },
  { id: "priority", name: "Priority Engine", description: "P1–P5 queue ordering for dialer and inbox" },
  { id: "sla", name: "SLA Engine", description: "Due times and breach detection" },
  { id: "escalation", name: "Escalation Engine", description: "Route to escalation owner on breach" },
  { id: "re-engagement", name: "Re-engagement Engine", description: "Nurture, recycle, alternate finance" },
  { id: "competitor", name: "Competitor Engine", description: "Competitor offer capture and counter scripts" },
  { id: "territory", name: "Territory Engine", description: "Branch and territory validation" },
] as const;

export type ParallelEngineId = (typeof PARALLEL_ENGINES)[number]["id"];

export * from "./contact-health";
export * from "./scoring";
export * from "./action-engine";
export * from "./sla";
export * from "./escalation";
