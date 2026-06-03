import type { ActionEngineInput, ActionEngineOutput } from "@/domain/engines/action-engine";
import type { ContactHealthAttributes } from "@/domain/engines/contact-health";
import type { ScoreLedgerEntry } from "@/domain/engines/scoring";
import type { SlaEngineState } from "@/domain/engines/sla";
import type { ApiResponse } from "./customers";

export interface RunActionEngineRequest {
  opportunity_id: string;
  behavior_override?: Partial<ActionEngineInput["customer_behavior"]>;
}

export interface RunActionEngineResponse extends ApiResponse<ActionEngineOutput> {}

export interface RunContactHealthRequest {
  opportunity_id: string;
  mobile: string;
  district: string;
}

export interface RunContactHealthResponse extends ApiResponse<ContactHealthAttributes> {}

export interface ApplyScoreEventRequest {
  opportunity_id: string;
  event_type: string;
}

export interface ApplyScoreEventResponse extends ApiResponse<{
  new_score: number;
  classification: string;
  ledger_entry: ScoreLedgerEntry;
}> {}

export interface GetSlaStateResponse extends ApiResponse<SlaEngineState> {}

/** REST: POST /api/v1/engines/action/run */
export type RunActionEngineContract = (
  body: RunActionEngineRequest,
) => Promise<RunActionEngineResponse>;

/** REST: POST /api/v1/engines/contact-health/verify */
export type RunContactHealthContract = (
  body: RunContactHealthRequest,
) => Promise<RunContactHealthResponse>;

/** REST: POST /api/v1/engines/scoring/apply */
export type ApplyScoreEventContract = (
  body: ApplyScoreEventRequest,
) => Promise<ApplyScoreEventResponse>;

/** REST: GET /api/v1/engines/sla/:opportunityId */
export type GetSlaStateContract = (opportunityId: string) => Promise<GetSlaStateResponse>;
