import ModuleShell, { Btn, Section, ActionBar } from "@/components/shared/ModuleShell";

const BOT_STEPS = [
  "Welcome Sent", "Product Asked", "Location Asked", "Timeline Asked", "Finance Asked", "Callback Asked",
];

const WhatsAppBot = () => (
  <ModuleShell moduleId="whatsapp-bot">
    <Section title="C0.4 · Bot journey">
      <div className="space-y-2">
        {BOT_STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 sm:py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium">{step}</span>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${i < 2 ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"}`}>
              {i < 2 ? "Done" : "Pending"}
            </span>
          </div>
        ))}
      </div>
      <ActionBar>
        <Btn>Send Bot Message</Btn>
        <Btn variant="outline">Resend Message</Btn>
        <Btn variant="outline">View Reply</Btn>
        <Btn variant="secondary">Transfer to Executive</Btn>
      </ActionBar>
    </Section>
  </ModuleShell>
);

export default WhatsAppBot;
