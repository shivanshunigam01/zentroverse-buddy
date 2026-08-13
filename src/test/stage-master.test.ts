import { describe, expect, it } from "vitest";
import { STAGE_MASTER, getStageMaster, parseSlaToMinutes } from "@/domain/stages/stage-master";
import { validateStageExit, assertStageExitAllowsTransition } from "@/domain/stages/stage-exit-validation";
import { validateSequentialTransition } from "@/domain/stages/stage-gates";
import { checkGoldenRule, assertGoldenRule, findGoldenRuleExceptions } from "@/domain/entities/golden-rule";
import type { OpportunityMaster } from "@/domain/entities/opportunity";
import { AUTOMATION_RULE_SEEDS } from "@/domain/actions/automation-rules";
import { evaluateRule, pickWinningRule } from "@/domain/actions/rule-evaluator";

const baseOpp = (overrides: Partial<OpportunityMaster> = {}): OpportunityMaster => ({
  opportunity_id: "OP-TEST",
  lead_id: "TEST-LD-2026-001",
  customer_id: "CU-TEST",
  product: "Tata Ace",
  variant: null,
  requirement: "City delivery",
  opportunity_type: "New",
  current_stage: "C0",
  lifecycle_stage: null,
  current_micro_stage: "C0.10",
  current_owner: "Sales Executive",
  current_action: "Complete quote readiness",
  next_action: "Generate quotation",
  next_action_date: new Date().toISOString(),
  priority: "P2",
  lead_score: 70,
  score_classification: "Warm",
  sla: "1 hr",
  sla_due_at: new Date().toISOString(),
  sla_status: "On Track",
  escalation_owner: "Sales Manager",
  status: "Open",
  source: "Walk-in",
  campaign: null,
  branch: "Test",
  last_activity_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe("Stage Master SSOT", () => {
  it("loads 54 stages from consolidated spec", () => {
    expect(STAGE_MASTER.length).toBe(54);
    expect(getStageMaster("C0.1")?.name).toBe("Lead Captured");
    expect(getStageMaster("C1A.5")?.macro).toBe("C1A");
    expect(getStageMaster("L5")?.nextStage).toBeTruthy();
  });

  it("parses SLA minutes", () => {
    expect(parseSlaToMinutes("1 minute")).toBe(1);
    expect(parseSlaToMinutes("2 hours")).toBe(120);
    expect(parseSlaToMinutes("Same day")).toBe(480);
  });
});

describe("AE-T004 — quote readiness gate", () => {
  it("blocks C0.10 → C1.1 when budget/timeline missing", () => {
    const opp = baseOpp({
      current_micro_stage: "C0.10",
      stage_step_data: {
        "C0.10": { fields: { variant: "Ace Gold" } },
      },
    });
    const result = validateStageExit(opp, "C0.10");
    expect(result.ok).toBe(false);
    expect(result.missingFields).toEqual(
      expect.arrayContaining(["budget", "purchase_timeline", "decision_maker"]),
    );
    expect(() => validateSequentialTransition(opp, "C1.1", false)).toThrow(/missing mandatory/i);
  });

  it("allows C0.10 → C1.1 when quote readiness fields complete", () => {
    const opp = baseOpp({
      current_micro_stage: "C0.10",
      stage_step_data: {
        "C0.10": {
          fields: {
            variant: "Ace Gold",
            quantity: "1",
            budget: "800000",
            purchase_timeline: "30 days",
            decision_maker: "Owner",
            finance_preference: "Finance",
            location: "Pune",
            exchange: "No",
            competition: "None",
            taxes_registration: "MH-on-road",
          },
        },
      },
    });
    expect(validateStageExit(opp, "C0.10").ok).toBe(true);
    expect(() => assertStageExitAllowsTransition(opp, "C1.1")).not.toThrow();
  });
});

describe("Golden rule", () => {
  it("AE-T001 shape — open opp has stage, owner, action, due time, next path", () => {
    const opp = baseOpp();
    expect(checkGoldenRule(opp)).toEqual([]);
    expect(() => assertGoldenRule(opp)).not.toThrow();
  });

  it("flags missing owner and due time", () => {
    const opp = baseOpp({
      current_owner: "",
      next_action_date: "",
      sla_due_at: null,
    });
    const v = checkGoldenRule(opp);
    expect(v.some((x) => x.field === "current_owner")).toBe(true);
    expect(v.some((x) => x.field === "due_time")).toBe(true);
  });

  it("health scan finds orphan open opportunities", () => {
    const healthy = baseOpp({ opportunity_id: "OP-OK" });
    const broken = baseOpp({
      opportunity_id: "OP-BAD",
      current_action: "",
      next_action: "",
    });
    const exceptions = findGoldenRuleExceptions([healthy, broken]);
    expect(exceptions).toHaveLength(1);
    expect(exceptions[0].opportunity_id).toBe("OP-BAD");
  });
});

describe("Automation rule seeds (sheet 03)", () => {
  it("seeds 14 ACTIVE rules", () => {
    expect(AUTOMATION_RULE_SEEDS.length).toBe(14);
    expect(AUTOMATION_RULE_SEEDS.every((r) => r.status === "ACTIVE")).toBe(true);
  });

  it("matches new lead validate rule", () => {
    const rule = AUTOMATION_RULE_SEEDS.find((r) => r.ruleCode === "C0_NEW_LEAD_VALIDATE")!;
    expect(evaluateRule(rule, { "lead.mobile": "9876543210" })).toBe(true);
    expect(evaluateRule(rule, { "lead.mobile": "" })).toBe(false);
  });

  it("picks hot callback as P1 winner", () => {
    const winner = pickWinningRule(
      { "lead.priority": "HOT" },
      "customer.callback_requested",
    );
    expect(winner?.ruleCode).toBe("C0_HOT_CALLBACK");
  });
});
