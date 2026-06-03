/** Live mode — no dummy seed data. Journey starts from Excel upload. */

import type { CustomerMaster } from "@/domain/entities/customer";
import type { OpportunityMaster } from "@/domain/entities/opportunity";

export const SEED_CUSTOMERS: CustomerMaster[] = [];
export const SEED_OPPORTUNITIES: OpportunityMaster[] = [];
