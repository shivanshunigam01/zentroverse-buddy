/** Duplicate detection — NOT a stage; classification attribute on contact health */

export type DuplicateClassification =
  | "Exact Duplicate"
  | "Cross Sell"
  | "Upgrade"
  | "Exchange"
  | "Fleet Expansion"
  | "Existing Customer Opportunity"
  | "Reopened Opportunity"
  | "New Opportunity";

export interface DuplicateCheckInput {
  customer_id: string;
  product: string;
  requirement: string | null;
  existing_opportunities: Array<{
    opportunity_id: string;
    product: string;
    requirement: string | null;
    status: string;
    last_activity_at: string;
  }>;
}

const ACTIVE_STATUSES = new Set(["Open", "Hold"]);
const DUPLICATE_WINDOW_DAYS = 30;

function daysSince(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
}

function normalizeProduct(product: string): string {
  return product.trim().toLowerCase();
}

function normalizeRequirement(req: string | null): string {
  return (req ?? "").trim().toLowerCase();
}

/**
 * Duplicate only if: same customer + same product + same requirement +
 * active opportunity + last activity within 30 days.
 */
export function classifyDuplicate(input: DuplicateCheckInput): DuplicateClassification {
  const productKey = normalizeProduct(input.product);
  const reqKey = normalizeRequirement(input.requirement);

  const exactActive = input.existing_opportunities.find((o) => {
    if (!ACTIVE_STATUSES.has(o.status)) return false;
    if (normalizeProduct(o.product) !== productKey) return false;
    if (normalizeRequirement(o.requirement) !== reqKey) return false;
    return daysSince(o.last_activity_at) < DUPLICATE_WINDOW_DAYS;
  });

  if (exactActive) return "Exact Duplicate";

  const sameProduct = input.existing_opportunities.some(
    (o) => normalizeProduct(o.product) === productKey && ACTIVE_STATUSES.has(o.status),
  );
  if (sameProduct) return "Fleet Expansion";

  const anyActive = input.existing_opportunities.some((o) => ACTIVE_STATUSES.has(o.status));
  if (anyActive && productKey !== "") return "Cross Sell";

  const delivered = input.existing_opportunities.some((o) => o.status === "Delivered");
  if (delivered) return "Existing Customer Opportunity";

  const lostRecent = input.existing_opportunities.find(
    (o) => o.status === "Lost" && daysSince(o.last_activity_at) < DUPLICATE_WINDOW_DAYS,
  );
  if (lostRecent) return "Reopened Opportunity";

  return "New Opportunity";
}

export function duplicateClassificationToOpportunityType(
  classification: DuplicateClassification,
): import("@/domain/entities/opportunity").OpportunityType {
  const map: Record<DuplicateClassification, import("@/domain/entities/opportunity").OpportunityType> = {
    "Exact Duplicate": "New",
    "Cross Sell": "Cross Sell",
    Upgrade: "Upgrade",
    Exchange: "Exchange",
    "Fleet Expansion": "Fleet Expansion",
    "Existing Customer Opportunity": "Existing Customer",
    "Reopened Opportunity": "Reopened",
    "New Opportunity": "New",
  };
  return map[classification];
}
