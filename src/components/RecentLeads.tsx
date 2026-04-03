import { MessageSquare, Phone, MoreVertical } from "lucide-react";

const leads = [
  { name: "Rajesh Kumar", source: "Meta Ads", status: "Hot", interest: "Thar", time: "2 min ago", statusColor: "bg-destructive text-destructive-foreground" },
  { name: "Priya Sharma", source: "Walk-in", status: "Warm", interest: "XUV700", time: "15 min ago", statusColor: "bg-warning text-warning-foreground" },
  { name: "Amit Patel", source: "Website", status: "New", interest: "Scorpio N", time: "32 min ago", statusColor: "bg-info text-info-foreground" },
  { name: "Sneha Reddy", source: "Referral", status: "Engaged", interest: "XUV300", time: "1 hr ago", statusColor: "bg-success text-success-foreground" },
  { name: "Vikram Singh", source: "Google Ads", status: "Unresponsive", interest: "Bolero", time: "2 hrs ago", statusColor: "bg-muted text-muted-foreground" },
];

const RecentLeads = () => {
  return (
    <div className="surface-card p-4 sm:p-6 lg:p-7">
      <div className="mb-5 flex items-center justify-between sm:mb-6">
        <h3 className="font-display text-sm font-bold tracking-tight text-foreground sm:text-base">Recent leads</h3>
        <button type="button" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          View all
        </button>
      </div>
      <div className="space-y-2">
        {leads.map((lead, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:bg-secondary/50 hover:border-border/60 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm shrink-0">
              {lead.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground truncate">{lead.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${lead.statusColor}`}>{lead.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lead.interest} • {lead.source} • {lead.time}
              </p>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button type="button" className="p-2 rounded-lg hover:bg-secondary" aria-label="Message">
                <MessageSquare size={14} className="text-muted-foreground" />
              </button>
              <button type="button" className="p-2 rounded-lg hover:bg-secondary" aria-label="Call">
                <Phone size={14} className="text-muted-foreground" />
              </button>
              <button type="button" className="p-2 rounded-lg hover:bg-secondary" aria-label="More">
                <MoreVertical size={14} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentLeads;
