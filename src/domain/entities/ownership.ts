/** Ownership model — one current owner; others are watchers / collaborators */

export type OwnershipRole = "Current Owner" | "Watcher" | "Collaborator" | "Escalation Owner";

export interface OpportunityOwnership {
  id: string;
  opportunity_id: string;
  user_id: string;
  display_name: string;
  role: OwnershipRole;
  assigned_at: string;
  assigned_by: string;
}

export interface OwnershipSnapshot {
  current_owner: string;
  escalation_owner: string;
  watchers: string[];
  collaborators: string[];
}
