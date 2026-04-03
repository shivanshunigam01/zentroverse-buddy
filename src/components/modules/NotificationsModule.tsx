import { Bell, Check, MessageSquare, Phone, Car, Shield, Gift, Clock } from "lucide-react";
import { useState } from "react";

const notifications = [
  { id: 1, icon: Phone, type: "Lead", title: "Hot lead: Rajesh Kumar wants Thar AX Opt", time: "2 min ago", read: false, color: "text-destructive bg-destructive/10" },
  { id: 2, icon: MessageSquare, type: "Bot", title: "AI Bot engaged with 23 new leads", time: "15 min ago", read: false, color: "text-primary bg-primary/10" },
  { id: 3, icon: Car, type: "Delivery", title: "Vehicle delivered: Priya Sharma – XUV700", time: "1 hr ago", read: false, color: "text-success bg-success/10" },
  { id: 4, icon: Shield, type: "Alert", title: "Insurance expiry: 12 customers this week", time: "2 hrs ago", read: true, color: "text-warning bg-warning/10" },
  { id: 5, icon: Gift, type: "Campaign", title: "Festival greeting campaign sent to 234 customers", time: "3 hrs ago", read: true, color: "text-accent bg-accent/10" },
  { id: 6, icon: Phone, type: "Dialer", title: "Auto dialer completed batch: 89 calls, 34 connected", time: "4 hrs ago", read: true, color: "text-info bg-info/10" },
  { id: 7, icon: Car, type: "Service", title: "Service booking: Amit Patel – Scorpio N", time: "5 hrs ago", read: true, color: "text-success bg-success/10" },
  { id: 8, icon: MessageSquare, type: "Bot", title: "New bot template 'Finance Calculator' performing well – 38% conversion", time: "1 day ago", read: true, color: "text-primary bg-primary/10" },
];

const NotificationsModule = () => {
  const [items, setItems] = useState(notifications);
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) => setItems(items.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{unread}</span> unread
          </p>
        </div>
        <button onClick={markAllRead} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
          <Check size={14} /> Mark all read
        </button>
      </div>

      <div className="surface-card divide-y divide-border/60 overflow-hidden">
        {items.map((n) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-secondary/30 ${!n.read ? "bg-primary/5" : ""}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${n.color}`}>
              <n.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-secondary text-muted-foreground">{n.type}</span>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <p className={`text-sm mt-0.5 ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
              <Clock size={10} /> {n.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsModule;
