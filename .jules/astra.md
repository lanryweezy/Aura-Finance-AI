## 2024-03-24 - Unbounded Context Growth in Financial Insights
**Learning:** Passing raw, unbounded arrays (like full pending bill or invoice lists) directly into the `JSON.stringify(context)` payload for `aiClient.models.generateContent` can lead to rapid token limit exhaustion and unbounded context growth. This was discovered in `getFinancialInsights` where `.filter()` results were included without size limits.
**Action:** Always slice, chunk, or aggregate large datasets before assigning them to the context object for AI prompts (e.g. `bills.filter(b => b.status !== 'Paid').slice(0, 10)`).

## 2024-03-24 - Unbounded Context Growth in Financial Insights
**Learning:** Passing raw, unbounded arrays (like full pending bill or invoice lists) directly into the `JSON.stringify(context)` payload for `aiClient.models.generateContent` can lead to rapid token limit exhaustion and unbounded context growth. This was discovered in `getFinancialInsights` where `.filter()` results were included without size limits.
**Action:** Always slice, chunk, or aggregate large datasets before assigning them to the context object for AI prompts (e.g. `bills.filter(b => b.status !== 'Paid').slice(0, 10)`).

## 2024-05-18 - Sequential Chunking for Relational AI Batch Processing
**Learning:** When using AI to map or match two datasets (e.g., bills to POs), arbitrarily slicing both arrays to fit token limits hides valid matching targets and silently breaks business logic.
**Action:** Implement sequential chunking for the primary dataset (e.g., `bills` in chunks of 50) while keeping the secondary relational dataset (e.g., `purchase orders`) fully intact in the context window. Handle AI failures per chunk to gracefully fall back without aborting the entire batch.

## 2024-05-19 - Lazy Evaluation for AI Request Resiliency
**Learning:** All raw external AI model calls wrapped in timeouts (e.g., `withTimeout`) must be passed as factory functions (e.g., `withTimeout(() => aiClient...)`) to ensure lazy execution. Eagerly evaluating promises causes the request to start immediately, which circumvents the timeout wrapper's initialization, prevents it from properly intercepting transient errors (429, 500), and stops proper resource cleanup (e.g., clearing handles in a `finally` block).
**Action:** Always wrap `aiClient.models.generateContent` inside an arrow function when using it with the custom `withTimeout` wrapper to ensure resilient execution and proper `finally` block cleanup.

## 2025-02-18 - Stop silently corrupting data with mock AI fallbacks
**Learning:** Implementing "graceful degradation" by returning simulated business data (e.g., returning a mock object from `simulateInvoiceGeneration`) when the AI fails or is unconfigured violates data integrity. It masks errors and inserts fake data into the user's workflow without their explicit knowledge.
**Action:** Always fail loudly by throwing an error instead of returning simulated data for critical business objects when an AI generation fails or the client is not configured.

## 2025-02-18 - Exponential Backoff for AI Resilience
**Learning:** Batch AI operations (like categorization or bill matching) are highly susceptible to transient 429 (Too Many Requests) errors. Failing immediately and falling back to rules degrades the user experience by reducing AI coverage.
**Action:** Always wrap transient-prone AI calls (especially in chunked batch loops) with a `withRetry` exponential backoff handler before applying the `withTimeout` wrapper.
