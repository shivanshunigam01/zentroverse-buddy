import { Car, Wrench, Shield, Gift, Clock } from "lucide-react";

const events = [
  { icon: Car, title: "Vehicle delivered", customer: "Rajesh Kumar - XUV700", time: "Today, 10:30 AM", type: "success" },
  { icon: Wrench, title: "Service due reminder", customer: "Priya Sharma - Thar", time: "Today, 9:15 AM", type: "warning" },
  { icon: Shield, title: "Insurance expiry alert", customer: "Amit Patel - Scorpio N", time: "Yesterday", type: "danger" },
  { icon: Gift, title: "Festival greeting sent", customer: "Batch: 234 customers", time: "Yesterday", type: "info" },
  { icon: Clock, title: "AMC renewal due", customer: "Vikram Singh - Bolero", time: "2 days ago", type: "warning" },
];

const typeColors: Record<string, string> = {
  success: "bg-success/12 text-success border-success/20",
  warning: "bg-warning/12 text-warning border-warning/20",
  danger: "bg-destructive/12 text-destructive border-destructive/20",
  info: "bg-info/12 text-info border-info/20",
};

const LifecycleTimeline = () => {
  return (
    <div className="surface-card p-4 sm:p-6 lg:p-7">
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <h3 className="font-display text-sm font-bold tracking-tight text-foreground sm:text-base">Lifecycle events</h3>
        <button type="button" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          View all
        </button>
      </div>
      <div className="space-y-3">
        {events.map((event, i) => (
          <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-secondary/40 transition-colors">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${typeColors[event.type]}`}
            >
              <event.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.customer}</p>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap pt-0.5">{event.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LifecycleTimeline;
