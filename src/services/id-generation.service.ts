/** Generate Lead ID, Customer ID, and Opportunity ID from customer name prefix + sequence */

export type GeneratedLeadIds = {
  leadId: string;
  customerId: string;
  opportunityId: string;
  prefix: string;
};

/** First word of customer name, uppercase, alphanumeric, max 5 chars */
export function customerNamePrefix(customerName: string): string {
  const cleaned = customerName.trim().replace(/[^a-zA-Z0-9\s]/g, "");
  const firstWord = cleaned.split(/\s+/).find((w) => w.length > 0) ?? "CUST";
  const prefix = firstWord.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
  return prefix || "CUST";
}

function uniqueSuffix(): string {
  const year = new Date().getFullYear();
  const tail = `${Date.now()}${Math.random().toString(36).slice(2, 5)}`.slice(-6);
  return `${year}-${tail}`;
}

/** Three IDs sharing the same customer prefix and sequence suffix */
export function generateLeadIds(customerName: string, suffix?: string): GeneratedLeadIds {
  const prefix = customerNamePrefix(customerName);
  const seq = suffix ?? uniqueSuffix();
  return {
    prefix,
    leadId: `${prefix}-LD-${seq}`,
    customerId: `${prefix}-CU-${seq}`,
    opportunityId: `${prefix}-OP-${seq}`,
  };
}

export function generateLeadIdsForRows(
  rows: { customerName: string }[],
): GeneratedLeadIds[] {
  return rows.map((row) => generateLeadIds(row.customerName));
}
