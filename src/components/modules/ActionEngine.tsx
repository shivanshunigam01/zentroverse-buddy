import { Phone, PhoneCall, PhoneOff, PhoneMissed, Play, Pause, SkipForward, Users, RefreshCw, Route } from "lucide-react";

const dialerQueue = [
  { name: "Vikram Singh", phone: "+91 54321 09876", attempts: 3, lastAttempt: "2 hrs ago", interest: "Bolero", priority: "High" },
  { name: "Deepak Verma", phone: "+91 32109 87654", attempts: 2, lastAttempt: "5 hrs ago", interest: "Thar", priority: "Medium" },
  { name: "Suresh Nair", phone: "+91 98712 34567", attempts: 1, lastAttempt: "1 day ago", interest: "XUV700", priority: "High" },
  { name: "Meena Gupta", phone: "+91 87612 34567", attempts: 4, lastAttempt: "3 hrs ago", interest: "Scorpio N", priority: "Low" },
];

const callHistory = [
  { name: "Rajesh Kumar", outcome: "Interested", duration: "3:24", time: "10:30 AM", agent: "Anil S." },
  { name: "Priya Sharma", outcome: "Follow-up", duration: "2:15", time: "10:15 AM", agent: "Meera K." },
  { name: "Amit Patel", outcome: "Not Interested", duration: "1:02", time: "9:45 AM", agent: "Rahul P." },
  { name: "Kavita Joshi", outcome: "Interested", duration: "5:33", time: "9:20 AM", agent: "Anil S." },
  { name: "Deepak Verma", outcome: "No Answer", duration: "0:30", time: "9:05 AM", agent: "System" },
];

const outcomeColors: Record<string, string> = {
  Interested: "bg-success/10 text-success",
  "Follow-up": "bg-warning/10 text-warning",
  "Not Interested": "bg-destructive/10 text-destructive",
  "No Answer": "bg-muted text-muted-foreground",
};

const ActionEngine = () => {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Dialer + sales routing • <span className="font-semibold text-foreground">156</span> calls today
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface-card p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Route size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Decision logic</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold text-success">If responsive</span> → route to{" "}
              <span className="text-foreground">sales team</span> (queue, owner, SLA).
            </li>
            <li>
              <span className="font-semibold text-warning">If not responsive</span> →{" "}
              <span className="text-foreground">auto dialer</span> with script; capture Interested / Not interested /
              Follow-up.
            </li>
            <li>
              After each call → <span className="text-foreground">outcome tags → CRM</span> → back to classification.
            </li>
          </ul>
        </div>
        <div className="surface-card p-5 lg:p-6 border-primary/20 bg-gradient-to-br from-primary/[0.07] to-accent/[0.05]">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Intelligence loop</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Repeat until converted, lost, or recycled:</p>
          <p className="text-sm font-mono text-foreground leading-relaxed">
            Lead → Bot → Classification → Action → Classification → Action → …
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-[10px] px-2 py-1 rounded-full bg-success/15 text-success font-bold">Converted</span>
            <span className="text-[10px] px-2 py-1 rounded-full bg-destructive/15 text-destructive font-bold">Lost</span>
            <span className="text-[10px] px-2 py-1 rounded-full bg-warning/15 text-warning font-bold">Recycled</span>
          </div>
        </div>
      </div>

      <div className="surface-card p-4 lg:p-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-success" />
          <div>
            <p className="text-xs font-bold text-foreground">Sales queue</p>
            <p className="text-[10px] text-muted-foreground">Hot / warm / finance / test drive</p>
          </div>
        </div>
        <div className="h-8 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <Phone size={18} className="text-primary" />
          <div>
            <p className="text-xs font-bold text-foreground">Dialer queue</p>
            <p className="text-[10px] text-muted-foreground">Unresponsive & no bot reply</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Calls Today", value: "156", icon: Phone, gradient: "gradient-primary" },
          { label: "Connected", value: "98", icon: PhoneCall, gradient: "gradient-success" },
          { label: "No Answer", value: "41", icon: PhoneMissed, gradient: "gradient-warning" },
          { label: "Rejected", value: "17", icon: PhoneOff, gradient: "gradient-danger" },
        ].map((s) => (
          <div key={s.label} className="surface-card p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.gradient} flex items-center justify-center`}>
              <s.icon size={20} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Dialer Queue */}
        <div className="surface-card p-6 lg:p-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">Dialer Queue</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20"><Play size={14} /></button>
              <button className="p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary"><Pause size={14} /></button>
              <button className="p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary"><SkipForward size={14} /></button>
            </div>
          </div>
          <div className="space-y-3">
            {dialerQueue.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {item.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.interest} • {item.attempts} attempts • {item.lastAttempt}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.priority === "High" ? "bg-destructive/10 text-destructive" : item.priority === "Medium" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                  {item.priority}
                </span>
                <button className="p-2 rounded-lg bg-success text-success-foreground hover:opacity-80"><Phone size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Call History */}
        <div className="surface-card p-6 lg:p-7">
          <h3 className="text-base font-bold text-foreground mb-4">Recent Calls</h3>
          <div className="space-y-3">
            {callHistory.map((call, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {call.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{call.name}</p>
                  <p className="text-xs text-muted-foreground">{call.agent} • {call.duration} • {call.time}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${outcomeColors[call.outcome]}`}>{call.outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionEngine;
