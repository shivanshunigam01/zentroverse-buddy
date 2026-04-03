import { Car, Wrench, Shield, Gift, Clock } from "lucide-react";

const events = [
  { icon: Car, title: "Vehicle Delivered", customer: "Rajesh Kumar - XUV700", time: "Today, 10:30 AM", type: "success" },
  { icon: Wrench, title: "Service Due Reminder", customer: "Priya Sharma - Thar", time: "Today, 9:15 AM", type: "warning" },
  { icon: Shield, title: "Insurance Expiry Alert", customer: "Amit Patel - Scorpio N", time: "Yesterday", type: "danger" },
  { icon: Gift, title: "Festival Greeting Sent", customer: "Batch: 234 customers", time: "Yesterday", type: "info" },
  { icon: Clock, title: "AMC Renewal Due", customer: "Vikram Singh - Bolero", time: "2 days ago", type: "warning" },
];

const typeColors: Record<string, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

const LifecycleTimeline = () => {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-foreground">Lifecycle Events</h3>
        <button className="text-sm text-primary font-semibold hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        {events.map((event, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[event.type]}`}>
              <event.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.customer}</p>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{event.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LifecycleTimeline;
