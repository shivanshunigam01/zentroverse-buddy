# Phase 1 acceptance gate (sheet 07)

| ID | Requirement | Evidence | Status |
|----|-------------|----------|--------|
| 1 | One stage + owner + action per open opp | `golden-rule.ts` + store assert | Pass (client) |
| 2 | Action has next/due/SLA/escalation | Stage Master + action-context API | Pass |
| 3 | Rules create/simulate/activate | Action Engine UI + `/rules` | Pass (memory API) |
| 4 | Idempotent webhooks | AE-T002 API test | Pass |
| 5 | Atomic action+outbox | Memory store transactional path | Partial |
| 6 | No stage move without exit fields | AE-T004 + stage-exit-validation | Pass |
| 7 | Completion validates evidence | AE-T006 | Pass |
| 8 | SLA warning/breach/reassign | `SlaQueueService` | Pass (timers) |
| 9 | Delayed jobs ignore completed | SLA handler status check | Pass |
| 10 | Ownership history immutable | `ownershipHistory` append-only | Pass |
| 13 | Dead-letter + retry | event_inbox / dead_letter | Partial |
| 14 | Health dashboard orphans | Main Dashboard + `/action-engine/health` | Pass |
| 15 | Scoped rule config | Rule scope field on seeds | Partial |
| 18 | RBAC on Action APIs | Token header forwarded | Partial |

Pilot Definition of Done: IDs 1–4, 6–10, 14 green for one branch with `zentroflow-api` running.
