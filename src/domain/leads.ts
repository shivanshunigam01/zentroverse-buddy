/** Lead model — backbone fields on every card / row */

export type Lead = {
  leadId: string;
  customerId: string;
  opportunityId: string;
  customerName: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  district: string;
  product: string;
  source: string;
  campaign?: string;
  branch: string;
  leadType: string;
  currentStage: string;
  microStage: string;
  leadScore: number;
  scoreLabel: "Cold" | "Warm" | "Hot" | "Critical";
  priority: "P1" | "P2" | "P3" | "P4" | "P5";
  currentOwner: string;
  currentAction: string;
  nextAction: string;
  nextActionAt: string;
  slaTime: string;
  slaCountdown?: string;
  escalationOwner: string;
  status: "Open" | "Hold" | "Lost" | "Delivered";
};

export const MOCK_LEADS: Lead[] = [
  {
    leadId: "LD-2026-000154",
    customerId: "CU-88421",
    opportunityId: "OP-2026-0154",
    customerName: "Rajesh Kumar",
    mobile: "+91 98765 43210",
    email: "rajesh@email.com",
    district: "Mumbai",
    product: "Tata Yodha",
    source: "Meta Ads",
    campaign: "Yodha Q2",
    branch: "Andheri",
    leadType: "New Lead",
    currentStage: "C1",
    microStage: "C1.5 Finance Discussion",
    leadScore: 72,
    scoreLabel: "Warm",
    priority: "P1",
    currentOwner: "Finance Executive",
    currentAction: "Collect CIBIL Consent",
    nextAction: "Generate Eligibility Report",
    nextActionAt: "Today, 6:00 PM",
    slaTime: "4 hrs",
    slaCountdown: "2h 14m",
    escalationOwner: "Finance Manager",
    status: "Open",
  },
  {
    leadId: "LD-2026-000201",
    customerId: "CU-90102",
    opportunityId: "OP-2026-0201",
    customerName: "Priya Sharma",
    mobile: "+91 87654 32109",
    district: "Delhi NCR",
    product: "Tata Intra V70",
    source: "Website",
    branch: "Noida",
    leadType: "Cross-Sell Lead",
    currentStage: "C0",
    microStage: "C0.5 Autodialer",
    leadScore: 45,
    scoreLabel: "Cold",
    priority: "P2",
    currentOwner: "Dialer",
    currentAction: "P2 WA read — retry call",
    nextAction: "Assign executive if connected",
    nextActionAt: "Today, 3:30 PM",
    slaTime: "30 min",
    slaCountdown: "8m",
    escalationOwner: "Team Leader",
    status: "Open",
  },
  {
    leadId: "LD-2026-000089",
    customerId: "CU-77201",
    opportunityId: "OP-2026-0089",
    customerName: "Amit Patel",
    mobile: "+91 76543 21098",
    district: "Pune",
    product: "Tata Ace",
    source: "Walk-in",
    branch: "Pune City",
    leadType: "New Lead",
    currentStage: "C0",
    microStage: "C0.9 Next Best Action",
    leadScore: 58,
    scoreLabel: "Warm",
    priority: "P4",
    currentOwner: "System",
    currentAction: "Send brochure",
    nextAction: "Schedule call",
    nextActionAt: "Tomorrow, 11 AM",
    slaTime: "1 hr",
    escalationOwner: "Sales Manager",
    status: "Open",
  },
  {
    leadId: "LD-2026-000312",
    customerId: "CU-81200",
    opportunityId: "OP-2026-0312",
    customerName: "Kavita Joshi",
    mobile: "+91 43210 98765",
    district: "Bengaluru",
    product: "Tata Ultra",
    source: "Google Ads",
    branch: "Whitefield",
    leadType: "Existing Customer Lead",
    currentStage: "C2",
    microStage: "C2.4 Billing Docs",
    leadScore: 88,
    scoreLabel: "Hot",
    priority: "P1",
    currentOwner: "Billing Team",
    currentAction: "Collect billing documents",
    nextAction: "Update disbursement",
    nextActionAt: "Today, 5:00 PM",
    slaTime: "24 hrs",
    slaCountdown: "Overdue",
    escalationOwner: "Branch Head",
    status: "Open",
  },
];

export const DEFAULT_LEAD = MOCK_LEADS[0];

export function getLeadById(id: string): Lead | undefined {
  return MOCK_LEADS.find((l) => l.leadId === id);
}
