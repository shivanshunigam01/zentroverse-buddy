export type CommunicationChannel = "WhatsApp" | "SMS" | "Email" | "Call" | "Bot" | "Push";

export type CommunicationStatus = "Queued" | "Sent" | "Delivered" | "Read" | "Replied" | "Failed";

export interface CommunicationLog {
  communication_id: string;
  opportunity_id: string;
  channel: CommunicationChannel;
  message_type: string;
  status: CommunicationStatus;
  timestamp: string;
  payload?: Record<string, unknown>;
}
