import { describe, expect, it } from "vitest";
import { classifyDuplicate } from "@/domain/duplicate/rules";
import { actionEngineService } from "@/services/action-engine.service";
import type { OpportunityMaster } from "@/domain/entities/opportunity";

const baseOpp = (overrides: Partial<OpportunityMaster>): OpportunityMaster => ({
  opportunity_id: "OP-TEST",
  customer_id: "CU-TEST",
  product: "Tata Ace",
  variant: null,
  requirement: "City delivery",
  opportunity_type: "New",
  current_stage: "C1",
  lifecycle_stage: null,
  current_micro_stage: "C1.3",
  current_owner: "Sales Executive",
  current_action: "Handle objection",
  next_action: "Manager call",
  next_action_date: new Date().toISOString(),
  priority: "P2",
  lead_score: 85,
  score_classification: "Hot",
  sla: "4 hrs",
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

describe("duplicate engine", () => {
  it("flags exact duplicate for same customer+product+requirement within 30 days", () => {
    const result = classifyDuplicate({
      customer_id: "CU-ABC",
      product: "Tata Ace",
      requirement: "Fleet unit 1",
      existing_opportunities: [
        {
          opportunity_id: "OP-1",
          product: "Tata Ace",
          requirement: "Fleet unit 1",
          status: "Open",
          last_activity_at: new Date().toISOString(),
        },
      ],
    });
    expect(result).toBe("Exact Duplicate");
  });

  it("allows fleet expansion for same product different requirement", () => {
    const result = classifyDuplicate({
      customer_id: "CU-ABC",
      product: "Tata Ace",
      requirement: "Fleet unit 2",
      existing_opportunities: [
        {
          opportunity_id: "OP-1",
          product: "Tata Ace",
          requirement: "Fleet unit 1",
          status: "Open",
          last_activity_at: new Date().toISOString(),
        },
      ],
    });
    expect(result).toBe("Fleet Expansion");
  });
});

describe("action engine", () => {
  it("recommends manager call for hot C1.3 with quote viewed", () => {
    const opp = baseOpp({ current_micro_stage: "C1.3", lead_score: 85 });
    const output = actionEngineService.evaluate(
      actionEngineService.buildInput(opp, { quote_viewed: true }),
    );
    expect(output.next_action).toBe("Manager Call");
    expect(output.priority).toBe("P1");
  });
});
