/**
 * ZentroFlow platform facade — re-exports domain model for UI modules.
 * Business stages live in domain/stages; engines live in domain/engines.
 */

export { POSITIONING } from "./platform-meta";

export {
  SALES_STAGES,
  LIFECYCLE_STAGES,
  C0_MICRO_STAGES,
  C1_MICRO_STAGES,
  C1A_MICRO_STAGES,
  C2_MICRO_STAGES,
  C3_MICRO_STAGES,
  LIFECYCLE_MICRO_STAGES,
  getMicroStagesForMacro,
  type MicroStage,
} from "./stages/business-stages";

export type { MacroStageId, SalesStage, LifecycleStage, ReportableStage } from "./stages/types";

export { MACRO_STAGES } from "./platform-meta";

export {
  PARALLEL_ENGINES,
  SCORING_RULES,
  SCORE_BANDS,
  classifyScore,
} from "./engines";

export { DIALER_PRIORITIES, C1_OBJECTION_CATEGORIES, LIFECYCLE_TIMELINE } from "./platform-meta";

export { DUPLICATE_TYPES, LEAD_TYPES, LEAD_BACKBONE_FIELDS, DATABASE_TABLES } from "./platform-meta";

export { DOMAIN_EVENTS as PLATFORM_EVENTS } from "./events/event-types";
