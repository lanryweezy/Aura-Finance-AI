# Aura Financial System Design

## Components
1. **Business Management**: The existing Aura UI for managing invoices, expenses, payroll.
2. **Financial Core**: The double-entry ledger that holds the immutable truth of Aura's accounting.
3. **Anchor Integration Adapter**:
   - `anchorService.ts`: Core HTTP client for Anchor.
   - Idempotency handling.
4. **Webhook Event Processor**:
   - `anchorWebhookService.ts`: Parses and verifies `x-anchor-signature`.
5. **AI Financial Agent**:
   - Tools injected into AI for Anchor tasks (e.g., `finance.get_balance`, `finance.create_transfer`).

## Data Flow
- User Action -> Aura Service -> Anchor Adapter -> Anchor API
- Anchor Webhook -> Aura Webhook Endpoint -> Verify -> Update Ledger -> Emit Internal Event
