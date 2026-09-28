## 2024-03-24 - Unbounded Context Growth in Financial Insights
**Learning:** Passing raw, unbounded arrays (like full pending bill or invoice lists) directly into the `JSON.stringify(context)` payload for `aiClient.models.generateContent` can lead to rapid token limit exhaustion and unbounded context growth. This was discovered in `getFinancialInsights` where `.filter()` results were included without size limits.
**Action:** Always slice, chunk, or aggregate large datasets before assigning them to the context object for AI prompts (e.g. `bills.filter(b => b.status !== 'Paid').slice(0, 10)`).

## 2024-03-24 - Unbounded Context Growth in Financial Insights
**Learning:** Passing raw, unbounded arrays (like full pending bill or invoice lists) directly into the `JSON.stringify(context)` payload for `aiClient.models.generateContent` can lead to rapid token limit exhaustion and unbounded context growth. This was discovered in `getFinancialInsights` where `.filter()` results were included without size limits.
**Action:** Always slice, chunk, or aggregate large datasets before assigning them to the context object for AI prompts (e.g. `bills.filter(b => b.status !== 'Paid').slice(0, 10)`).

## 2024-05-18 - Sequential Chunking for Relational AI Batch Processing
**Learning:** When using AI to map or match two datasets (e.g., bills to POs), arbitrarily slicing both arrays to fit token limits hides valid matching targets and silently breaks business logic.
**Action:** Implement sequential chunking for the primary dataset (e.g., `bills` in chunks of 50) while keeping the secondary relational dataset (e.g., `purchase orders`) fully intact in the context window. Handle AI failures per chunk to gracefully fall back without aborting the entire batch.

## 2024-05-19 - Unguarded Stream Consumption
**Learning:** When using `withTimeout` on streaming AI calls (e.g., `sendMessageStream`), wrapping only the initial stream creation with a timeout leaves the subsequent chunk consumption loop (`for await (const chunk of responseStream)`) vulnerable to infinite hanging if the model stalls mid-stream. However, wrapping the *entire* stream consumption in a single timeout will incorrectly abort valid, long responses.
**Action:** Implement a per-chunk idle timeout by manually iterating the stream (e.g., `const iterator = stream[Symbol.asyncIterator](); await withTimeout(iterator.next(), 10000);`) to ensure the application recovers gracefully from stalled model outputs without breaking slow but valid generations.
