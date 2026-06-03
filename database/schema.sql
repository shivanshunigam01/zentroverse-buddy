-- ZentroFlow production schema
-- Business stages (C0–C3, L1–L7) live on opportunity_master.
-- Engines persist parallel attribute tables — never as stage columns.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Customer (parent) ───────────────────────────────────────────────────────

CREATE TABLE customer_master (
  customer_id         VARCHAR(32) PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  mobile              VARCHAR(20) NOT NULL,
  mobile_normalized   VARCHAR(15) NOT NULL,
  email               VARCHAR(255),
  address             TEXT,
  customer_type       VARCHAR(50) NOT NULL DEFAULT 'Individual',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_customer_mobile ON customer_master (mobile_normalized);
CREATE INDEX idx_customer_name ON customer_master (name);

-- ─── Opportunity (child) — mandatory backbone ────────────────────────────────

CREATE TABLE opportunity_master (
  opportunity_id        VARCHAR(32) PRIMARY KEY,
  customer_id           VARCHAR(32) NOT NULL REFERENCES customer_master(customer_id),
  product               VARCHAR(255) NOT NULL,
  variant               VARCHAR(255),
  requirement           TEXT,
  opportunity_type      VARCHAR(50) NOT NULL DEFAULT 'New',
  current_stage         VARCHAR(5) CHECK (current_stage IN ('C0','C1','C1A','C2','C3')),
  lifecycle_stage       VARCHAR(3) CHECK (lifecycle_stage IN ('L1','L2','L3','L4','L5','L6','L7')),
  current_micro_stage   VARCHAR(10) NOT NULL,
  current_owner         VARCHAR(255) NOT NULL,
  current_action        VARCHAR(500) NOT NULL,
  next_action           VARCHAR(500) NOT NULL,
  next_action_date      TIMESTAMPTZ NOT NULL,
  priority              VARCHAR(3) NOT NULL CHECK (priority IN ('P1','P2','P3','P4','P5')),
  lead_score            INTEGER NOT NULL DEFAULT 0,
  score_classification  VARCHAR(20) NOT NULL DEFAULT 'Cold',
  sla                   VARCHAR(50) NOT NULL,
  sla_due_at            TIMESTAMPTZ,
  sla_status            VARCHAR(20) NOT NULL DEFAULT 'On Track',
  escalation_owner      VARCHAR(255) NOT NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'Open',
  source                VARCHAR(100) NOT NULL,
  campaign              VARCHAR(100),
  branch                VARCHAR(100) NOT NULL,
  last_activity_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_stage_presence CHECK (
    (current_stage IS NOT NULL AND lifecycle_stage IS NULL)
    OR (current_stage IS NULL AND lifecycle_stage IS NOT NULL)
  )
);

CREATE INDEX idx_opp_customer ON opportunity_master (customer_id);
CREATE INDEX idx_opp_stage ON opportunity_master (current_stage, current_micro_stage);
CREATE INDEX idx_opp_owner ON opportunity_master (current_owner);
CREATE INDEX idx_opp_priority ON opportunity_master (priority);
CREATE INDEX idx_opp_sla_status ON opportunity_master (sla_status);
CREATE INDEX idx_opp_last_activity ON opportunity_master (last_activity_at DESC);

-- ─── Activity & history ──────────────────────────────────────────────────────

CREATE TABLE lead_activity (
  activity_id     VARCHAR(32) PRIMARY KEY,
  opportunity_id  VARCHAR(32) NOT NULL REFERENCES opportunity_master(opportunity_id),
  activity_type   VARCHAR(50) NOT NULL,
  remarks         TEXT NOT NULL,
  created_by      VARCHAR(255) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata        JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_activity_opp ON lead_activity (opportunity_id, created_at DESC);

CREATE TABLE stage_history (
  history_id        VARCHAR(32) PRIMARY KEY,
  opportunity_id    VARCHAR(32) NOT NULL REFERENCES opportunity_master(opportunity_id),
  old_stage         VARCHAR(5),
  old_micro_stage   VARCHAR(10),
  new_stage         VARCHAR(5) NOT NULL,
  new_micro_stage   VARCHAR(10) NOT NULL,
  reason            TEXT,
  changed_by        VARCHAR(255) NOT NULL,
  changed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stage_history_opp ON stage_history (opportunity_id, changed_at DESC);

CREATE TABLE communication_logs (
  communication_id  VARCHAR(32) PRIMARY KEY,
  opportunity_id    VARCHAR(32) NOT NULL REFERENCES opportunity_master(opportunity_id),
  channel           VARCHAR(20) NOT NULL,
  message_type      VARCHAR(100) NOT NULL,
  status            VARCHAR(20) NOT NULL,
  timestamp         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload           JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_comm_opp ON communication_logs (opportunity_id, timestamp DESC);

-- ─── Engine attribute tables (parallel — NOT stages) ─────────────────────────

CREATE TABLE contact_health_attributes (
  opportunity_id          VARCHAR(32) PRIMARY KEY REFERENCES opportunity_master(opportunity_id),
  mobile_valid            BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_active         BOOLEAN NOT NULL DEFAULT FALSE,
  call_reachable          BOOLEAN NOT NULL DEFAULT FALSE,
  email_valid             BOOLEAN,
  territory_valid         BOOLEAN NOT NULL DEFAULT TRUE,
  contactability_score    INTEGER NOT NULL DEFAULT 0,
  duplicate_classification VARCHAR(50),
  statuses                JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_verified_at        TIMESTAMPTZ,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_score_ledger (
  id                VARCHAR(32) PRIMARY KEY,
  opportunity_id    VARCHAR(32) NOT NULL REFERENCES opportunity_master(opportunity_id),
  event_type        VARCHAR(100) NOT NULL,
  points            INTEGER NOT NULL,
  running_total     INTEGER NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_score_ledger_opp ON lead_score_ledger (opportunity_id, created_at DESC);

CREATE TABLE opportunity_ownership (
  id              VARCHAR(32) PRIMARY KEY,
  opportunity_id  VARCHAR(32) NOT NULL REFERENCES opportunity_master(opportunity_id),
  user_id         VARCHAR(32) NOT NULL,
  display_name    VARCHAR(255) NOT NULL,
  role            VARCHAR(30) NOT NULL CHECK (role IN ('Current Owner','Watcher','Collaborator','Escalation Owner')),
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by     VARCHAR(255) NOT NULL,
  UNIQUE (opportunity_id, user_id, role)
);

CREATE TABLE sla_tracking (
  opportunity_id  VARCHAR(32) PRIMARY KEY REFERENCES opportunity_master(opportunity_id),
  policy_id       VARCHAR(50) NOT NULL,
  due_at          TIMESTAMPTZ NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'On Track',
  breached_at     TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE domain_event_outbox (
  event_id          VARCHAR(32) PRIMARY KEY,
  event_type        VARCHAR(100) NOT NULL,
  opportunity_id    VARCHAR(32) NOT NULL,
  customer_id       VARCHAR(32) NOT NULL,
  payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id    VARCHAR(64) NOT NULL,
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at      TIMESTAMPTZ,
  CONSTRAINT fk_outbox_opp FOREIGN KEY (opportunity_id) REFERENCES opportunity_master(opportunity_id)
);

CREATE INDEX idx_outbox_unpublished ON domain_event_outbox (published_at) WHERE published_at IS NULL;

-- ─── Updated-at triggers ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customer_updated BEFORE UPDATE ON customer_master
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_opportunity_updated BEFORE UPDATE ON opportunity_master
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
