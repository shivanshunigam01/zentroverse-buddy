# ZentroFlow Backend — Complete Implementation Guide

**Stack:** Node.js · Express.js · MongoDB (Mongoose)  
**Frontend:** `zentroverse-buddy/` (React + Vite — already built)  
**Purpose:** Replace browser `localStorage` + in-memory services with a real API.

This document is the single source of truth for building the backend. It mirrors your existing TypeScript domain (`src/domain/`, `src/api/contracts/`, `database/schema.sql`).

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Recommended folder structure](#2-recommended-folder-structure)
3. [Quick start](#3-quick-start)
4. [Environment variables](#4-environment-variables)
5. [MongoDB collections & Mongoose models](#5-mongodb-collections--mongoose-models)
6. [API conventions](#6-api-conventions)
7. [REST API reference](#7-rest-api-reference)
8. [Controllers & routes map](#8-controllers--routes-map)
9. [Middleware](#9-middleware)
10. [Services & helpers (business logic)](#10-services--helpers-business-logic)
11. [Excel import pipeline](#11-excel-import-pipeline)
12. [Stage funnel & actions](#12-stage-funnel--actions)
13. [Parallel engines](#13-parallel-engines)
14. [Domain events](#14-domain-events)
15. [Frontend integration](#15-frontend-integration)
16. [Implementation phases](#16-implementation-phases)
17. [Security checklist](#17-security-checklist)

---

## 1. Architecture overview

```
┌─────────────────┐     HTTPS/JSON      ┌──────────────────────────────────┐
│  React Frontend │ ◄──────────────────► │  Express API (Node.js)          │
│  (Vite)         │   /api/v1/*         │  Routes → Controllers → Services │
└─────────────────┘                     └──────────────┬───────────────────┘
                                                       │
                                                       ▼
                                        ┌──────────────────────────────┐
                                        │  MongoDB                      │
                                        │  customers, opportunities,    │
                                        │  activities, stage_history,   │
                                        │  engines (embedded or coll.)  │
                                        └──────────────────────────────┘
```

### Core principles (from your frontend)

| Rule | Meaning |
|------|---------|
| **Customer → Opportunity** | One customer, many opportunities (not flat “leads” table only). |
| **Backbone fields** | Every opportunity must have stage, micro stage, owner, actions, priority, score, SLA. |
| **Stages ≠ Engines** | C0–C3 and L1–L7 are funnel stages; scoring, contact health, SLA, action engine are **parallel** data. |
| **Sequential funnel** | Micro stages advance +1 only; cross-macro only from exit (e.g. C0.10 → C1.1). |
| **Three IDs** | `lead_id`, `customer_id`, `opportunity_id` — prefix from customer name (see `id-generation.service.ts`). |

### Macro funnel order

`C0 → C1 → C1A → C2 → C3 → Lifecycle (L1–L7)`

Exit micro stages: `C0.10`, `C1.10`, `C1A.10`, `C2.10`, `C3.10` — see `src/domain/stages/stage-gates.ts`.

---

## 2. Recommended folder structure

Create a sibling folder `zentroflow-api/` (or `backend/` inside the monorepo):

```
zentroflow-api/
├── package.json
├── .env.example
├── .gitignore
├── server.js                 # Entry: loads dotenv, starts HTTP server
├── src/
│   ├── app.js                # Express app (middleware + routes), no listen()
│   ├── config/
│   │   ├── db.js             # mongoose.connect
│   │   ├── env.js            # validate env vars
│   │   └── cors.js
│   ├── models/               # Mongoose schemas
│   │   ├── Customer.js
│   │   ├── Opportunity.js
│   │   ├── LeadActivity.js
│   │   ├── StageHistory.js
│   │   ├── CommunicationLog.js
│   │   ├── ContactHealth.js
│   │   ├── ScoreLedger.js
│   │   ├── OpportunityOwnership.js
│   │   ├── SlaTracking.js
│   │   ├── DomainEvent.js
│   │   └── ImportBatch.js
│   ├── routes/
│   │   ├── index.js          # mounts all /api/v1 routers
│   │   ├── customers.routes.js
│   │   ├── opportunities.routes.js
│   │   ├── leads.routes.js   # import, validate, generate-ids
│   │   ├── activities.routes.js
│   │   ├── engines.routes.js
│   │   ├── dashboard.routes.js
│   │   └── reports.routes.js
│   ├── controllers/
│   │   ├── customers.controller.js
│   │   ├── opportunities.controller.js
│   │   ├── leads.controller.js
│   │   ├── activities.controller.js
│   │   ├── engines.controller.js
│   │   ├── dashboard.controller.js
│   │   └── reports.controller.js
│   ├── services/             # Business logic (port from frontend TS)
│   │   ├── idGeneration.service.js
│   │   ├── duplicate.service.js
│   │   ├── stageTransition.service.js
│   │   ├── stageGates.service.js
│   │   ├── actionEngine.service.js
│   │   ├── scoring.service.js
│   │   ├── contactHealth.service.js
│   │   ├── sla.service.js
│   │   ├── ownership.service.js
│   │   ├── opportunityAction.service.js
│   │   └── excelImport.service.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── asyncHandler.middleware.js
│   │   └── requestId.middleware.js
│   ├── helpers/
│   │   ├── apiResponse.js
│   │   ├── mobile.js
│   │   ├── pagination.js
│   │   └── correlationId.js
│   └── validators/           # express-validator or Zod schemas
│       ├── customer.validator.js
│       ├── opportunity.validator.js
│       └── import.validator.js
└── tests/
    └── ...
```

### `server.js` vs `app.js`

| File | Responsibility |
|------|----------------|
| **`app.js`** | Create Express app, register middleware & routes, export `app` (for tests). |
| **`server.js`** | `import app from './src/app.js'`, connect MongoDB, `app.listen(PORT)`. |

---

## 3. Quick start

```bash
mkdir zentroflow-api && cd zentroflow-api
npm init -y
npm install express mongoose dotenv cors helmet morgan express-validator multer xlsx
npm install -D nodemon

# Copy .env.example → .env and set MONGODB_URI
node server.js
```

**`package.json` scripts:**

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

---

## 4. Environment variables

```env
# .env.example
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/zentroflow
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=change-me-in-production
DUPLICATE_WINDOW_DAYS=30
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | API port (default `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `CORS_ORIGIN` | Yes | Vite dev URL or production frontend URL |
| `JWT_SECRET` | For auth | Sign tokens when you add login |
| `API_PREFIX` | No | Default `/api/v1` |

---

## 5. MongoDB collections & Mongoose models

Map from `database/schema.sql` + frontend `lead_id` field.

### 5.1 `customers`

| Field | Type | Index | Notes |
|-------|------|-------|-------|
| `customer_id` | String | unique | e.g. `ABC-CU-2026-784521` |
| `name` | String | text | |
| `mobile` | String | | Display format |
| `mobile_normalized` | String | unique | Last 10 digits, Indian mobile rules |
| `email` | String | | optional |
| `address` | String | | district / territory |
| `customer_type` | String | enum | Individual, Fleet Operator, … |
| `created_at` | Date | | |
| `updated_at` | Date | | |

### 5.2 `opportunities`

| Field | Type | Index | Notes |
|-------|------|-------|-------|
| `opportunity_id` | String | unique | `ABC-OP-2026-784521` |
| `lead_id` | String | unique | `ABC-LD-2026-784521` — **add vs SQL schema** |
| `customer_id` | String | ref customers | |
| `product` | String | | |
| `variant` | String | | nullable |
| `requirement` | String | | remarks |
| `opportunity_type` | String | | New, Cross Sell, … |
| `current_stage` | String | | C0–C3 or null if lifecycle |
| `lifecycle_stage` | String | | L1–L7 or null |
| `current_micro_stage` | String | | C0.1, C1A.5, … |
| `current_owner` | String | index | |
| `current_action` | String | | |
| `next_action` | String | | |
| `next_action_date` | Date | index | |
| `priority` | String | | P1–P5 |
| `lead_score` | Number | | |
| `score_classification` | String | | Cold, Warm, Hot, Critical |
| `sla` | String | | human label |
| `sla_due_at` | Date | | |
| `sla_status` | String | | On Track, At Risk, Breached |
| `escalation_owner` | String | | |
| `status` | String | | Open, Hold, Lost, Delivered, Closed |
| `source` | String | | |
| `campaign` | String | | |
| `branch` | String | | |
| `last_activity_at` | Date | | |
| `created_at` / `updated_at` | Date | | |

**Constraint (application layer):** either `current_stage` is set OR `lifecycle_stage`, not both (same as SQL CHECK).

### 5.3 Other collections

| Collection | Mirrors SQL table | Purpose |
|------------|-------------------|---------|
| `lead_activities` | `lead_activity` | Timeline |
| `stage_histories` | `stage_history` | Audit trail |
| `communication_logs` | `communication_logs` | WhatsApp, calls |
| `contact_health` | `contact_health_attributes` | 1:1 per opportunity |
| `score_ledger` | `lead_score_ledger` | Score events |
| `opportunity_ownership` | `opportunity_ownership` | Owners, watchers |
| `sla_tracking` | `sla_tracking` | Engine SLA state |
| `domain_events` | `domain_event_outbox` | Event sourcing / async |
| `import_batches` | (new) | Store last Excel import stats |

### 5.4 Mongoose example — Opportunity

```javascript
// src/models/Opportunity.js
import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
  opportunity_id: { type: String, required: true, unique: true },
  lead_id: { type: String, required: true, unique: true },
  customer_id: { type: String, required: true, index: true },
  product: { type: String, required: true },
  variant: String,
  requirement: String,
  opportunity_type: { type: String, default: 'New' },
  current_stage: { type: String, enum: ['C0','C1','C1A','C2','C3', null] },
  lifecycle_stage: { type: String, enum: ['L1','L2','L3','L4','L5','L6','L7', null] },
  current_micro_stage: { type: String, required: true },
  current_owner: { type: String, required: true },
  current_action: { type: String, required: true },
  next_action: { type: String, required: true },
  next_action_date: { type: Date, required: true },
  priority: { type: String, enum: ['P1','P2','P3','P4','P5'], required: true },
  lead_score: { type: Number, default: 0 },
  score_classification: { type: String, default: 'Cold' },
  sla: { type: String, required: true },
  sla_due_at: Date,
  sla_status: { type: String, default: 'On Track' },
  escalation_owner: { type: String, required: true },
  status: { type: String, default: 'Open' },
  source: { type: String, required: true },
  campaign: String,
  branch: { type: String, required: true },
  last_activity_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Opportunity', opportunitySchema);
```

---

## 6. API conventions

### 6.1 Success response (matches `src/api/contracts/customers.ts`)

```json
{
  "data": { },
  "meta": {
    "page": 1,
    "total": 42,
    "correlation_id": "corr_abc123"
  }
}
```

### 6.2 Error response

```json
{
  "error": {
    "code": "STAGE_TRANSITION_BLOCKED",
    "message": "Complete C0.1 before moving to C0.3. Next step only — no skipping.",
    "field": "new_micro_stage"
  }
}
```

| HTTP | When |
|------|------|
| `400` | Validation / business rule (duplicate, stage gate) |
| `401` | Unauthorized |
| `404` | Customer or opportunity not found |
| `409` | Conflict (duplicate mobile, exact duplicate lead) |
| `500` | Server error |

### 6.3 Helper — `helpers/apiResponse.js`

```javascript
export const ok = (res, data, meta = {}) =>
  res.json({ data, meta: { correlation_id: res.locals.correlationId, ...meta } });

export const fail = (res, status, code, message, field) =>
  res.status(status).json({ error: { code, message, field } });
```

---

## 7. REST API reference

Base URL: `http://localhost:5000/api/v1`

### 7.1 Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | `{ status: "ok", db: "connected" }` |

### 7.2 Customers

| Method | Path | Body / Query | Frontend contract |
|--------|------|--------------|-------------------|
| GET | `/customers` | `?search=&page=1&limit=20` | List |
| GET | `/customers/:customerId` | | Get + `opportunities_count` |
| POST | `/customers` | `CreateCustomerRequest` | Create |

**POST body:**

```json
{
  "name": "ABC Logistics",
  "mobile": "9988776655",
  "email": "ops@abc.in",
  "address": "Chennai",
  "customer_type": "Individual"
}
```

Server generates `customer_id` via `idGeneration.service` if not provided.

### 7.3 Opportunities (leads)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/opportunities` | List with filters (stage, owner, priority, status, sla_status) |
| GET | `/opportunities/:opportunityId` | Single + joined customer name/mobile |
| POST | `/opportunities` | Create (requires `customer_id`) |
| PATCH | `/opportunities/:opportunityId` | Update owner, actions, status |
| POST | `/opportunities/:opportunityId/stage-transition` | Move micro stage |
| POST | `/opportunities/:opportunityId/actions` | Run labeled action (from action registry) |
| GET | `/opportunities/:opportunityId/activities` | Activity timeline |
| GET | `/opportunities/:opportunityId/stage-history` | Stage history |

**List query params** (`ListOpportunitiesQuery`):

- `stage`, `owner`, `priority`, `status`, `sla_status`, `customer_id`, `page`, `limit`

**Stage transition body** (`MoveStageRequest`):

```json
{
  "new_micro_stage": "C0.2",
  "changed_by": "Sales Executive",
  "reason": "Contact established"
}
```

**Force override** (manager): add `"force": true` + `"reason"` (min 10 chars).

**Perform action body:**

```json
{
  "action_label": "Save Discovery",
  "changed_by": "Sales Executive",
  "owner": "Sales Executive",
  "navigate_to": null
}
```

Server looks up `action_label` in action registry → target micro stage → runs gates → updates DB → returns updated `OpportunityDto`.

### 7.4 Lead upload (Excel)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/leads/import/validate` | multipart or JSON rows → validation stats |
| POST | `/leads/import/generate-ids` | JSON rows → rows with lead/customer/opportunity IDs |
| POST | `/leads/import` | Commit import → `ImportBatchResult` |
| GET | `/leads/import/template` | Download sample xlsx |

**Import row shape** (from `ExcelLeadRow`):

```json
{
  "customerName": "ABC Logistics",
  "mobile": "9988776655",
  "product": "Tata Ace",
  "district": "Chennai",
  "source": "Walk-in",
  "branch": "Chennai Central",
  "executive": "Sales Executive",
  "leadId": "ABC-LD-2026-784521",
  "customerId": "ABC-CU-2026-784521",
  "opportunityId": "ABC-OP-2026-784521"
}
```

**Import response** (`ImportBatchResult`):

```json
{
  "data": {
    "total": 3,
    "valid": 3,
    "duplicate": 0,
    "invalid": 0,
    "outOfTerritory": 0,
    "imported": 3,
    "rejected": 0,
    "rows": []
  }
}
```

### 7.5 Engines (parallel)

| Method | Path | Body |
|--------|------|------|
| POST | `/engines/action/run` | `{ opportunity_id, behavior_override? }` |
| POST | `/engines/contact-health/verify` | `{ opportunity_id, mobile, district }` |
| POST | `/engines/scoring/apply` | `{ opportunity_id, event_type }` |
| GET | `/engines/sla/:opportunityId` | SLA state |

Port logic from:

- `src/services/action-engine.service.ts`
- `src/services/contact-health.service.ts`
- `src/services/scoring.service.ts`
- `src/services/sla.service.ts`

### 7.6 Dashboard & reports

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | Total leads, by stage, hot, SLA missed, etc. |
| GET | `/reports/pipeline` | Funnel + source + executive aggregates |
| GET | `/reports/export` | Excel download (optional: stream file) |

### 7.7 Module access (optional)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/access/modules` | Returns `{ moduleId: { allowed, reason } }` per `canAccessModule` |

---

## 8. Controllers & routes map

| Controller | Routes file | Endpoints |
|------------|-------------|-----------|
| `customers.controller` | `customers.routes.js` | CRUD customers |
| `opportunities.controller` | `opportunities.routes.js` | Opportunities + stage + actions |
| `leads.controller` | `leads.routes.js` | Import, validate, generate IDs |
| `activities.controller` | `activities.routes.js` | Timeline |
| `engines.controller` | `engines.routes.js` | Engines |
| `dashboard.controller` | `dashboard.routes.js` | Stats |
| `reports.controller` | `reports.routes.js` | Reports / export |

### Example — `src/routes/index.js`

```javascript
import { Router } from 'express';
import customersRoutes from './customers.routes.js';
import opportunitiesRoutes from './opportunities.routes.js';
import leadsRoutes from './leads.routes.js';
import enginesRoutes from './engines.routes.js';

const router = Router();
router.use('/customers', customersRoutes);
router.use('/opportunities', opportunitiesRoutes);
router.use('/leads', leadsRoutes);
router.use('/engines', enginesRoutes);
export default router;
```

### Example — `src/app.js`

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { requestId } from './middleware/requestId.middleware.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(requestId);
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use(process.env.API_PREFIX || '/api/v1', apiRoutes);
app.use(errorHandler);
export default app;
```

---

## 9. Middleware

| Middleware | File | Purpose |
|------------|------|---------|
| **asyncHandler** | `asyncHandler.middleware.js` | Wrap controllers: `export const get = asyncHandler(async (req,res)=>...)` |
| **errorHandler** | `errorHandler.middleware.js` | Catch errors → JSON `error` shape |
| **validate** | `validate.middleware.js` | Run express-validator / Zod |
| **auth** | `auth.middleware.js` | `Authorization: Bearer <jwt>` (add when ready) |
| **requestId** | `requestId.middleware.js` | Set `res.locals.correlationId` on every request |

### asyncHandler pattern

```javascript
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

---

## 10. Services & helpers (business logic)

**Port these TypeScript files to JavaScript** (or compile TS in backend):

| Frontend file | Backend service | Notes |
|---------------|-----------------|-------|
| `src/services/id-generation.service.ts` | `idGeneration.service.js` | Lead / Customer / Opportunity IDs |
| `src/domain/duplicate/rules.ts` | `duplicate.service.js` | 30-day exact duplicate |
| `src/domain/stages/stage-gates.ts` | `stageGates.service.js` | Sequential validation |
| `src/services/stage-transition.service.ts` | `stageTransition.service.js` | Stage change + history + activity |
| `src/domain/actions/action-registry.ts` | `actionRegistry.js` | Label → micro stage |
| `src/services/opportunity-action.service.ts` | `opportunityAction.service.js` | Perform action |
| `src/services/excel-import.service.ts` | `excelImport.service.js` | Parse xlsx + import |
| `src/domain/stages/business-stages.ts` | `businessStages.js` | Static stage definitions |

### Helpers

| Helper | Purpose |
|--------|---------|
| `mobile.js` | `normalizeMobile()`, `isValidMobile()` (10 digits, starts 6–9) |
| `pagination.js` | `skip/limit` from query |
| `correlationId.js` | `corr_${random}` for events |
| `apiResponse.js` | `ok()`, `fail()` |

---

## 11. Excel import pipeline

Sequence (matches Lead Upload UI):

```
1. POST /leads/import/validate   → counts valid/invalid/duplicate (dry run)
2. POST /leads/import/generate-ids → attach leadId, customerId, opportunityId per row
3. POST /leads/import            → transaction: upsert customers + create opportunities at C0.1
```

**Per row logic** (`excel-import.service.ts`):

1. Validate name, mobile, product.
2. Normalize mobile → find existing customer by `mobile_normalized`.
3. If new customer → create with generated `customer_id`.
4. Run `classifyDuplicate()` against sibling opportunities.
5. If exact duplicate → reject row.
6. Create opportunity at `C0.1` with backbone fields + IDs.
7. Publish `lead.created` event.
8. Return `ImportBatchResult`.

Use **MongoDB transaction** (`session.startTransaction()`) for batch import.

---

## 12. Stage funnel & actions

### Stage transition service flow

1. Load opportunity + customer.
2. If `!force` → `validateSequentialTransition(opp, new_micro_stage)`.
3. Validate single owner (`ownership.service`).
4. Update opportunity fields + `last_activity_at`.
5. Run action engine → patch `current_action`, `next_action`, `priority`.
6. Insert `stage_history` row.
7. Insert `lead_activity` row.
8. Publish `stage.changed` event.
9. Return updated DTO.

### Action registry

Copy all keys from `src/domain/actions/action-registry.ts`. Examples:

| Action label | Target micro stage |
|--------------|-------------------|
| Complete Contact | C0.2 |
| Save Discovery | C0.3 |
| Move to C1 | C1.1 (from C0.10 only) |
| Upload Docs | C1A.2 |

`POST /opportunities/:id/actions` resolves label → calls same transition logic.

---

## 13. Parallel engines

Engines **do not** change `current_micro_stage` unless an action explicitly includes `microStage`.

| Engine | Writes to |
|--------|-----------|
| Contact health | `contact_health` collection |
| Scoring | `opportunity.lead_score`, `score_classification`, `score_ledger` |
| SLA | `sla_tracking`, `opportunity.sla_status` |
| Action engine | `current_action`, `next_action`, `priority` on opportunity |

---

## 14. Domain events

Event types (`src/domain/events/event-types.ts`):

`lead.created`, `contact.verified`, `bot.engaged`, `lead.qualified`, `quote.shared`, `finance.started`, `finance.approved`, `booking.done`, `delivery.done`, `stage.changed`, `score.updated`, `sla.breached`, …

**Pattern:**

1. Controller completes write.
2. `eventService.publish({ type, opportunity_id, customer_id, payload, correlation_id })`.
3. Persist to `domain_events` collection.
4. Optional: in-process handlers (email, WhatsApp) later.

---

## 15. Frontend integration

Today the frontend uses **Zustand + localStorage** (`zentroflow-live-v2`).

### Replace with API client

1. Create `src/api/client.ts`:

```typescript
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? res.statusText);
  return json.data as T;
}
```

2. Replace `useZentroFlowStore` reads with React Query:

```typescript
// useOpportunityLeads.ts
export function useOpportunityLeads() {
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: () => api<OpportunityDto[]>("/opportunities"),
  });
}
```

3. `performOpportunityAction` → `POST /opportunities/:id/actions`.
4. Excel import → `POST /leads/import` with FormData or JSON.
5. Set `VITE_API_URL` in `.env` for Vite.

### DTO mapping

Backend `OpportunityDto` should match `OpportunityMaster` + `customer_name`, `customer_mobile`.  
Frontend `lead-view.adapter.ts` maps to `Lead` type for UI — keep adapter, feed from API DTO.

**Important:** `viewLead()` uses `opportunityId` as route key, not `leadId`.

---

## 16. Implementation phases

| Phase | Scope | Outcome |
|-------|--------|---------|
| **1** | Express skeleton, MongoDB, health, customers CRUD | DB connected |
| **2** | Opportunities list/get/create, stage transition | Inbox works from API |
| **3** | Excel import + generate IDs | Upload module live |
| **4** | Actions endpoint + engines | Buttons work end-to-end |
| **5** | Dashboard stats + reports | Charts from API |
| **6** | Auth (JWT) + role-based owner | Production-ready |
| **7** | Frontend swap localStorage → API | Full stack |

Suggested order: **1 → 2 → 3 → 4** (matches user journey: upload → inbox → detail actions).

---

## 17. Security checklist

- [ ] Validate all inputs (express-validator / Zod).
- [ ] Rate-limit `/leads/import` and auth routes.
- [ ] Sanitize file uploads (max size, xlsx only).
- [ ] Never expose `MONGODB_URI` or `JWT_SECRET` to frontend.
- [ ] Use HTTPS in production.
- [ ] Index `mobile_normalized` unique to prevent duplicate customers.
- [ ] Audit `changed_by` from JWT user, not from client body (phase 6).

---

## Reference files in this repo

| Topic | Path |
|-------|------|
| SQL reference schema | `database/schema.sql` |
| API TypeScript contracts | `src/api/contracts/` |
| Entities | `src/domain/entities/` |
| Stage definitions | `src/domain/stages/business-stages.ts` |
| Stage gates | `src/domain/stages/stage-gates.ts` |
| Actions | `src/domain/actions/action-registry.ts` |
| Duplicate rules | `src/domain/duplicate/rules.ts` |
| ID generation | `src/services/id-generation.service.ts` |
| Excel import | `src/services/excel-import.service.ts` |
| Migration notes | `src/migration/MIGRATION.md` |

---

## Optional: share code with frontend

To avoid duplicating business rules:

1. **Monorepo:** move `domain/` + `services/` to `packages/core` and import from React and Node.
2. **Or:** compile frontend TS services to `dist/` and `require()` from Express.
3. **Or:** rewrite once in JS in backend (fastest for solo dev).

---

*Document version: 1.0 — aligned with ZentroFlow frontend as of June 2026.*
