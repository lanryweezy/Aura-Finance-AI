# Aura Anchor Gap Analysis

## What exists
- Basic accounting ledger structure.
- Contacts/Customers CRM (`contacts` table).
- AI agent framework.

## Missing Capabilities
- **Anchor API Client**: Missing dedicated Anchor integration adapter with idempotency, error handling, retries.
- **Customer Onboarding**: No capability to submit KYC/KYB to Anchor.
- **Deposit/Virtual Accounts**: No tracking of Anchor deposit accounts or generation of virtual accounts for collections.
- **Money Movement**: Missing internal, external, and bulk transfers via Anchor.
- **Ledger Sync**: Need to synchronize Anchor account events with the internal double-entry ledger.
- **Webhook Processing**: Need an Anchor-specific webhook verifier and processor.
