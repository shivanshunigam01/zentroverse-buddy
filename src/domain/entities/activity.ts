/** lead_activity — audit trail of business and system actions */

export type ActivityType =
  | "Stage Change"
  | "Owner Change"
  | "Action Update"
  | "Call"
  | "WhatsApp"
  | "Email"
  | "Visit"
  | "Quote"
  | "Finance"
  | "Booking"
  | "Delivery"
  | "Note"
  | "System";

export interface LeadActivity {
  activity_id: string;
  opportunity_id: string;
  activity_type: ActivityType;
  remarks: string;
  created_by: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}
