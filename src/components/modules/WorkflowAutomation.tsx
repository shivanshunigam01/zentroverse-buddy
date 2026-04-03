import { GitBranch, Zap, Clock, Webhook } from "lucide-react";

const triggers = [
  { name: "Lead created", effect: "Fire WhatsApp welcome + template", channel: "WhatsApp API" },
  { name: "No bot reply 24h", effect: "Enqueue auto dialer + tag Unresponsive", channel: "Dialer + CRM" },
  { name: "Call outcome = Interested", effect: "Re-run classification → route Sales", channel: "Action Engine" },
  { name: "Delivery marked complete", effect: "Promote to Customer + start PDI workflow", channel: "Lifecycle" },
  { name: "Service due (km / date)", effect: "Reminder + booking deep link", channel: "Notifications" },
  { name: "Insurance expiry -30d", effect: "Renewal campaign + compliance task", channel: "Lifecycle" },
];

const WorkflowAutomation = () => {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Event-driven automations across intake, bot, dialer, and lifecycle</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active workflows", value: "28", icon: GitBranch, hint: "Versioned rules" },
          { label: "Runs today", value: "1,842", icon: Zap, hint: "Triggers executed" },
          { label: "Scheduled", value: "316", icon: Clock, hint: "Delayed / recurring" },
        ].map((c) => (
          <div key={c.label} className="surface-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center">
              <c.icon size={20} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs font-semibold text-foreground">{c.label}</p>
              <p className="text-[10px] text-muted-foreground">{c.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="surface-card p-6 lg:p-7">
        <div className="flex items-center gap-2 mb-4">
          <Webhook size={18} className="text-primary" />
          <h3 className="text-base font-bold text-foreground font-display">Key automations</h3>
        </div>
        <div className="space-y-3">
          {triggers.map((t) => (
            <div
              key={t.name}
              className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-secondary/40 rounded-lg border border-border/50"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.effect}</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-bold whitespace-nowrap self-start sm:self-center">
                {t.channel}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card p-6 lg:p-7">
        <h3 className="mb-3 text-base font-bold text-foreground font-display">What automation connects</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Rules tie intake, WhatsApp, classification, dialer, lifecycle, and notifications into one operating rhythm — no
          manual handoffs required for standard paths.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "Lead and customer records stay the single source of truth",
            "Bot, call, and agent touches all write back to the same timeline",
            "Lifecycle steps fire from delivery, service dates, and compliance windows",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WorkflowAutomation;
