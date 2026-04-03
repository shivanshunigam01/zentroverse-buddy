const funnelData = [
  { label: "Lead capture (CRM)", value: 1248, percentage: 100, color: "gradient-primary", barText: "text-white" },
  { label: "AI engaged (WhatsApp)", value: 986, percentage: 79, color: "bg-info", barText: "text-info-foreground" },
  { label: "Classified – warm+", value: 543, percentage: 44, color: "gradient-warning", barText: "text-warning-foreground" },
  { label: "Action touched (sales / dialer)", value: 412, percentage: 33, color: "bg-warning", barText: "text-warning-foreground" },
  { label: "Hot – ready to buy", value: 287, percentage: 23, color: "gradient-danger", barText: "text-destructive-foreground" },
  { label: "Converted", value: 156, percentage: 12.5, color: "gradient-success", barText: "text-success-foreground" },
];

const LeadFunnel = () => {
  return (
    <div className="surface-card p-4 sm:p-6 lg:p-7">
      <h3 className="mb-1 font-display text-sm font-bold tracking-tight text-foreground sm:text-base">Lead status funnel</h3>
      <p className="mb-5 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
        Intake → bot → classification → action → conversion
      </p>
      <div className="space-y-3 sm:space-y-3.5">
        {funnelData.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <span className="min-w-0 max-w-[min(100%,14rem)] text-xs font-medium leading-snug text-foreground sm:max-w-none sm:text-sm">
                {item.label}
              </span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-foreground sm:text-sm">
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="h-8 overflow-hidden rounded-xl border border-border/50 bg-secondary/80 sm:h-9">
              <div
                className={`h-full ${item.color} rounded-xl transition-all duration-700 flex items-center justify-end pr-3 min-w-[2.5rem]`}
                style={{ width: `${Math.max(item.percentage, 8)}%` }}
              >
                <span className={`text-xs font-bold drop-shadow-sm ${item.barText}`}>{item.percentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadFunnel;
