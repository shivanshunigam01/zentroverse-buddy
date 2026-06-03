/** Contact Health Engine — parallel attributes, NOT stages */

export type ContactHealthStatus =
  | "Valid"
  | "WhatsApp Active"
  | "Call Reachable"
  | "Invalid"
  | "Duplicate"
  | "Out of Territory";

export interface ContactHealthAttributes {
  opportunity_id: string;
  mobile_valid: boolean;
  whatsapp_active: boolean;
  call_reachable: boolean;
  email_valid: boolean | null;
  territory_valid: boolean;
  contactability_score: number;
  /** Composite status flags for UI badges */
  statuses: ContactHealthStatus[];
  duplicate_classification: import("@/domain/duplicate/rules").DuplicateClassification | null;
  last_verified_at: string;
  updated_at: string;
}

export const CONTACT_HEALTH_ENGINE_ID = "contact-health-engine" as const;
