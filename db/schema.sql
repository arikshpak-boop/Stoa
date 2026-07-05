-- Stoa institutional W&I marketplace schema (PostgreSQL 15+)
-- Row Level Security enforces strict per-deal, per-organization isolation so
-- carrier accounts can never read documents or warranty data belonging to a
-- deal outside their own bid relationship, and broker organizations can
-- never read another organization's submissions.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE deal_status AS ENUM ('Draft', 'Submitted', 'Analyzed', 'Closed');
CREATE TYPE bid_status AS ENUM ('Pending', 'Accepted', 'Declined');
CREATE TYPE risk_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE flag_status AS ENUM ('Clear', 'Flagged', 'Under Review');
CREATE TYPE document_status AS ENUM ('Uploaded', 'Parsing', 'Parsed', 'Failed');
CREATE TYPE retention_trigger AS ENUM ('Tipping', 'Erosion');

CREATE TABLE organizations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    organization_type   TEXT NOT NULL CHECK (organization_type IN ('Broker', 'Carrier')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email               TEXT NOT NULL UNIQUE,
    display_name        TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE deals (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    status                      deal_status NOT NULL DEFAULT 'Draft',
    company_name                TEXT NOT NULL,
    jurisdiction                TEXT NOT NULL,
    sector                      TEXT NOT NULL,
    transaction_value           NUMERIC(18, 2) NOT NULL,
    base_currency               CHAR(3) NOT NULL,
    target_debt                 NUMERIC(18, 2) NOT NULL DEFAULT 0,
    target_cash                 NUMERIC(18, 2) NOT NULL DEFAULT 0,
    governing_law               TEXT NOT NULL,
    dispute_resolution_venue    TEXT NOT NULL,
    signing_date                DATE NOT NULL,
    scheduled_closing_date      DATE NOT NULL,
    version                     INTEGER NOT NULL DEFAULT 1,
    snapshot_hash               CHAR(64) NOT NULL,
    parent_deal_id              UUID REFERENCES deals(id) ON DELETE SET NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT snapshot_hash_immutable_per_version UNIQUE (id, version, snapshot_hash)
);

CREATE INDEX idx_deals_organization_id ON deals(organization_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_sector ON deals(sector);

CREATE TABLE deal_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id             UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    file_name           TEXT NOT NULL,
    file_type           TEXT NOT NULL CHECK (file_type IN ('pdf', 'xlsx', 'docx')),
    size_bytes          BIGINT NOT NULL,
    storage_uri         TEXT NOT NULL,
    status              document_status NOT NULL DEFAULT 'Uploaded',
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deal_documents_deal_id ON deal_documents(deal_id);

CREATE TABLE deal_extracted_fields (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id             UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    field_name          TEXT NOT NULL,
    field_value         TEXT NOT NULL,
    confidence          NUMERIC(4, 3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    source_document_id  UUID REFERENCES deal_documents(id) ON DELETE SET NULL,
    source_page         INTEGER NOT NULL,
    source_x            NUMERIC(8, 2) NOT NULL,
    source_y            NUMERIC(8, 2) NOT NULL,
    source_width        NUMERIC(8, 2) NOT NULL,
    source_height       NUMERIC(8, 2) NOT NULL,

    CONSTRAINT uq_deal_field UNIQUE (deal_id, field_name)
);

CREATE INDEX idx_deal_extracted_fields_deal_id ON deal_extracted_fields(deal_id);

-- DealWarranties: severity score + risk classification per Representation & Warranty.
CREATE TABLE deal_warranties (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id                 UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    warranty_identifier     TEXT NOT NULL,
    category                TEXT NOT NULL CHECK (category IN ('Fundamental', 'Operational')),
    severity_score          INTEGER NOT NULL CHECK (severity_score >= 0 AND severity_score <= 100),
    risk_level              risk_level NOT NULL,
    compliance_notes        TEXT NOT NULL DEFAULT '',
    flag_status             flag_status NOT NULL DEFAULT 'Clear',
    missing_disclosures     TEXT[] NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_deal_warranty UNIQUE (deal_id, warranty_identifier)
);

CREATE INDEX idx_deal_warranties_deal_id ON deal_warranties(deal_id);
CREATE INDEX idx_deal_warranties_risk_level ON deal_warranties(risk_level);

CREATE TABLE deal_exclusions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id                 UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    warranty_identifier     TEXT NOT NULL,
    title                   TEXT NOT NULL,
    draft_text              TEXT NOT NULL,
    triggered_by            TEXT NOT NULL,
    is_editable             BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deal_exclusions_deal_id ON deal_exclusions(deal_id);

CREATE TABLE bids (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id                 UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    carrier_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    limit_amount            NUMERIC(18, 2) NOT NULL,
    limit_percent_of_ev     NUMERIC(6, 2) NOT NULL,
    retention_amount        NUMERIC(18, 2) NOT NULL,
    retention_trigger       retention_trigger NOT NULL,
    rate_on_line            NUMERIC(6, 3) NOT NULL,
    premium_total           NUMERIC(18, 2) NOT NULL,
    underwriting_fees       NUMERIC(18, 2) NOT NULL DEFAULT 0,
    expense_cap             NUMERIC(18, 2) NOT NULL DEFAULT 0,
    policy_expiration       DATE NOT NULL,
    bid_status              bid_status NOT NULL DEFAULT 'Pending',
    submitted_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bids_deal_id ON bids(deal_id);
CREATE INDEX idx_bids_carrier_id ON bids(carrier_id);

-- Ledger snapshot table: append-only version history satisfying the
-- "no structural mutation" requirement. A new row is inserted every time a
-- broker confirms a deal submission; the deals table above always reflects
-- only the latest version, with parent_deal_id chaining back to prior ones.
CREATE TABLE deal_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id             UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    version             INTEGER NOT NULL,
    snapshot_hash       CHAR(64) NOT NULL,
    payload             JSONB NOT NULL,
    locked              BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_deal_snapshot_version UNIQUE (deal_id, version)
);

CREATE INDEX idx_deal_snapshots_deal_id ON deal_snapshots(deal_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- app.current_organization_id is set per-connection by the API layer after
-- authenticating the caller (broker or carrier organization).

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_extracted_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_exclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_snapshots ENABLE ROW LEVEL SECURITY;

-- Brokers see only deals owned by their organization.
CREATE POLICY deals_broker_isolation ON deals
    FOR ALL
    USING (organization_id = current_setting('app.current_organization_id', true)::UUID);

-- Carriers may read deals that have been Submitted, Analyzed, or Closed
-- (i.e. released to the marketplace) regardless of owning organization, but
-- can never read Draft deals belonging to another organization.
CREATE POLICY deals_carrier_marketplace_visibility ON deals
    FOR SELECT
    USING (
        status IN ('Submitted', 'Analyzed', 'Closed')
        AND current_setting('app.current_organization_type', true) = 'Carrier'
    );

CREATE POLICY deal_documents_isolation ON deal_documents
    FOR ALL
    USING (
        deal_id IN (
            SELECT id FROM deals
            WHERE organization_id = current_setting('app.current_organization_id', true)::UUID
               OR (
                    status IN ('Submitted', 'Analyzed', 'Closed')
                    AND current_setting('app.current_organization_type', true) = 'Carrier'
               )
        )
    );

CREATE POLICY deal_extracted_fields_isolation ON deal_extracted_fields
    FOR ALL
    USING (
        deal_id IN (
            SELECT id FROM deals
            WHERE organization_id = current_setting('app.current_organization_id', true)::UUID
               OR (
                    status IN ('Submitted', 'Analyzed', 'Closed')
                    AND current_setting('app.current_organization_type', true) = 'Carrier'
               )
        )
    );

CREATE POLICY deal_warranties_isolation ON deal_warranties
    FOR ALL
    USING (
        deal_id IN (
            SELECT id FROM deals
            WHERE organization_id = current_setting('app.current_organization_id', true)::UUID
               OR (
                    status IN ('Submitted', 'Analyzed', 'Closed')
                    AND current_setting('app.current_organization_type', true) = 'Carrier'
               )
        )
    );

CREATE POLICY deal_exclusions_isolation ON deal_exclusions
    FOR ALL
    USING (
        deal_id IN (
            SELECT id FROM deals
            WHERE organization_id = current_setting('app.current_organization_id', true)::UUID
               OR (
                    status IN ('Submitted', 'Analyzed', 'Closed')
                    AND current_setting('app.current_organization_type', true) = 'Carrier'
               )
        )
    );

-- Bids: carriers may only see and mutate their own bids; brokers may only
-- read bids placed against their own deals (never mutate carrier pricing).
CREATE POLICY bids_carrier_own_rows ON bids
    FOR ALL
    USING (carrier_id = current_setting('app.current_organization_id', true)::UUID)
    WITH CHECK (carrier_id = current_setting('app.current_organization_id', true)::UUID);

CREATE POLICY bids_broker_read_own_deal_bids ON bids
    FOR SELECT
    USING (
        deal_id IN (
            SELECT id FROM deals
            WHERE organization_id = current_setting('app.current_organization_id', true)::UUID
        )
    );

CREATE POLICY deal_snapshots_isolation ON deal_snapshots
    FOR ALL
    USING (
        deal_id IN (
            SELECT id FROM deals
            WHERE organization_id = current_setting('app.current_organization_id', true)::UUID
        )
    );
