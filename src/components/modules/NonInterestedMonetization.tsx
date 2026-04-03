import { UserPlus, MapPin, Share2, ArrowRight, Sparkles } from "lucide-react";

const paths = [
  {
    title: "Freelancer partner",
    desc: "Refer leads on flexible basis; track payouts in CRM.",
    icon: UserPlus,
    pipeline: 89,
    revenue: "₹4.2L/mo",
  },
  {
    title: "Lead generator",
    desc: "Structured lead-gen program with quality tiers.",
    icon: Share2,
    pipeline: 156,
    revenue: "₹6.8L/mo",
  },
  {
    title: "Rural partner",
    desc: "Hyperlocal coverage + assisted digital onboarding.",
    icon: MapPin,
    pipeline: 42,
    revenue: "₹2.1L/mo",
  },
];

const NonInterestedMonetization = () => {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Not interested → alternate revenue: freelancer, lead generator, rural partner
      </p>

      <div className="surface-card p-5 lg:p-6 border-l-4 border-accent flex gap-3">
        <Sparkles className="text-accent flex-shrink-0" size={22} />
        <div>
          <p className="text-sm font-bold text-foreground">Flow</p>
          <p className="text-xs text-muted-foreground mt-1">
            Not Interested → offer opportunity → enroll → track outcomes as a new revenue channel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {paths.map((p) => (
          <div key={p.title} className="surface-card p-5 lg:p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                <p.icon size={18} className="text-accent" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground flex-1">{p.desc}</p>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active pipeline</span>
              <span className="font-bold text-foreground">{p.pipeline}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">Est. channel revenue</span>
              <span className="font-bold text-success">{p.revenue}</span>
            </div>
            <button className="mt-4 w-full py-2 rounded-lg text-xs font-semibold border border-border hover:bg-secondary flex items-center justify-center gap-1">
              Configure offer <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NonInterestedMonetization;
