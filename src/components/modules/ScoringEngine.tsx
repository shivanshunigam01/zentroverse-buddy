import { SCORE_BANDS, SCORING_RULES } from "@/domain/platform";

const mockLeads = [
  { id: "LD-154", name: "Rajesh K.", score: 88, band: "Hot", delta: "+15 WA reply" },
  { id: "LD-201", name: "Priya S.", score: 62, band: "Warm", delta: "+20 finance inquiry" },
  { id: "LD-089", name: "Amit P.", score: 28, band: "Cold", delta: "-10 no response" },
];

const ScoringEngine = () => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
      <p className="text-sm font-bold text-foreground">Parallel engine — not a sales stage</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Scoring updates on every activity (C0.8). Funnel stays C0 → C1 → C1A → C2 → C3.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SCORE_BANDS.filter((b) => b.label !== "Critical").map((b) => (
        <div key={b.label} className="surface-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{b.label}</p>
          <p className="text-xs text-muted-foreground">
            {b.min}–{b.max === 999 ? "∞" : b.max} pts
          </p>
        </div>
      ))}
    </div>

    <div className="surface-card p-4 sm:p-6">
      <h3 className="font-display text-base font-bold">Scoring rules</h3>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-[10px] font-bold uppercase text-muted-foreground">
            <th className="pb-2">Activity</th>
            <th className="pb-2 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {SCORING_RULES.map((r) => (
            <tr key={r.activity} className="border-b border-border/50">
              <td className="py-2.5 text-foreground">{r.activity}</td>
              <td className={`py-2.5 text-right font-mono font-bold ${r.points < 0 ? "text-destructive" : "text-success"}`}>
                {r.points > 0 ? `+${r.points}` : r.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="surface-card p-4 sm:p-6">
      <h3 className="font-display text-base font-bold">Live score queue (mock)</h3>
      <div className="mt-3 space-y-2">
        {mockLeads.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
            <div>
              <span className="font-mono text-xs text-muted-foreground">{l.id}</span>
              <p className="font-semibold text-foreground">{l.name}</p>
              <p className="text-xs text-muted-foreground">{l.delta}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">{l.score}</p>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{l.band}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ScoringEngine;
