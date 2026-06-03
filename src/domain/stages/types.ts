/** Reportable business stages only — engines are NOT stages */

export type SalesStage = "C0" | "C1" | "C1A" | "C2" | "C3";

export type LifecycleStage = "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";

export type ReportableStage = SalesStage | LifecycleStage;

export type C0MicroStage =
  | "C0.1" | "C0.2" | "C0.3" | "C0.4" | "C0.5" | "C0.6"
  | "C0.7" | "C0.8" | "C0.9" | "C0.10";

export type C1MicroStage =
  | "C1.1" | "C1.2" | "C1.3" | "C1.4" | "C1.5" | "C1.6"
  | "C1.7" | "C1.8" | "C1.9" | "C1.10";

export type C1AMicroStage =
  | "C1A.1" | "C1A.2" | "C1A.3" | "C1A.4" | "C1A.5"
  | "C1A.6" | "C1A.7" | "C1A.8" | "C1A.9" | "C1A.10";

export type C2MicroStage =
  | "C2.1" | "C2.2" | "C2.3" | "C2.4" | "C2.5"
  | "C2.6" | "C2.7" | "C2.8" | "C2.9" | "C2.10";

export type C3MicroStage =
  | "C3.1" | "C3.2" | "C3.3" | "C3.4" | "C3.5"
  | "C3.6" | "C3.7" | "C3.8" | "C3.9" | "C3.10";

export type MicroStageCode =
  | C0MicroStage
  | C1MicroStage
  | C1AMicroStage
  | C2MicroStage
  | C3MicroStage
  | LifecycleStage;

export type MacroStageId = "c0" | "c1" | "c1a" | "c2" | "c3" | "lifecycle";

export interface BusinessMicroStage {
  code: MicroStageCode;
  title: string;
  macro: SalesStage | "lifecycle";
  trigger: string;
  systemAction: string;
  owner: string;
  sla: string;
  exitCondition: string;
}

/** UI pipeline modules consume this shape — unchanged layout contract */
export type MicroStage = BusinessMicroStage;

export function microStageToMacro(code: MicroStageCode): SalesStage | "lifecycle" {
  if (code.startsWith("C0")) return "C0";
  if (code.startsWith("C1A")) return "C1A";
  if (code.startsWith("C1")) return "C1";
  if (code.startsWith("C2")) return "C2";
  if (code.startsWith("C3")) return "C3";
  return "lifecycle";
}

export function isSalesStage(stage: ReportableStage): stage is SalesStage {
  return stage.startsWith("C");
}

export function isLifecycleStage(stage: ReportableStage): stage is LifecycleStage {
  return stage.startsWith("L");
}
