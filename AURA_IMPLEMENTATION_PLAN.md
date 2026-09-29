# Implementation Matrix

| Feature | Existing | Missing | Required Anchor Capability | Status |
|---|---|---|---|---|
| API Adapter | None | Full Adapter | HTTP Client, Auth, Idempotency | Pending |
| Customer Onboarding | `contacts` table | KYB/KYC sync | `/api/v1/customers` | Pending |
| Deposit Accounts | None | DB tables + UI | `/api/v1/accounts` | Pending |
| Virtual Accounts | None | DB tables + UI | `/api/v1/reserved-accounts` | Pending |
| Transfers | Partial UI | Full integration | `/api/v1/transfers` | Pending |
| Webhooks | Generic | Anchor Verify | HMCA-SHA1 Signature | Pending |
| AI Integration | Base Engine | Anchor Tools | Various Anchor Endpoints | Pending |
