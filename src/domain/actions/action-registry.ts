import type { AppModuleId } from "@/domain/app-nav";
import type { DomainEventType } from "@/domain/events/event-types";
import type { MacroStageId, MicroStageCode } from "@/domain/stages/types";
import { getMicroStagesForMacro } from "@/domain/stages/business-stages";

export type ActionEffect = {
  microStage?: MicroStageCode;
  macroStage?: "C0" | "C1" | "C1A" | "C2" | "C3" | "lifecycle";
  navigateTo?: AppModuleId;
  scoreEvent?: string;
  eventType?: DomainEventType;
  status?: "Open" | "Hold" | "Lost" | "Delivered" | "Closed";
  description?: string;
};

export const ACTION_REGISTRY: Record<string, ActionEffect> = {
  "Move to C1": { macroStage: "C1", microStage: "C1.1", navigateTo: "sales-pipeline", eventType: "lead.qualified" },
  "Move to C1A": { macroStage: "C1A", microStage: "C1A.1", navigateTo: "finance-desk", eventType: "finance.started" },
  "Move to C2": { macroStage: "C2", microStage: "C2.1", navigateTo: "booking-billing", eventType: "booking.done" },
  "Move to C3": { macroStage: "C3", microStage: "C3.1", navigateTo: "delivery-desk" },
  "Move to Nurture": { navigateTo: "re-engagement", status: "Hold", description: "Moved to nurture queue" },
  "Activate Lifecycle": { macroStage: "lifecycle", microStage: "L1", navigateTo: "lifecycle-crm", eventType: "delivery.done" },

  "Accept Action": { description: "Current action accepted · SLA timer reset" },
  "Change Action": { description: "Action editor opened" },
  "Assign Owner": { navigateTo: "action-engine", description: "Owner assignment queued" },
  "Verify Number": { eventType: "contact.verified", description: "Mobile verified · contact health updated" },
  "Check WhatsApp": { navigateTo: "whatsapp-bot", description: "WhatsApp status checked" },
  "Send Test Message": { navigateTo: "whatsapp-bot", eventType: "bot.engaged", scoreEvent: "bot.replied" },
  "Move to Bot": { navigateTo: "whatsapp-bot", eventType: "bot.engaged" },
  "Move to Dialer": { navigateTo: "autodialer" },
  "Mark Invalid": { status: "Lost", scoreEvent: "contact.invalid", description: "Marked invalid · score -100" },
  "Merge Lead": { description: "Duplicate merge initiated" },
  "New Opportunity": { navigateTo: "lead-upload", description: "New opportunity form" },
  "Reopen Old Lead": { status: "Open", description: "Opportunity reopened" },
  "Alert Manager": { description: "Manager alerted via escalation engine" },

  "Send Bot Message": { navigateTo: "whatsapp-bot", eventType: "bot.engaged", scoreEvent: "bot.replied" },
  "Resend Message": { navigateTo: "whatsapp-bot", description: "Message resent" },
  "View Reply": { navigateTo: "whatsapp-bot", description: "Opening reply thread" },
  "Transfer to Executive": { navigateTo: "action-engine", description: "Transferred to executive queue" },

  "Save Discovery": { microStage: "C0.2", scoreEvent: "call.answered", description: "Discovery saved" },
  "Mark Qualified": { microStage: "C0.3", eventType: "lead.qualified", description: "Lead qualified" },
  "Upload Document": { description: "Document upload dialog" },

  "Create Quote": { microStage: "C1.1", eventType: "quote.shared" },
  "Send Quote": { microStage: "C1.1", eventType: "quote.shared", scoreEvent: "quote.inquiry" },
  "Capture Objection": { microStage: "C1.3" },
  "Schedule Demo": { microStage: "C0.7", scoreEvent: "demo.completed" },
  "Check Affordability": { microStage: "C1.4" },
  "Start Finance": { microStage: "C1A.1", navigateTo: "finance-desk", eventType: "finance.started" },
  "Escalate Manager": { description: "Escalated to Sales Manager" },
  "Add Competitor Offer": { microStage: "C0.6", description: "Competitor offer logged" },

  "Upload Docs": { microStage: "C1A.2" },
  "Verify Docs": { microStage: "C1A.2" },
  "Assign FI": { microStage: "C1A.3" },
  "Update FI Result": { microStage: "C1A.4" },
  "Mark Approved": { microStage: "C1A.6", eventType: "finance.approved" },
  "Mark Rejected": { status: "Lost", microStage: "C1A.5", description: "Finance rejected" },
  "Alternate Finance": { microStage: "C1A.5", navigateTo: "re-engagement" },
  "Move Alternate Finance": { microStage: "C1A.5", navigateTo: "re-engagement" },
  "Confirm Margin": { microStage: "C1A.7" },

  "Create Booking": { microStage: "C2.1", eventType: "booking.done" },
  "Allocate Vehicle": { microStage: "C2.2" },
  "Lock Variant": { microStage: "C2.3" },
  "Upload Billing Docs": { microStage: "C2.4" },
  "Update Disbursement": { microStage: "C2.5" },
  "Collect Down Payment": { microStage: "C2.6" },
  "Create Insurance": { microStage: "C2.7" },
  "Start Registration": { microStage: "C2.8" },
  "Update HSRP": { microStage: "C2.9" },
  "Complete PDI": { microStage: "C2.10" },

  "Confirm Payment": { microStage: "C3.1" },
  "Verify Insurance": { microStage: "C3.2" },
  "Verify Registration": { microStage: "C3.3" },
  "Approve PDI": { microStage: "C3.4" },
  "Mark Vehicle Ready": { microStage: "C3.5" },
  "Complete Delivery": { microStage: "C3.6", eventType: "delivery.done", status: "Delivered" },
  "Send Feedback Link": { microStage: "C3.7" },
  "Capture Testimonial": { microStage: "C3.8" },
  "Ask Referral": { microStage: "C3.9", eventType: "referral.requested" },

  "Call Now": { scoreEvent: "call.answered" },
  "Schedule Retry": { navigateTo: "autodialer", description: "Retry scheduled" },
  "Move Dormant": { status: "Hold", navigateTo: "re-engagement" },
  "Mark Lost": { status: "Lost" },

  "Upload Excel": { navigateTo: "lead-upload" },
  "Download Sample": { description: "Sample template downloaded" },
  "Validate Data": { description: "Validation complete · 0 errors" },
  "Import Leads": { navigateTo: "lead-inbox", eventType: "lead.created" },
  "Reject Invalid Rows": { description: "Invalid rows rejected" },
  "Merge Duplicate": { description: "Duplicate merge initiated" },
  "Assign Branch": { description: "Branch assigned" },
  "Assign Executive": { navigateTo: "action-engine" },
  "Start Automation": { navigateTo: "action-engine", eventType: "lead.created" },
  "Save Lead": { navigateTo: "lead-inbox", eventType: "lead.created" },
  "Generate IDs": { description: "Customer + Opportunity IDs generated" },
  "Run Duplicate Check": { eventType: "contact.verified", description: "Duplicate check complete" },

  "Create Rule": { description: "Automation rule created" },
  "Edit Rule": { description: "Rule editor opened" },
  "Activate": { description: "Rule activated" },
  "Deactivate": { description: "Rule deactivated" },

  "Start Nurture Campaign": { navigateTo: "re-engagement", status: "Hold" },
  "Send Finance Scheme": { navigateTo: "re-engagement", description: "Finance scheme sent" },
  "Send Exchange Offer": { navigateTo: "re-engagement", description: "Exchange offer sent" },
  "Schedule Recycle Date": { navigateTo: "re-engagement" },
  "Reopen Lead": { status: "Open", navigateTo: "lead-inbox" },

  "Send Message": { eventType: "bot.engaged", scoreEvent: "bot.replied" },
  "Schedule": { description: "Message scheduled" },
  "Create Service Task": { microStage: "L1", navigateTo: "lifecycle-crm", eventType: "service.due" },
  "Create Renewal Lead": { microStage: "L2", navigateTo: "lifecycle-crm" },
  "Create Exchange Lead": { microStage: "L5", navigateTo: "lifecycle-crm", eventType: "exchange.eligible" },
  "Create Upgrade Opportunity": { microStage: "L4", navigateTo: "lifecycle-crm" },

  Manage: { description: "Master data management" },
  Configure: { description: "Configuration saved" },
};

export function parseMicroStageFromInput(input: string): MicroStageCode | null {
  const c1a = input.match(/C1A\.\d+/i);
  if (c1a) return c1a[0].toUpperCase() as MicroStageCode;
  const micro = input.match(/C[0123]\.\d+/i);
  if (micro) return micro[0].toUpperCase() as MicroStageCode;
  const macroOnly = input.match(/^C(1A|[0123])$/i);
  if (macroOnly) {
    const id = macroOnly[1].toUpperCase() === "1A" ? "c1a" : `c${macroOnly[1]}` as MacroStageId;
    return getMicroStagesForMacro(id)[0]?.code as MicroStageCode;
  }
  const life = input.match(/L[1-7]/i);
  if (life) return life[0].toUpperCase() as MicroStageCode;
  return null;
}
