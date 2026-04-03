import { Bot, Brain, Phone, RefreshCw, CheckCircle } from "lucide-react";

const engines = [
  { name: "WhatsApp Bot", icon: Bot, status: "Active", messages: "2,341 sent today", color: "text-success" },
  { name: "AI Classifier", icon: Brain, status: "Processing", messages: "89 leads queued", color: "text-warning" },
  { name: "Auto Dialer", icon: Phone, status: "Active", messages: "156 calls today", color: "text-success" },
  { name: "Lifecycle Engine", icon: RefreshCw, status: "Active", messages: "43 triggers today", color: "text-success" },
];

const EngineStatus = () => {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-base font-bold text-foreground mb-5">Engine Status</h3>
      <div className="space-y-4">
        {engines.map((engine, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <engine.icon size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{engine.name}</p>
                <div className="flex items-center gap-1">
                  <CheckCircle size={12} className={engine.color} />
                  <span className={`text-xs font-medium ${engine.color}`}>{engine.status}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{engine.messages}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineStatus;
