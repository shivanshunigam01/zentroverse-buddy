import type { AutomationRuleSeed, ConditionOperator } from "./automation-rules";
import { getActiveAutomationRules } from "./automation-rules";

/** Flat context for rule condition evaluation (dot-path fields). */
export type RuleEvalContext = Record<string, unknown>;

function getPath(ctx: RuleEvalContext, path: string): unknown {
  if (path in ctx) return ctx[path];
  const parts = path.split(".");
  let cur: unknown = ctx;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function matchOperator(op: ConditionOperator, actual: unknown, expected: string): boolean {
  switch (op) {
    case "IS_NOT_NULL":
      return actual !== null && actual !== undefined && actual !== "";
    case "EQUALS":
      return String(actual) === expected || String(actual).toLowerCase() === expected.toLowerCase();
    case "NOT_EQUALS":
      return String(actual) !== expected;
    case "IN": {
      const set = expected.split(",").map((s) => s.trim().toUpperCase());
      return set.includes(String(actual).toUpperCase());
    }
    case "GT":
      return Number(actual) > Number(expected);
    case "LT":
      return Number(actual) < Number(expected);
    default:
      return false;
  }
}

export function evaluateRule(rule: AutomationRuleSeed, ctx: RuleEvalContext): boolean {
  return matchOperator(rule.operator, getPath(ctx, rule.field), rule.expectedValue);
}

export interface MatchedAutomationRule {
  rule: AutomationRuleSeed;
  matched: boolean;
}

export function evaluateAutomationRules(
  ctx: RuleEvalContext,
  eventType?: string,
  rules: AutomationRuleSeed[] = getActiveAutomationRules(),
): MatchedAutomationRule[] {
  return rules
    .filter((r) => !eventType || r.triggerEvent === eventType || r.ruleType !== "EVENT")
    .map((rule) => ({ rule, matched: evaluateRule(rule, ctx) }));
}

/** First matching ACTIVE rule by priority P1→P5 then list order */
export function pickWinningRule(
  ctx: RuleEvalContext,
  eventType?: string,
): AutomationRuleSeed | null {
  const priorityRank = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };
  const matched = evaluateAutomationRules(ctx, eventType)
    .filter((m) => m.matched)
    .sort((a, b) => priorityRank[a.rule.priority] - priorityRank[b.rule.priority]);
  return matched[0]?.rule ?? null;
}
