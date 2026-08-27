export type DialerSyncStatus = "PENDING" | "SYNCED" | "FAILED";

export type DialerMode = "dial_out_each_call" | "session";

export type DialerHealth = {
  smartflo: boolean;
  campaignConfigured: boolean;
  leadListConfigured: boolean;
  dispositionConfigured: boolean;
  callerIdConfigured: boolean;
  dialerMode: DialerMode | string;
  sessionEnabled: boolean;
};

export type DialerCampaign = {
  name: string;
  status: string;
  campaignIdMasked: string;
  leadListIdMasked: string;
  dispositionListIdMasked: string;
  callerIdConfigured: boolean;
  dialerMode: DialerMode | string;
  sessionEnabled: boolean;
  agentCount: number;
  leadCount: number;
  newLeadCount: number;
  syncedLeadCount: number;
  pendingLeadCount: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  connected: boolean;
  lastWebhook: {
    event: string | null;
    callId: string | null;
    disposition: string | null;
    receivedAt: string;
  } | null;
};

export type DialerCampaignStatus = {
  campaignId: string;
  status: string;
  leadCount: number;
  availableLeadCount: number;
  activeAgents: number;
  dialerMode: DialerMode | string;
  connected: boolean;
};

export type DialerSessionStatus = {
  dialerMode: DialerMode | string;
  sessionEnabled: boolean;
  status: string;
  campaignId: string | null;
  startedAt: string | null;
  message: string;
};

export type DialerDisposition = {
  id: string;
  name: string;
  listId: string | null;
};

export type DialerCall = {
  id?: string;
  _id?: string;
  opportunity_id?: string | null;
  lead_id?: string | null;
  leadId?: string | null;
  customer_id?: string | null;
  customer_number?: string | null;
  customerPhone?: string | null;
  smartflo_call_id?: string | null;
  smartfloCallId?: string | null;
  smartflo_uuid?: string | null;
  smartflo_lead_id?: string | null;
  smartfloLeadId?: string | null;
  campaign_id?: string | null;
  campaignId?: string | null;
  agent_id?: string | null;
  agentId?: string | null;
  agent_name?: string | null;
  caller_id?: string | null;
  callerId?: string | null;
  direction?: string | null;
  status?: string | null;
  disposition?: string | null;
  disposition_code?: string | null;
  duration?: number | null;
  start_time?: string | null;
  startedAt?: string | null;
  answered_at?: string | null;
  answeredAt?: string | null;
  end_time?: string | null;
  endedAt?: string | null;
  recording_ref?: string | null;
  recordingUrl?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

export type DialerLeadRow = {
  opportunity_id: string;
  lead_id: string;
  customer_id: string;
  customer_name?: string;
  customer_mobile?: string;
  customer_email?: string | null;
  smartflo_lead_id?: string | null;
  smartflo_sync_status?: DialerSyncStatus | null;
  smartflo_sync_error?: string | null;
  smartflo_dial_status?: string | null;
  smartflo_disposition?: string | null;
  smartflo_last_call_at?: string | null;
  smartflo_retry_count?: number;
};

export type DialerSyncResult = {
  opportunity_id: string;
  lead_id?: string;
  smartflo_lead_id?: string | null;
  smartflo_lead_list_id?: string;
  smartflo_sync_status: string;
  result?: string;
  error?: string;
};

export type DialerLeadSyncStats = {
  total: number;
  alreadySynced: number;
  pendingSync: number;
  failed: number;
  invalid: number;
  eligible: number;
  syncInProgress: boolean;
};

export type DialerSyncAllResult = {
  success: boolean;
  syncId: string;
  total: number;
  eligible: number;
  uploaded: number;
  alreadySynced: number;
  invalid: number;
  failed: number;
  skipped: number;
  status: "COMPLETED" | "PARTIAL" | "PROCESSING";
  batchIds: string[];
  batchResults: Array<{
    batch_index: number;
    batch_id: string | null;
    status: "success" | "failed" | "processing";
    uploaded_count: number;
    failed_count: number;
    lead_count: number;
    error?: string;
  }>;
  invalidRows?: Array<{ opportunity_id: string; reason: string }>;
};

export type DialerTestLead = {
  local: {
    opportunity_id: string;
    lead_id: string;
    smartflo_lead_id?: string | null;
    smartflo_sync_status?: string | null;
    smartflo_dial_status?: string | null;
    smartflo_disposition?: string | null;
  };
  remote: {
    id?: string | null;
    field_0?: string | null;
    field_1?: string | null;
    status?: string | null;
  } | null;
  matched: boolean;
};
