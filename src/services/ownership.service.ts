import type { OpportunityOwnership, OwnershipSnapshot } from "@/domain/entities/ownership";

export interface AssignOwnerRequest {
  opportunity_id: string;
  new_owner: string;
  assigned_by: string;
  watchers?: string[];
  collaborators?: string[];
  escalation_owner?: string;
}

export interface AssignOwnerResponse {
  ownership: OpportunityOwnership[];
  snapshot: OwnershipSnapshot;
}

/**
 * Enforces single current owner — rejects multi-owner assignments.
 */
export function buildOwnershipRows(req: AssignOwnerRequest): OpportunityOwnership[] {
  const now = new Date().toISOString();
  const rows: OpportunityOwnership[] = [
    {
      id: `own_${req.opportunity_id}_current`,
      opportunity_id: req.opportunity_id,
      user_id: req.new_owner,
      display_name: req.new_owner,
      role: "Current Owner",
      assigned_at: now,
      assigned_by: req.assigned_by,
    },
  ];

  if (req.escalation_owner) {
    rows.push({
      id: `own_${req.opportunity_id}_esc`,
      opportunity_id: req.opportunity_id,
      user_id: req.escalation_owner,
      display_name: req.escalation_owner,
      role: "Escalation Owner",
      assigned_at: now,
      assigned_by: req.assigned_by,
    });
  }

  for (const w of req.watchers ?? []) {
    rows.push({
      id: `own_${req.opportunity_id}_w_${w}`,
      opportunity_id: req.opportunity_id,
      user_id: w,
      display_name: w,
      role: "Watcher",
      assigned_at: now,
      assigned_by: req.assigned_by,
    });
  }

  for (const c of req.collaborators ?? []) {
    rows.push({
      id: `own_${req.opportunity_id}_c_${c}`,
      opportunity_id: req.opportunity_id,
      user_id: c,
      display_name: c,
      role: "Collaborator",
      assigned_at: now,
      assigned_by: req.assigned_by,
    });
  }

  return rows;
}

export function snapshotFromRows(rows: OpportunityOwnership[]): OwnershipSnapshot {
  const current = rows.find((r) => r.role === "Current Owner");
  const escalation = rows.find((r) => r.role === "Escalation Owner");
  return {
    current_owner: current?.display_name ?? "",
    escalation_owner: escalation?.display_name ?? "",
    watchers: rows.filter((r) => r.role === "Watcher").map((r) => r.display_name),
    collaborators: rows.filter((r) => r.role === "Collaborator").map((r) => r.display_name),
  };
}

export function validateSingleOwner(owner: string): void {
  const invalidBuckets = ["Executive", "Finance", "Manager", "CRM", "Dialer", "System", "Bot"];
  if (invalidBuckets.includes(owner)) {
    throw new Error(
      `Invalid owner "${owner}". Use a named role e.g. "Finance Executive", not a department bucket.`,
    );
  }
}
