/** Lead Scoring Engine — parallel; score is an attribute on opportunity */

export type ScoreClassification = "Hot" | "Warm" | "Cold" | "Critical";

export interface ScoringRule {
  activity: string;
  event: string;
  points: number;
}

export const SCORING_RULES: readonly ScoringRule[] = [
  { activity: "Call answered", event: "call.answered", points: 10 },
  { activity: "WhatsApp reply", event: "bot.replied", points: 15 },
  { activity: "Brochure viewed", event: "content.viewed", points: 10 },
  { activity: "Price inquiry", event: "quote.inquiry", points: 20 },
  { activity: "Finance inquiry", event: "finance.inquiry", points: 20 },
  { activity: "Test drive", event: "demo.completed", points: 30 },
  { activity: "No response", event: "engagement.no_response", points: -10 },
  { activity: "Wrong number", event: "contact.invalid", points: -100 },
] as const;

export const SCORE_BANDS: ReadonlyArray<{
  label: ScoreClassification;
  min: number;
  max: number;
}> = [
  { label: "Critical", min: 90, max: 999 },
  { label: "Hot", min: 80, max: 89 },
  { label: "Warm", min: 50, max: 79 },
  { label: "Cold", min: 20, max: 49 },
  { label: "Cold", min: 0, max: 19 },
] as const;

export interface ScoreLedgerEntry {
  id: string;
  opportunity_id: string;
  event: string;
  points: number;
  running_total: number;
  created_at: string;
}

export function classifyScore(score: number): ScoreClassification {
  if (score >= 90) return "Critical";
  if (score >= 80) return "Hot";
  if (score >= 50) return "Warm";
  return "Cold";
}

export const LEAD_SCORING_ENGINE_ID = "lead-scoring-engine" as const;
