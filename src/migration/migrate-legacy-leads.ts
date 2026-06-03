/**
 * Migration: lead_master (flat) → customer_master + opportunity_master
 *
 * Run once against PostgreSQL after deploying database/schema.sql.
 * Safe to re-run: uses UPSERT on natural keys.
 */

export interface LegacyLeadRow {
  lead_id: string;
  customer_id: string;
  opportunity_id: string;
  customer_name: string;
  mobile: string;
  email: string | null;
  district: string;
  product: string;
  source: string;
  campaign: string | null;
  branch: string;
  lead_type: string;
  current_stage: string;
  micro_stage: string;
  lead_score: number;
  score_label: string;
  priority: string;
  current_owner: string;
  current_action: string;
  next_action: string;
  next_action_at: string;
  sla_time: string;
  escalation_owner: string;
  status: string;
}

const LEGACY_TO_OPPORTUNITY_TYPE: Record<string, string> = {
  "New Lead": "New",
  "Duplicate Lead": "New",
  "Reopened Lead": "Reopened",
  "Existing Customer Lead": "Existing Customer",
  "Cross-Sell Lead": "Cross Sell",
  "Upgrade Lead": "Upgrade",
  "Exchange Lead": "Exchange",
  "Fleet Expansion Lead": "Fleet Expansion",
};

/** Maps legacy micro stage labels to new business micro stage codes */
const LEGACY_MICRO_MAP: Record<string, string> = {
  "C0.5 Autodialer": "C0.1",
  "C0.9 Next Best Action": "C0.9",
  "C1.5 Finance Discussion": "C1.5",
  "C2.4 Billing Docs": "C2.3",
};

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "").slice(-10);
}

function mapMicroStage(legacy: string): string {
  if (LEGACY_MICRO_MAP[legacy]) return LEGACY_MICRO_MAP[legacy];
  const match = legacy.match(/^(C\dA?\.\d+)/);
  return match ? match[1] : "C0.1";
}

export function generateMigrationSql(rows: LegacyLeadRow[]): string {
  const statements: string[] = [
    "-- ZentroFlow migration: lead_master → customer_master + opportunity_master",
    "BEGIN;",
  ];

  const seenCustomers = new Set<string>();

  for (const row of rows) {
    if (!seenCustomers.has(row.customer_id)) {
      seenCustomers.add(row.customer_id);
      statements.push(`
INSERT INTO customer_master (customer_id, name, mobile, mobile_normalized, email, address, customer_type)
VALUES (
  '${row.customer_id}',
  '${row.customer_name.replace(/'/g, "''")}',
  '${row.mobile}',
  '${normalizeMobile(row.mobile)}',
  ${row.email ? `'${row.email}'` : "NULL"},
  '${row.district.replace(/'/g, "''")}',
  'Individual'
)
ON CONFLICT (customer_id) DO UPDATE SET
  name = EXCLUDED.name,
  mobile = EXCLUDED.mobile,
  updated_at = NOW();`);
    }

    const stage = row.current_stage.startsWith("L") ? null : row.current_stage;
    const lifecycle = row.current_stage.startsWith("L") ? row.current_stage : null;
    const micro = mapMicroStage(row.micro_stage);

    statements.push(`
INSERT INTO opportunity_master (
  opportunity_id, customer_id, product, variant, requirement, opportunity_type,
  current_stage, lifecycle_stage, current_micro_stage, current_owner, current_action,
  next_action, next_action_date, priority, lead_score, score_classification,
  sla, escalation_owner, status, source, campaign, branch, last_activity_at
) VALUES (
  '${row.opportunity_id}',
  '${row.customer_id}',
  '${row.product.replace(/'/g, "''")}',
  NULL,
  NULL,
  '${LEGACY_TO_OPPORTUNITY_TYPE[row.lead_type] ?? "New"}',
  ${stage ? `'${stage}'` : "NULL"},
  ${lifecycle ? `'${lifecycle}'` : "NULL"},
  '${micro}',
  '${row.current_owner.replace(/'/g, "''")}',
  '${row.current_action.replace(/'/g, "''")}',
  '${row.next_action.replace(/'/g, "''")}',
  '${row.next_action_at}',
  '${row.priority}',
  ${row.lead_score},
  '${row.score_label}',
  '${row.sla_time}',
  '${row.escalation_owner.replace(/'/g, "''")}',
  '${row.status}',
  '${row.source.replace(/'/g, "''")}',
  ${row.campaign ? `'${row.campaign}'` : "NULL"},
  '${row.branch.replace(/'/g, "''")}',
  NOW()
)
ON CONFLICT (opportunity_id) DO UPDATE SET
  current_micro_stage = EXCLUDED.current_micro_stage,
  current_owner = EXCLUDED.current_owner,
  current_action = EXCLUDED.current_action,
  updated_at = NOW();`);

    statements.push(`
INSERT INTO stage_history (history_id, opportunity_id, old_stage, old_micro_stage, new_stage, new_micro_stage, changed_by, changed_at)
VALUES (
  'mig_${row.opportunity_id}',
  '${row.opportunity_id}',
  NULL,
  NULL,
  '${stage ?? lifecycle}',
  '${micro}',
  'migration_script',
  NOW()
)
ON CONFLICT (history_id) DO NOTHING;`);
  }

  statements.push(`
-- Deprecate flat lead table (keep read-only archive)
COMMENT ON TABLE lead_master IS 'DEPRECATED — migrated to opportunity_master. Read-only archive.';
COMMIT;`);

  return statements.join("\n");
}
