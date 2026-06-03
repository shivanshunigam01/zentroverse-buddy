import { describe, expect, it } from "vitest";
import { generateLeadIds, customerNamePrefix } from "@/services/id-generation.service";

describe("id generation", () => {
  it("builds three IDs from customer name prefix", () => {
    const ids = generateLeadIds("ABC Logistics");
    expect(customerNamePrefix("ABC Logistics")).toBe("ABC");
    expect(ids.leadId).toMatch(/^ABC-LD-/);
    expect(ids.customerId).toMatch(/^ABC-CU-/);
    expect(ids.opportunityId).toMatch(/^ABC-OP-/);
    expect(ids.leadId.split("-").slice(0, 1)[0]).toBe("ABC");
  });
});
