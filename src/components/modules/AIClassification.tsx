import { Brain, ArrowRight, RefreshCw } from "lucide-react";

const categories = [
  { name: "New – Unresponsive", count: 234, color: "bg-muted", textColor: "text-muted-foreground", pct: 19 },
  { name: "New – Engaged", count: 312, color: "bg-info", textColor: "text-info", pct: 25 },
  { name: "Warm – Interested", count: 198, color: "bg-warning", textColor: "text-warning", pct: 16 },
  { name: "Hot – Ready to Buy", count: 156, color: "bg-destructive", textColor: "text-destructive", pct: 12.5 },
  { name: "Finance Required", count: 87, color: "bg-accent", textColor: "text-accent", pct: 7 },
  { name: "Test Drive Required", count: 105, color: "bg-success", textColor: "text-success", pct: 8.4 },
  { name: "Lost – Price", count: 67, color: "bg-foreground/20", textColor: "text-foreground/60", pct: 5.4 },
  { name: "Lost – Postponed", count: 52, color: "bg-foreground/20", textColor: "text-foreground/60", pct: 4.2 },
  { name: "Lost – No Response", count: 37, color: "bg-foreground/20", textColor: "text-foreground/60", pct: 3 },
];

const rules = [
  { condition: "Bot reply within 5 min + interest shown", action: "Classify as Hot", arrow: "→", result: "Route to Sales" },
  { condition: "No response after 24 hrs", action: "Classify as Unresponsive", arrow: "→", result: "Route to Auto Dialer" },
  { condition: "Asked about finance/EMI", action: "Classify as Finance Required", arrow: "→", result: "Share calculator" },
  { condition: "Requested test drive", action: "Classify as Test Drive Required", arrow: "→", result: "Book slot" },
  { condition: "3+ follow-ups, no response", action: "Classify as Lost – No Response", arrow: "→", result: "Move to recycle" },
];

const AIClassification = () => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">AI Classification Engine</h2>
        <p className="text-sm text-muted-foreground">Real-time lead scoring & categorization • 1,248 leads classified</p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.name} className="glass-card rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${cat.color} ${cat.textColor}`}>{cat.name}</span>
              <span className="text-lg font-bold text-foreground">{cat.count}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full ${cat.color} rounded-full transition-all duration-500`} style={{ width: `${cat.pct}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{cat.pct}% of total leads</p>
          </div>
        ))}
      </div>

      {/* Classification Rules */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Brain size={18} className="text-primary" /> Classification Rules
          </h3>
          <button className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
            <RefreshCw size={14} /> Retrain Model
          </button>
        </div>
        <div className="space-y-3">
          {rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{rule.condition}</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary">{rule.action}</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{rule.result}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIClassification;
