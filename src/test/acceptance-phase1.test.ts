import { describe, expect, it } from "vitest";
import { STAGE_MASTER } from "@/domain/stages/stage-master";
import { AUTOMATION_RULE_SEEDS } from "@/domain/actions/automation-rules";
import { assertGoldenRule, findGoldenRuleExceptions } from "@/domain/entities/golden-rule";
import { validateSequentialTransition } from "@/domain/stages/stage-gates";
import type { OpportunityMaster } from "@/domain/entities/opportunity";

const openOpp = (overrides: Partial<OpportunityMaster> = {}): OpportunityMaster => ({
  opportunity_id: "OP-ACC",
  lead_id: "ACC-LD-1",
  customer_id: "CU-ACC",
  product: "Ace",
  variant: "Gold",
  requirement: null,
  opportunity_type: "New",
  current_stage: "C0",
  lifecycle_stage: null,
  current_micro_stage: "C0.9",
  current_owner: "Sales Executive",
  current_action: "Generate next best action",
  next_action: "Quote readiness",
  next_action_date: new Date().toISOString(),
  priority: "P2",
  lead_score: 60,
  score_classification: "Warm",
  sla: "1 hour",
  sla_due_at: new Date().toISOString(),
  sla_status: "On Track",
  escalation_owner: "Sales Manager",
  status: "Open",
  source: "Web",
  campaign: null,
  branch: "Pune",
  last_activity_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe("Phase 1 acceptance (sheet 07 critical)", () => {
  it("#1 every open opp satisfies golden rule shape", () => {
    expect(() => assertGoldenRule(openOpp())).not.toThrow();
    expect(findGoldenRuleExceptions([openOpp({ current_owner: "" })])).toHaveLength(1);
  });

  it("#3 rule seeds cover sheet 03", () => {
    expect(AUTOMATION_RULE_SEEDS).toHaveLength(14);
    expect(new Set(AUTOMATION_RULE_SEEDS.map((r) => r.ruleCode)).size).toBe(14);
  });

  it("#6 stage master has 54 stages and blocks incomplete C0.10", () => {
    expect(STAGE_MASTER).toHaveLength(54);
    const opp = openOpp({
      current_micro_stage: "C0.10",
      stage_step_data: { "C0.10": { fields: {} } },
    });
    expect(() => validateSequentialTransition(opp, "C1.1")).toThrow(/missing mandatory/i);
  });

  it("#10 Stage Master exit for C3 is C3.9 per Excel", () => {
    expect(STAGE_MASTER.find((s) => s.code === "C3.9")?.nextStage).toMatch(/L1/i);
  });
});
