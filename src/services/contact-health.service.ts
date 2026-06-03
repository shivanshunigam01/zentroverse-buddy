import type { ContactHealthAttributes, ContactHealthStatus } from "@/domain/engines/contact-health";
import { classifyDuplicate } from "@/domain/duplicate/rules";
import type { OpportunityMaster } from "@/domain/entities/opportunity";

export interface ContactHealthInput {
  opportunity: OpportunityMaster;
  mobile: string;
  district: string;
  branch_territory: string;
  sibling_opportunities: OpportunityMaster[];
}

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "").slice(-10);
}

export function runContactHealthEngine(input: ContactHealthInput): ContactHealthAttributes {
  const now = new Date().toISOString();
  const mobileNorm = normalizeMobile(input.mobile);
  const mobileValid = mobileNorm.length === 10 && !/^0/.test(mobileNorm);

  const duplicateClass = classifyDuplicate({
    customer_id: input.opportunity.customer_id,
    product: input.opportunity.product,
    requirement: input.opportunity.requirement,
    existing_opportunities: input.sibling_opportunities
      .filter((o) => o.opportunity_id !== input.opportunity.opportunity_id)
      .map((o) => ({
        opportunity_id: o.opportunity_id,
        product: o.product,
        requirement: o.requirement,
        status: o.status,
        last_activity_at: o.last_activity_at,
      })),
  });

  const territoryValid = input.district.toLowerCase().includes(input.branch_territory.toLowerCase().split(" ")[0])
    || input.branch_territory === "Pan India";

  const statuses: ContactHealthStatus[] = [];
  if (mobileValid) statuses.push("Valid");
  else statuses.push("Invalid");
  if (input.opportunity.lead_score > 40) statuses.push("WhatsApp Active");
  if (mobileValid) statuses.push("Call Reachable");
  if (duplicateClass === "Exact Duplicate") statuses.push("Duplicate");
  if (!territoryValid) statuses.push("Out of Territory");

  let score = 0;
  if (mobileValid) score += 40;
  if (statuses.includes("WhatsApp Active")) score += 30;
  if (statuses.includes("Call Reachable")) score += 20;
  if (territoryValid) score += 10;

  return {
    opportunity_id: input.opportunity.opportunity_id,
    mobile_valid: mobileValid,
    whatsapp_active: statuses.includes("WhatsApp Active"),
    call_reachable: mobileValid,
    email_valid: null,
    territory_valid: territoryValid,
    contactability_score: score,
    statuses,
    duplicate_classification: duplicateClass,
    last_verified_at: now,
    updated_at: now,
  };
}

export const contactHealthService = { runContactHealthEngine };
