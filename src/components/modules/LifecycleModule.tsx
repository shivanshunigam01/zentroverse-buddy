import { Car, Wrench, Shield, Gift, Clock, CheckCircle, AlertTriangle, FileText, Sparkles, PartyPopper } from "lucide-react";

const stages = [
  {
    title: "PDI (Pre Delivery Inspection)",
    icon: FileText,
    color: "bg-info/10 text-info",
    items: [
      { task: "Welcome message sent", status: "done" },
      { task: "Vehicle readiness confirmed", status: "done" },
      { task: "Documents checklist shared", status: "pending" },
    ],
  },
  {
    title: "Delivery Stage",
    icon: Car,
    color: "bg-success/10 text-success",
    items: [
      { task: "Thank you message", status: "done" },
      { task: "Branch contact shared", status: "done" },
      { task: "SPOC details sent", status: "done" },
    ],
  },
  {
    title: "Service Journey",
    icon: Wrench,
    color: "bg-warning/10 text-warning",
    items: [
      { task: "Service due reminder", status: "done" },
      { task: "Booking confirmed", status: "done" },
      { task: "Vehicle received", status: "done" },
      { task: "Estimate approval", status: "in_progress" },
      { task: "Work in progress", status: "pending" },
      { task: "Vehicle ready", status: "pending" },
      { task: "Bill generated", status: "pending" },
      { task: "SOA shared", status: "pending" },
    ],
  },
];

const renewals = [
  { type: "Insurance Expiry", customer: "Rajesh Kumar", due: "15 Apr 2026", urgency: "urgent" },
  { type: "Tax Renewal", customer: "Priya Sharma", due: "22 Apr 2026", urgency: "warning" },
  { type: "Fitness Certificate", customer: "Amit Patel", due: "10 May 2026", urgency: "normal" },
  { type: "AMC Renewal", customer: "Sneha Reddy", due: "30 Apr 2026", urgency: "warning" },
];

const aiLifecycle = [
  { rule: "Ignores service reminders 2×", action: "Escalate to outbound call", priority: "High" },
  { rule: "High LTV / repeat buyer", action: "Priority lane + dedicated SPOC", priority: "High" },
  { rule: "Inactive 90+ days", action: "Reactivation WhatsApp + offer", priority: "Medium" },
];

const engagement = [
  { name: "Festival greetings", status: "Scheduled — Diwali", reach: "12.4k" },
  { name: "Loyalty rewards", status: "Active tier program", reach: "3.1k" },
  { name: "Referral program", status: "Payouts this month", reach: "892" },
  { name: "New vehicle launch", status: "Teaser blast", reach: "5.6k" },
];

const upsells = [
  { offer: "Tyre Replacement Package", eligible: 234, sent: 189, converted: 34, revenue: "₹12.4L" },
  { offer: "AMC Gold Package", eligible: 156, sent: 142, converted: 28, revenue: "₹8.7L" },
  { offer: "Extended Warranty", eligible: 312, sent: 278, converted: 56, revenue: "₹22.1L" },
  { offer: "Exchange Offer – XUV700", eligible: 89, sent: 76, converted: 12, revenue: "₹1.2Cr" },
];

const LifecycleModule = () => {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Trigger: <span className="font-semibold text-foreground">delivery complete</span> •{" "}
        <span className="font-semibold text-foreground">892</span> active customers
      </p>

      {/* Stages */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {stages.map((stage) => (
          <div key={stage.title} className="surface-card p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-9 h-9 rounded-lg ${stage.color} flex items-center justify-center`}>
                <stage.icon size={18} />
              </div>
              <h3 className="text-sm font-bold text-foreground">{stage.title}</h3>
            </div>
            <div className="space-y-2">
              {stage.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {item.status === "done" ? (
                    <CheckCircle size={14} className="text-success flex-shrink-0" />
                  ) : item.status === "in_progress" ? (
                    <Clock size={14} className="text-warning flex-shrink-0 animate-pulse" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-border flex-shrink-0" />
                  )}
                  <span className={item.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}>{item.task}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="surface-card p-6 xl:col-span-2">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-primary" /> AI in lifecycle
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiLifecycle.map((a) => (
              <div key={a.rule} className="p-3 bg-secondary/40 rounded-lg border border-border/50">
                <p className="text-xs font-semibold text-foreground">{a.rule}</p>
                <p className="text-xs text-primary mt-1">{a.action}</p>
                <span className="text-[10px] text-muted-foreground">{a.priority} priority</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6 xl:col-span-2">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <PartyPopper size={18} className="text-accent" /> Continuous engagement
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {engagement.map((e) => (
              <div key={e.name} className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm font-semibold text-foreground">{e.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{e.status}</p>
                <p className="text-[10px] text-success font-bold mt-2">Reach: {e.reach}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Renewals */}
        <div className="surface-card p-6 lg:p-7">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield size={18} className="text-primary" /> Renewals & Compliance
          </h3>
          <div className="space-y-3">
            {renewals.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <AlertTriangle size={16} className={r.urgency === "urgent" ? "text-destructive" : r.urgency === "warning" ? "text-warning" : "text-muted-foreground"} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{r.type}</p>
                  <p className="text-xs text-muted-foreground">{r.customer} • Due: {r.due}</p>
                </div>
                <button className="text-xs text-primary font-semibold hover:underline">Send Reminder</button>
              </div>
            ))}
          </div>
        </div>

        {/* Upsell */}
        <div className="surface-card p-6 lg:p-7">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Gift size={18} className="text-primary" /> Upsell & Revenue
          </h3>
          <div className="space-y-3">
            {upsells.map((u, i) => (
              <div key={i} className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">{u.offer}</p>
                  <span className="text-sm font-bold text-success">{u.revenue}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Eligible: {u.eligible}</span>
                  <span>Sent: {u.sent}</span>
                  <span className="text-success font-semibold">Converted: {u.converted}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifecycleModule;
