import { useEffect, useState } from "react";
import { toast } from "sonner";
import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";
import { useOpportunityActions } from "@/hooks/use-opportunity-actions";
import { useOpportunityList } from "@/store/selectors";
import * as botApi from "@/api/bot.api";
import { mindAssist } from "@/api/bot.api";
import { ApiClientError } from "@/lib/api";

const WhatsAppBot = () => {
  const opportunities = useOpportunityList();
  const opp = opportunities[0];
  const { run } = useOpportunityActions(opp?.opportunity_id);
  const [steps, setSteps] = useState<botApi.BotStep[]>([]);
  const [mindPrompt, setMindPrompt] = useState("");
  const [mindReply, setMindReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!opp?.opportunity_id) return;
    botApi
      .fetchBotJourney(opp.opportunity_id)
      .then((data) => setSteps(data.steps))
      .catch(() => setSteps([]));
  }, [opp?.opportunity_id]);

  const sendMessage = async () => {
    if (!opp) {
      toast.error("No lead", { description: "Import leads first" });
      return;
    }
    try {
      await botApi.sendBotMessage(opp.opportunity_id, "ZentroFlow bot follow-up message");
      toast.success("Message queued");
      const data = await botApi.fetchBotJourney(opp.opportunity_id);
      setSteps(data.steps);
      run("Send Bot Message", { opportunityId: opp.opportunity_id });
    } catch (err) {
      toast.error("Send failed", { description: err instanceof ApiClientError ? err.message : "API error" });
    }
  };

  const askMind = async () => {
    if (!mindPrompt.trim()) return;
    setLoading(true);
    try {
      const res = await mindAssist(mindPrompt, opp?.opportunity_id);
      setMindReply(res.reply);
    } catch (err) {
      toast.error("Mind assist failed", { description: err instanceof ApiClientError ? err.message : "API error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleShell moduleId="whatsapp-bot">
      <Section title="C0.4 · Bot journey">
        {!opp && (
          <p className="text-sm text-muted-foreground">Upload leads to activate WhatsApp bot journey.</p>
        )}
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium">{step.label}</span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  step.status === "done" ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
                }`}
              >
                {step.status === "done" ? "Done" : "Pending"}
              </span>
            </div>
          ))}
        </div>
        <ActionBar>
          <Btn onClick={sendMessage} disabled={!opp}>Send Bot Message</Btn>
          <Btn variant="outline" onClick={() => run("Resend Message", { opportunityId: opp?.opportunity_id })}>Resend Message</Btn>
          <Btn variant="outline" onClick={() => run("View Reply", { opportunityId: opp?.opportunity_id })}>View Reply</Btn>
          <Btn variant="secondary" onClick={() => run("Transfer to Executive", { opportunityId: opp?.opportunity_id })}>Transfer to Executive</Btn>
        </ActionBar>
      </Section>

      <Section title="ZentroFlow Mind">
        <p className="text-sm text-muted-foreground">
          Context-aware assistant (API). {opp ? `Context: ${opp.opportunity_id}` : "Import a lead for opportunity context."}
        </p>
        <textarea
          className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
          rows={3}
          placeholder="Ask about next action, stage, or owner…"
          value={mindPrompt}
          onChange={(e) => setMindPrompt(e.target.value)}
        />
        <ActionBar>
          <Btn onClick={askMind} disabled={loading}>{loading ? "Thinking…" : "Ask Mind"}</Btn>
        </ActionBar>
        {mindReply && (
          <div className="mt-3 rounded-xl bg-secondary/40 px-4 py-3 text-sm">{mindReply}</div>
        )}
      </Section>
    </ModuleShell>
  );
};

export default WhatsAppBot;
