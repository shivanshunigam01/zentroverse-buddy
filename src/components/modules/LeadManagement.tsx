import { useState } from "react";
import { Search, Filter, Plus, MoreVertical, MessageSquare, Phone, Mail, ChevronDown, Eye } from "lucide-react";

const allLeads = [
  { id: 1, name: "Rajesh Kumar", phone: "+91 98765 43210", email: "rajesh@email.com", source: "Meta Ads", interest: "Thar", status: "Hot", assignee: "Anil S.", date: "2 min ago", score: 92 },
  { id: 2, name: "Priya Sharma", phone: "+91 87654 32109", email: "priya@email.com", source: "Walk-in", interest: "XUV700", status: "Warm", assignee: "Meera K.", date: "15 min ago", score: 74 },
  { id: 3, name: "Amit Patel", phone: "+91 76543 21098", email: "amit@email.com", source: "Website", interest: "Scorpio N", status: "New", assignee: "Unassigned", date: "32 min ago", score: 45 },
  { id: 4, name: "Sneha Reddy", phone: "+91 65432 10987", email: "sneha@email.com", source: "Referral", interest: "XUV300", status: "Engaged", assignee: "Rahul P.", date: "1 hr ago", score: 68 },
  { id: 5, name: "Vikram Singh", phone: "+91 54321 09876", email: "vikram@email.com", source: "Google Ads", interest: "Bolero", status: "Unresponsive", assignee: "Anil S.", date: "2 hrs ago", score: 22 },
  { id: 6, name: "Kavita Joshi", phone: "+91 43210 98765", email: "kavita@email.com", source: "Field Team", interest: "XUV700", status: "Hot", assignee: "Meera K.", date: "3 hrs ago", score: 88 },
  { id: 7, name: "Deepak Verma", phone: "+91 32109 87654", email: "deepak@email.com", source: "Meta Ads", interest: "Thar", status: "Lost", assignee: "Rahul P.", date: "5 hrs ago", score: 15 },
  { id: 8, name: "Anita Desai", phone: "+91 21098 76543", email: "anita@email.com", source: "Website", interest: "Scorpio N", status: "Finance Required", assignee: "Anil S.", date: "1 day ago", score: 61 },
];

const statusColors: Record<string, string> = {
  Hot: "bg-destructive text-destructive-foreground",
  Warm: "bg-warning text-warning-foreground",
  New: "bg-info text-info-foreground",
  Engaged: "bg-success text-success-foreground",
  Unresponsive: "bg-muted text-muted-foreground",
  Lost: "bg-foreground/20 text-foreground",
  "Finance Required": "bg-accent text-accent-foreground",
};

const LeadManagement = () => {
  const [filter, setFilter] = useState("All");
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filters = ["All", "Hot", "Warm", "New", "Engaged", "Unresponsive", "Lost"];

  const filteredLeads = allLeads.filter((lead) => {
    const matchesFilter = filter === "All" || lead.status === filter;
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.interest.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleSelect = (id: number) => {
    setSelectedLeads((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Lead Management</h2>
          <p className="text-sm text-muted-foreground">{allLeads.length} total leads • {allLeads.filter(l => l.status === "Hot").length} hot leads</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold shadow-md hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, vehicle..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f ? "gradient-primary text-primary-foreground shadow" : "bg-card text-muted-foreground border border-border hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-semibold text-muted-foreground w-8">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Lead</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Interest</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Source</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Score</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Assignee</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="p-3">
                  <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => toggleSelect(lead.id)} className="rounded" />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {lead.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-medium text-foreground">{lead.interest}</td>
                <td className="p-3 text-muted-foreground">{lead.source}</td>
                <td className="p-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusColors[lead.status] || "bg-muted text-muted-foreground"}`}>{lead.status}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full gradient-primary rounded-full" style={{ width: `${lead.score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-foreground">{lead.score}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{lead.assignee}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-md hover:bg-secondary"><MessageSquare size={14} className="text-muted-foreground" /></button>
                    <button className="p-1.5 rounded-md hover:bg-secondary"><Phone size={14} className="text-muted-foreground" /></button>
                    <button className="p-1.5 rounded-md hover:bg-secondary"><Eye size={14} className="text-muted-foreground" /></button>
                    <button className="p-1.5 rounded-md hover:bg-secondary"><MoreVertical size={14} className="text-muted-foreground" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadManagement;
