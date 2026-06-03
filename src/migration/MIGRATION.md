# ZentroFlow Schema Migration Plan

## Objective

Separate **business stages** (C0–C3, L1–L7) from **parallel engines** (contact health, scoring, action, SLA, escalation) by normalizing the data model to:

```
customer_master → opportunity_master → stage_history / lead_activity
                                      ↘ engine attribute tables (parallel)
```

## Phase 1 — Database (zero downtime read)

1. Deploy `database/schema.sql` to PostgreSQL.
2. Create new tables alongside existing `lead_master`.
3. Do **not** drop `lead_master` yet.

## Phase 2 — Backfill

1. Export existing `lead_master` rows.
2. Run `src/migration/migrate-legacy-leads.ts` → `generateMigrationSql(rows)`.
3. Execute generated SQL in a transaction on staging.
4. Validate counts:

```sql
SELECT COUNT(*) FROM lead_master;
SELECT COUNT(*) FROM opportunity_master;
SELECT COUNT(DISTINCT customer_id) FROM opportunity_master;
```

5. Spot-check ABC Logistics pattern: one customer, multiple opportunities, no false duplicates.

## Phase 3 — Engine attribute backfill

| Legacy source | Target table |
|---|---|
| Contact flags on lead row | `contact_health_attributes` |
| Score on lead row | `opportunity_master.lead_score` + `lead_score_ledger` seed entry |
| Owner text field | `opportunity_ownership` (Current Owner + Escalation Owner) |
| SLA text | `sla_tracking` + `opportunity_master.sla_due_at` |

Run contact health engine batch job per opportunity after backfill.

## Phase 4 — API switch

1. Deploy backend routes matching `src/api/contracts/*`.
2. Point frontend Zustand store to REST (replace `SEED_*` hydration).
3. Feature flag: `USE_OPPORTUNITY_API=true`.

## Phase 5 — Event bus (backend)

1. Publish domain events to `domain_event_outbox`.
2. Worker drains outbox → Kafka/SQS topics per event type.
3. Engine workers subscribe (same handlers as `event-dispatcher.service.ts`).

## Phase 6 — Deprecation

1. Mark `lead_master` read-only (comment + revoke INSERT/UPDATE).
2. Remove legacy `Lead` flat writes after 30-day parallel run.
3. Archive `lead_master` to cold storage.

## Rollback

- Keep `lead_master` intact until Phase 6.
- API flag `USE_OPPORTUNITY_API=false` reverts frontend to seed adapter.
- Stage history is append-only — rollback does not delete history.

## Ownership cleanup

During migration, rewrite invalid bucket owners:

| Invalid | Migrated to |
|---|---|
| Dialer | Sales Executive |
| System | Sales Executive |
| Bot | CRM Executive |
| Finance | Finance Executive |
| Manager | Sales Manager |
| Billing Team | Billing Executive |

## Duplicate reclassification

Re-run `classifyDuplicate()` per customer after migration. Engine outcomes stored in `contact_health_attributes.duplicate_classification`, not as stages.
