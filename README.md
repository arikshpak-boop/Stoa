# Stoa — Institutional M&A Warranty & Indemnity Marketplace

A multi-tenant marketplace connecting M&A dealmakers (brokers/PE firms) with W&I insurance
carriers, built on Next.js 14 (App Router) and TypeScript, styled per the "Digital Saville Row"
design system.

## Getting Started

This environment did not have Node.js installed, so the app has not been built or run yet.
On a machine with Node 18.18+ / 20+:

```bash
cd stoa
npm install
npm run dev
```

Then open http://localhost:3000.

## Architecture

- **Landing page** (`app/page.tsx`) — marketing page, dual entry points into the Broker and
  Carrier portals.
- **Broker Portal** (`app/(broker)`) — deal pipeline, the new-submission wizard (Layer 1
  ingestion), the split-screen verification viewport, and the risk/exclusions workspace
  (Layer 2).
- **Carrier Portal** (`app/(carrier)`) — the filtered marketplace dashboard and the
  underwriting/bidding workspace (Layer 3).
- **Mock API** (`app/api/v1/deals/**`) — in-memory, seeded "database" (`lib/mock-store.ts`)
  standing in for the FastAPI application engine in the architectural schematic. Routes:
  - `GET /api/v1/deals` — list deals (filterable by `status`, `sector`)
  - `POST /api/v1/deals/extract` — mock async extraction controller; simulates worker
    latency, runs the deterministic mock extraction model, computes the risk profile,
    generates the exclusion report, hashes the snapshot, and stores the new deal
  - `GET /api/v1/deals/:dealId` — deal detail
  - `GET /api/v1/deals/:dealId/warranties` — warranties + exclusions
  - `GET/POST /api/v1/deals/:dealId/bids` — list/submit bids
- **Domain logic** (`lib/`):
  - `types.ts` — data models (`Deal`, `DealWarranty`, `ExclusionClause`, `Bid`, ...)
  - `hash.ts` — `computeSnapshotHash`, `SHA256(DealMetadata ‖ WarrantyChecklist ‖ FilePayloadURIs)`
  - `risk-engine.ts` — sector-weighted severity scoring, Low/Medium/High classification,
    and the exclusion-report generator
  - `premium.ts` — `Gross Premium = Limit × Rate on Line %`, total transaction value
  - `extraction.ts` — deterministic mock LLM extraction (seeded PRNG per company name)
  - `mock-store.ts` — seeded in-memory deal store (module-level singleton)
- **Postgres schema** (`db/schema.sql`) — full DDL for `organizations`, `deals`,
  `deal_documents`, `deal_extracted_fields`, `deal_warranties`, `deal_exclusions`, `bids`,
  and an append-only `deal_snapshots` ledger table, with Row Level Security policies
  isolating broker organizations from each other and gating carrier visibility to deals
  that have left Draft status.

## Immutability Model

Submitting a deal computes a SHA-256 snapshot hash over the deal metadata, warranty
checklist, and file payload URIs (`lib/hash.ts`). The mock store never overwrites a deal's
core fields in place; the schema's `deal_snapshots` table is designed as an append-only
ledger so that any later change to transaction parameters creates a new locked version
row rather than mutating history.

## Known Limitations (mock scope)

- No real PDF rendering — the verification viewport renders a stylized page canvas with a
  bounding box positioned from the extracted field's mock source coordinates.
- No real VDR integrations — Intralinks/Datasite/ShareVault connectors are UI placeholders.
- The mock API layer runs in-process (Next.js route handlers + a module-level store) rather
  than the separate FastAPI service shown in the architectural schematic; the endpoint
  shapes and logic (extraction, risk scoring, hashing, bidding) mirror what that service
  would do.
