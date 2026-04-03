import { Car, Wrench, AlertTriangle, BookOpen, Gauge, Fuel } from "lucide-react";

const tips = [
  { icon: Fuel, title: "Fuel Efficiency Tips", desc: "Drive in the 1500-2500 RPM range for optimal mileage", category: "Do's" },
  { icon: Wrench, title: "Regular Oil Check", desc: "Check engine oil every 2 weeks or before long trips", category: "Do's" },
  { icon: AlertTriangle, title: "Avoid Over-revving", desc: "Don't push beyond redline, especially in cold starts", category: "Don'ts" },
  { icon: Gauge, title: "Tyre Pressure", desc: "Maintain recommended PSI – check monthly", category: "Do's" },
];

const alerts = [
  { type: "Breakdown assistance", customer: "Rajesh Kumar", vehicle: "Thar – MH 02 AB 1234", location: "Mumbai-Pune Expressway", time: "5 min ago", severity: "critical" },
  { type: "Accident support", customer: "Priya Sharma", vehicle: "XUV700 – DL 04 CD 5678", location: "Ring Road, Delhi", time: "20 min ago", severity: "critical" },
  { type: "Insurance claim help", customer: "Sneha Reddy", vehicle: "XUV300 – TS 09 GH 3344", location: "Workshop intake", time: "35 min ago", severity: "critical" },
  { type: "Battery drain alert", customer: "Amit Patel", vehicle: "Scorpio N – KA 01 EF 9012", location: "Parked – Home", time: "1 hr ago", severity: "warning" },
];

const insights = [
  { driver: "Rajesh Kumar", score: 87, mileage: "14.2 km/l", harshBrakes: 3, overSpeed: 1 },
  { driver: "Priya Sharma", score: 92, mileage: "12.8 km/l", harshBrakes: 1, overSpeed: 0 },
  { driver: "Amit Patel", score: 65, mileage: "10.1 km/l", harshBrakes: 8, overSpeed: 5 },
];

const VehicleCare = () => {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Education, critical alerts & driver insights (IoT-ready)</p>

      {/* Critical Alerts */}
      <div className="surface-card p-6 lg:p-7 border-l-4 border-destructive">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-destructive" /> Critical Alerts
        </h3>
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-4 p-3 rounded-lg ${alert.severity === "critical" ? "bg-destructive/5 border border-destructive/20" : "bg-warning/5 border border-warning/20"}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{alert.type}</p>
                <p className="text-xs text-muted-foreground">{alert.customer} • {alert.vehicle}</p>
                <p className="text-xs text-muted-foreground">{alert.location} • {alert.time}</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg gradient-danger text-primary-foreground text-xs font-bold">Respond</button>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card p-5 lg:p-6 border border-info/25 bg-info/[0.06]">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <Gauge size={16} className="text-info" /> Instrument cluster & education
        </h3>
        <p className="text-xs text-muted-foreground">
          Push bite-sized videos / carousels: warning lamps, regen levels, 4WD modes, service indicators. Tie to vehicle VIN
          where available.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Tips */}
        <div className="surface-card p-6 lg:p-7">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Do's, don'ts & maintenance tips
          </h3>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <tip.icon size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tip.category === "Do's" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{tip.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Performance */}
        <div className="surface-card p-6 lg:p-7">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Gauge size={18} className="text-primary" /> Driver Performance
          </h3>
          <div className="space-y-3">
            {insights.map((d, i) => (
              <div key={i} className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">{d.driver}</p>
                  <span className={`text-sm font-bold ${d.score >= 80 ? "text-success" : d.score >= 60 ? "text-warning" : "text-destructive"}`}>{d.score}/100</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${d.score >= 80 ? "gradient-success" : d.score >= 60 ? "gradient-warning" : "gradient-danger"}`} style={{ width: `${d.score}%` }} />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>⛽ {d.mileage}</span>
                  <span>🛑 {d.harshBrakes} hard brakes</span>
                  <span>⚡ {d.overSpeed} over-speed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCare;
