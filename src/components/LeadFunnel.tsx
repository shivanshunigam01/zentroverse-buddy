const funnelData = [
  { label: "Total Leads", value: 1248, percentage: 100, color: "gradient-primary" },
  { label: "AI Engaged", value: 986, percentage: 79, color: "bg-info" },
  { label: "Warm Leads", value: 543, percentage: 44, color: "gradient-warning" },
  { label: "Hot Leads", value: 287, percentage: 23, color: "bg-warning" },
  { label: "Converted", value: 156, percentage: 12.5, color: "gradient-success" },
];

const LeadFunnel = () => {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-base font-bold text-foreground mb-5">Lead Conversion Funnel</h3>
      <div className="space-y-3">
        {funnelData.map((item, i) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-sm font-bold text-foreground">{item.value.toLocaleString()}</span>
            </div>
            <div className="h-8 bg-secondary rounded-lg overflow-hidden relative">
              <div
                className={`h-full ${item.color} rounded-lg transition-all duration-700 flex items-center justify-end pr-3`}
                style={{ width: `${item.percentage}%` }}
              >
                <span className="text-xs font-bold text-primary-foreground">{item.percentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadFunnel;
