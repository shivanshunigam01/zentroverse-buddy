import { MessageSquare, Phone, MoreVertical } from "lucide-react";

const leads = [
  { name: "Rajesh Kumar", source: "Meta Ads", status: "Hot", interest: "Thar", time: "2 min ago", statusColor: "bg-destructive" },
  { name: "Priya Sharma", source: "Walk-in", status: "Warm", interest: "XUV700", time: "15 min ago", statusColor: "bg-warning" },
  { name: "Amit Patel", source: "Website", status: "New", interest: "Scorpio N", time: "32 min ago", statusColor: "bg-info" },
  { name: "Sneha Reddy", source: "Referral", status: "Engaged", interest: "XUV300", time: "1 hr ago", statusColor: "bg-success" },
  { name: "Vikram Singh", source: "Google Ads", status: "Unresponsive", interest: "Bolero", time: "2 hrs ago", statusColor: "bg-muted-foreground" },
];

const RecentLeads = () => {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-foreground">Recent Leads</h3>
        <button className="text-sm text-primary font-semibold hover:underline">View All</button>
      </div>
      <div className="space-y-3">
        {leads.map((lead, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {lead.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{lead.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-primary-foreground ${lead.statusColor}`}>
                  {lead.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{lead.interest} • {lead.source} • {lead.time}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-md hover:bg-secondary"><MessageSquare size={14} className="text-muted-foreground" /></button>
              <button className="p-1.5 rounded-md hover:bg-secondary"><Phone size={14} className="text-muted-foreground" /></button>
              <button className="p-1.5 rounded-md hover:bg-secondary"><MoreVertical size={14} className="text-muted-foreground" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentLeads;
