# Aura Architecture Audit

## Application Framework & Tech Stack
- Frontend: React 19, Vite 6, TypeScript, Tailwind CSS
- Backend/Database: Supabase (PostgreSQL)
- Mobile: Capacitor (Android/iOS)
- Testing: Playwright (End-to-End) & Vitest (Unit)
- AI: Google Gemini SDK, custom AI logic in `services/`

## Authentication & Authorization
- Built-in Supabase Auth (via `authService.ts`).
- Roles: Owner, Admin, Viewer
- Tables: `users`, `organizations`, `custom_roles`

## Financial/Accounting System
- Multi-entity support (`entities` table)
- Basic chart of accounts (`accounts`)
- Ledger structure (`journal_entries`, `transactions`)
- Invoices (`invoices`), Bills (`bills`)
- Bank Connections (`bank_connections`) - Currently supports Mono, Okra.

## Entities
- Customers/Vendors: `contacts`
- Employees: `employees`
- Payroll: `payroll_runs`

## AI Agent Architecture
- Agents: `aiAlertsService.ts`, `aiAnomalyService.ts`, `autonomousEngine.ts`, `geminiService.ts`, etc.
- Usage of Gemini models for processing.

## Background Jobs & Webhooks
- `webhookService.ts` for generic webhook handling.
- Webhooks table exists (`webhooks`, `webhook_events`).

## Failures / Missing
- True independent banking integration for money movement is missing (using Mono currently for sync, not Anchor for execution).
- Lacks Anchor specifics (Customers, Virtual Accounts, Subaccounts, Bill Payments).
