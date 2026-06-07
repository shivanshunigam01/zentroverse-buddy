import type {
  OpportunityMaster,
  OpportunityStatus,
  PriorityCode,
} from "@/domain/entities/opportunity";
import type { SalesStage, MicroStageCode } from "@/domain/stages/types";
import type { ApiResponse } from "./customers";

export interface OpportunityDto extends OpportunityMaster {
  customer_name: string;
  customer_mobile: string;
  customer_email?: string | null;
  customer_address?: string | null;
}

export interface ListOpportunitiesQuery {
  stage?: SalesStage;
  owner?: string;
  priority?: PriorityCode;
  status?: OpportunityStatus;
  sla_status?: "On Track" | "At Risk" | "Breached";
  customer_id?: string;
  page?: number;
  limit?: number;
}

export interface ListOpportunitiesResponse extends ApiResponse<OpportunityDto[]> {}

export interface GetOpportunityResponse extends ApiResponse<OpportunityDto> {}

export interface CreateOpportunityRequest {
  customer_id: string;
  product: string;
  variant?: string;
  requirement?: string;
  source: string;
  campaign?: string;
  branch: string;
}

export interface CreateOpportunityResponse extends ApiResponse<OpportunityDto> {}

/** REST: GET /api/v1/opportunities */
export type ListOpportunitiesContract = (
  query?: ListOpportunitiesQuery,
) => Promise<ListOpportunitiesResponse>;

/** REST: GET /api/v1/opportunities/:opportunityId */
export type GetOpportunityContract = (opportunityId: string) => Promise<GetOpportunityResponse>;

/** REST: POST /api/v1/opportunities */
export type CreateOpportunityContract = (
  body: CreateOpportunityRequest,
) => Promise<CreateOpportunityResponse>;

export interface MoveStageRequest {
  new_micro_stage: MicroStageCode;
  reason?: string;
  changed_by: string;
}

export interface MoveStageResponse extends ApiResponse<OpportunityDto> {}

/** REST: POST /api/v1/opportunities/:id/stage-transition */
export type MoveStageContract = (
  opportunityId: string,
  body: MoveStageRequest,
) => Promise<MoveStageResponse>;
