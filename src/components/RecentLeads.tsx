const leads = [
  { id: "LD-2026-000154", name: "Rajesh Kumar", macro: "C1", micro: "C1.5", score: "72 Warm", action: "Collect CIBIL", owner: "Finance Exec" },
  { id: "LD-2026-000201", name: "Priya Sharma", macro: "C0", micro: "C0.5", score: "45 Cold", action: "P2 dialer", owner: "Dialer" },
  { id: "LD-2026-000089", name: "Amit Patel", macro: "C0", micro: "C0.9", score: "58 Warm", action: "Send brochure", owner: "System" },
  { id: "LD-2026-000312", name: "Kavita Joshi", macro: "C2", micro: "C2.4", score: "—", action: "Billing docs", owner: "Billing" },
  { id: "LD-2026-000401", name: "Vikram Singh", macro: "C3", micro: "C3.6", score: "—", action: "Delivery proof", owner: "Delivery" },
];

const RecentLeads = () => (
  <div className="surface-card p-4 sm:p-6">
    <h3 className="font-display text-sm font-bold sm:text-base">Recent leads (backbone view)</h3>
    <p className="text-xs text-muted-foreground mb-4">Macro · micro · score · current action · owner</p>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b text-left text-[10px] font-bold uppercase text-muted-foreground">
            <th className="pb-2 pr-3">Lead</th>
            <th className="pb-2 pr-3">Stage</th>
            <th className="pb-2 pr-3">Score</th>
            <th className="pb-2 pr-3">Action</th>
            <th className="pb-2">Owner</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/20">
              <td className="py-3 pr-3">
                <p className="font-mono text-[10px] text-muted-foreground">{l.id}</p>
                <p className="font-semibold text-foreground">{l.name}</p>
              </td>
              <td className="py-3 pr-3">
                <span className="font-mono text-xs font-bold text-primary">{l.macro}</span>
                <p className="text-[11px] text-muted-foreground">{l.micro}</p>
              </td>
              <td className="py-3 pr-3 text-xs font-semibold">{l.score}</td>
              <td className="py-3 pr-3 text-xs text-foreground">{l.action}</td>
              <td className="py-3 text-xs text-muted-foreground">{l.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default RecentLeads;
