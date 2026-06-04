import { api } from "@/lib/api";

export type BotStep = { label: string; status: "done" | "pending" };

export async function fetchBotJourney(opportunityId: string) {
  return api<{
    opportunity_id: string;
    steps: BotStep[];
    messages: Array<{ message?: string; direction?: string; created_at?: string }>;
  }>(`/bot/journey/${opportunityId}`);
}

export async function sendBotMessage(opportunityId: string, message: string) {
  return api<{ log: unknown; provider_status: string }>("/bot/message", {
    method: "POST",
    json: { opportunity_id: opportunityId, message },
  });
}

export async function mindAssist(prompt: string, opportunityId?: string) {
  return api<{ prompt: string; reply: string; opportunity_id: string | null }>("/bot/mind", {
    method: "POST",
    json: { prompt, opportunity_id: opportunityId },
  });
}
