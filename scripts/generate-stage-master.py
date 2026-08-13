import json
import re
from pathlib import Path

base = Path(__file__).resolve().parents[1] / "src" / "domain"
data = json.loads((base / "stages" / "_excel_extract.json").read_text(encoding="utf-8"))

QUOTE_READY_FIELDS = [
    "variant",
    "budget",
    "purchase_timeline",
    "decision_maker",
    "finance_preference",
]


def parse_mandatory(text: str) -> list[str]:
    if not text:
        return []
    parts = re.split(r"[;,]|\band\b", text, flags=re.I)
    keys: list[str] = []
    mapping = [
        ("mobile", "mobile"),
        ("source", "source"),
        ("branch", "branch"),
        ("territory", "territory"),
        ("product", "product"),
        ("consent", "consent_status"),
        ("variant", "variant"),
        ("quantity", "quantity"),
        ("budget", "budget"),
        ("timeline", "purchase_timeline"),
        ("finance", "finance_preference"),
        ("decision maker", "decision_maker"),
        ("location", "location"),
        ("exchange", "exchange"),
        ("competition", "competition"),
        ("quotation", "quotation_id"),
        ("quote", "quotation_id"),
        ("disposition", "call_disposition"),
        ("whatsapp", "whatsapp_status"),
        ("dnd", "dnd_status"),
        ("usage", "usage"),
        ("route", "route"),
        ("load", "load"),
        ("colour", "colour"),
        ("color", "colour"),
        ("chassis", "chassis"),
        ("payment", "payment_reference"),
        ("insurance", "insurance_policy"),
        ("taxes/registration", "taxes_registration"),
        ("registration", "registration_number"),
        ("pdi", "pdi_status"),
        ("kyc", "kyc_docs"),
        ("income", "income_type"),
        ("lender", "lender"),
        ("booking amount", "booking_amount"),
        ("sanction", "sanction_amount"),
        ("margin", "margin"),
        ("down payment", "down_payment"),
        ("delivery", "delivery_proof"),
        ("otp", "customer_otp"),
        ("signature", "customer_signature"),
        ("nps", "nps_rating"),
        ("rating", "feedback_rating"),
        ("service due", "service_due_date"),
        ("policy", "policy_expiry"),
    ]
    for p in parts:
        p = p.strip().lower()
        if not p or len(p) < 3:
            continue
        matched = False
        for needle, key in mapping:
            if needle in p and key not in keys:
                keys.append(key)
                matched = True
                break
        if matched:
            continue
    return keys


def outcomes(s: str) -> list[str]:
    return [x.strip() for x in str(s).split(";") if x.strip()]


lines: list[str] = [
    "/**",
    " * Stage Master SSOT — generated from ZentroFlow Consolidated Developer Spec (sheet 02).",
    " * Every open opportunity must have stage, owner, current action, due time, next path.",
    " */",
    "",
    'import type { MicroStageCode } from "./types";',
    "",
    'export type StageMasterMacro = "C0" | "C1" | "C1A" | "C2" | "C3" | "Lifecycle";',
    "",
    "export interface StageMasterRow {",
    "  code: MicroStageCode;",
    "  macro: StageMasterMacro;",
    "  name: string;",
    "  businessObjective: string;",
    "  entryTrigger: string;",
    "  entryConditions: string;",
    "  currentOwner: string;",
    "  currentAction: string;",
    "  /** Human-readable mandatory validation text from spec */",
    "  mandatoryValidation: string;",
    "  /** Field keys that must be present in stage_step_data[code].fields to exit */",
    "  mandatoryFields: string[];",
    "  possibleOutcomes: string[];",
    "  exitCondition: string;",
    "  nextStage: string;",
    "  nextAction: string;",
    "  nextOwner: string;",
    "  defaultSla: string;",
    "  escalationPath: string;",
    "  exceptionPath: string;",
    "  systemEvent: string;",
    "}",
    "",
    "export const STAGE_MASTER: StageMasterRow[] = [",
]

for s in data["stages"]:
    code = s["Stage Code"]
    fields = parse_mandatory(s["Mandatory Data / Validation"])
    if code == "C0.10":
        for f in QUOTE_READY_FIELDS:
            if f not in fields:
                fields.append(f)

    def q(v):
        return json.dumps("" if v is None else str(v), ensure_ascii=False)

    outs = outcomes(s["Possible Outcomes"])
    lines.extend(
        [
            "  {",
            f"    code: {q(code)} as MicroStageCode,",
            f'    macro: {q(s["Macro Stage"])} as StageMasterMacro,',
            f'    name: {q(s["Stage Name"])},',
            f'    businessObjective: {q(s["Business Objective"])},',
            f'    entryTrigger: {q(s["Entry Trigger"])},',
            f'    entryConditions: {q(s["Entry Conditions"])},',
            f'    currentOwner: {q(s["Current Owner"])},',
            f'    currentAction: {q(s["Current Action"])},',
            f'    mandatoryValidation: {q(s["Mandatory Data / Validation"])},',
            f"    mandatoryFields: {json.dumps(fields)},",
            f"    possibleOutcomes: {json.dumps(outs)},",
            f'    exitCondition: {q(s["Exit Condition"])},',
            f'    nextStage: {q(s["Next Stage"])},',
            f'    nextAction: {q(s["Next Action"])},',
            f'    nextOwner: {q(s["Next Owner"])},',
            f'    defaultSla: {q(s["Default SLA"])},',
            f'    escalationPath: {q(s["Escalation Path"])},',
            f'    exceptionPath: {q(s["Exception / Alternate Path"])},',
            f'    systemEvent: {q(s["System Event"])},',
            "  },",
        ]
    )

lines.extend(
    [
        "];",
        "",
        "export const STAGE_MASTER_BY_CODE: Record<string, StageMasterRow> = Object.fromEntries(",
        "  STAGE_MASTER.map((r) => [r.code, r]),",
        ");",
        "",
        "export function getStageMaster(code: string): StageMasterRow | undefined {",
        "  return STAGE_MASTER_BY_CODE[code];",
        "}",
        "",
        "/** Parse Default SLA text to minutes (best-effort). */",
        "export function parseSlaToMinutes(sla: string): number | null {",
        "  const t = sla.trim().toLowerCase();",
        "  if (!t) return null;",
        r'  const m = t.match(/(\d+(?:\.\d+)?)\s*(minute|min|hour|hr|day|second|sec)/);',
        "  if (!m) {",
        '    if (t.includes("real time") || t.includes("instant") || t.includes("same day")) {',
        '      if (t.includes("same day")) return 8 * 60;',
        "      return 1;",
        "    }",
        "    return null;",
        "  }",
        "  const n = Number(m[1]);",
        "  const u = m[2];",
        '  if (u.startsWith("sec")) return Math.max(1, Math.ceil(n / 60));',
        '  if (u.startsWith("min")) return n;',
        '  if (u.startsWith("hour") || u.startsWith("hr")) return n * 60;',
        '  if (u.startsWith("day")) return n * 24 * 60;',
        "  return null;",
        "}",
        "",
    ]
)

(base / "stages" / "stage-master.ts").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("wrote stage-master.ts", len(data["stages"]))

rlines = [
    "/**",
    " * Configurable Action Engine rules — from Consolidated Spec sheet 03.",
    " * Stage movement is Stage Master; these rules cover dynamic EVENT/TIME/STAGE logic.",
    " */",
    "",
    'export type AutomationRuleType = "EVENT" | "TIME" | "STAGE";',
    'export type AutomationRuleStatus = "ACTIVE" | "DRAFT" | "SHADOW" | "PAUSED" | "RETIRED";',
    "export type ConditionOperator =",
    '  | "IS_NOT_NULL"',
    '  | "EQUALS"',
    '  | "IN"',
    '  | "NOT_EQUALS"',
    '  | "GT"',
    '  | "LT";',
    "",
    "export interface AutomationRuleSeed {",
    "  ruleCode: string;",
    "  name: string;",
    "  ruleType: AutomationRuleType;",
    "  triggerEvent: string;",
    "  scope: string;",
    '  conditionGroup: "ALL" | "ANY";',
    "  field: string;",
    "  operator: ConditionOperator;",
    "  expectedValue: string;",
    "  actionType: string;",
    "  actionOwnerLogic: string;",
    '  priority: "P1" | "P2" | "P3" | "P4" | "P5";',
    "  slaMinutes: number;",
    "  escalationLogic: string;",
    "  exitCondition: string;",
    "  nextStage: string;",
    "  status: AutomationRuleStatus;",
    "  version: number;",
    "}",
    "",
    "export const AUTOMATION_RULE_SEEDS: AutomationRuleSeed[] = [",
]

for r in data["rules"]:

    def q(v):
        return json.dumps("" if v is None else str(v), ensure_ascii=False)

    try:
        sla_n = int(r["SLA Minutes"])
    except Exception:
        sla_n = 60
    pri = str(r["Priority"] or "P2")
    if pri not in ("P1", "P2", "P3", "P4", "P5"):
        pri = "P2"
    rlines.extend(
        [
            "  {",
            f'    ruleCode: {q(r["Rule Code"])},',
            f'    name: {q(r["Rule Name"])},',
            f'    ruleType: {q(r["Rule Type"])} as AutomationRuleType,',
            f'    triggerEvent: {q(r["Trigger Event"])},',
            f'    scope: {q(r["Scope"])},',
            f'    conditionGroup: {q(r["Condition Group"] or "ALL")} as "ALL" | "ANY",',
            f'    field: {q(r["Field"])},',
            f'    operator: {q(r["Operator"])} as ConditionOperator,',
            f'    expectedValue: {q(r["Expected Value"])},',
            f'    actionType: {q(r["Action Type"])},',
            f'    actionOwnerLogic: {q(r["Action Owner Logic"])},',
            f'    priority: {q(pri)} as AutomationRuleSeed["priority"],',
            f"    slaMinutes: {sla_n},",
            f'    escalationLogic: {q(r["Escalation Logic"])},',
            f'    exitCondition: {q(r["Exit Condition"])},',
            f'    nextStage: {q(r["Next Stage"])},',
            f'    status: {q(r["Rule Status"] or "ACTIVE")} as AutomationRuleStatus,',
            "    version: 1,",
            "  },",
        ]
    )

rlines.extend(
    [
        "];",
        "",
        "export function getActiveAutomationRules(): AutomationRuleSeed[] {",
        '  return AUTOMATION_RULE_SEEDS.filter((r) => r.status === "ACTIVE");',
        "}",
        "",
        "export function getAutomationRule(code: string): AutomationRuleSeed | undefined {",
        "  return AUTOMATION_RULE_SEEDS.find((r) => r.ruleCode === code);",
        "}",
        "",
    ]
)

(base / "actions" / "automation-rules.ts").write_text("\n".join(rlines) + "\n", encoding="utf-8")
print("wrote automation-rules.ts", len(data["rules"]))
