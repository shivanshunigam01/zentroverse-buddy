import { describe, expect, it } from "vitest";
import { mapSmartfloStatusLabel, maskIdentifier } from "@/domain/dialer/status-map";

describe("smartflo status map", () => {
  it("maps known Smartflo dispositions", () => {
    expect(mapSmartfloStatusLabel("Interested").mapped).toBe("INTERESTED");
    expect(mapSmartfloStatusLabel("Not Interested").mapped).toBe("NOT_INTERESTED");
    expect(mapSmartfloStatusLabel("Schedule Call").mapped).toBe("CALLBACK");
    expect(mapSmartfloStatusLabel("Successful").mapped).toBe("CONVERTED");
  });

  it("keeps unknown dispositions as external values", () => {
    const result = mapSmartfloStatusLabel("Custom Bucket");
    expect(result.known).toBe(false);
    expect(result.external).toBe("Custom Bucket");
    expect(result.mapped).toBeNull();
  });

  it("masks identifiers without exposing the full id", () => {
    expect(maskIdentifier("558655")).toBe("********8655");
    expect(maskIdentifier("")).toBe("—");
  });
});
