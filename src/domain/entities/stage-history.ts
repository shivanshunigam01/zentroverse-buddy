import type { MicroStageCode, ReportableStage } from "@/domain/stages/types";

export interface StageHistory {
  history_id: string;
  opportunity_id: string;
  old_stage: ReportableStage | null;
  old_micro_stage: MicroStageCode | null;
  new_stage: ReportableStage;
  new_micro_stage: MicroStageCode;
  reason: string | null;
  changed_by: string;
  changed_at: string;
}
