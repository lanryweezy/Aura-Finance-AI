## 2024-03-24 - Unbounded Context Growth in Financial Insights
**Learning:** Passing raw, unbounded arrays (like full pending bill or invoice lists) directly into the `JSON.stringify(context)` payload for `aiClient.models.generateContent` can lead to rapid token limit exhaustion and unbounded context growth. This was discovered in `getFinancialInsights` where `.filter()` results were included without size limits.
**Action:** Always slice, chunk, or aggregate large datasets before assigning them to the context object for AI prompts (e.g. `bills.filter(b => b.status !== 'Paid').slice(0, 10)`).

## 2024-03-24 - Unbounded Context Growth in Financial Insights
**Learning:** Passing raw, unbounded arrays (like full pending bill or invoice lists) directly into the `JSON.stringify(context)` payload for `aiClient.models.generateContent` can lead to rapid token limit exhaustion and unbounded context growth. This was discovered in `getFinancialInsights` where `.filter()` results were included without size limits.
**Action:** Always slice, chunk, or aggregate large datasets before assigning them to the context object for AI prompts (e.g. `bills.filter(b => b.status !== 'Paid').slice(0, 10)`).

## 2024-05-18 - Sequential Chunking for Relational AI Batch Processing
**Learning:** When using AI to map or match two datasets (e.g., bills to POs), arbitrarily slicing both arrays to fit token limits hides valid matching targets and silently breaks business logic.
**Action:** Implement sequential chunking for the primary dataset (e.g., `bills` in chunks of 50) while keeping the secondary relational dataset (e.g., `purchase orders`) fully intact in the context window. Handle AI failures per chunk to gracefully fall back without aborting the entire batch.
## 2025-03-03 - Context Efficiency Optimization in AI Reporting
**Learning:** Passing full, unmapped data objects (such as `Invoice` or `Bill` arrays with heavy nested `lineItems`) into the context window for generative tasks consumes excessive tokens and risks hitting limits, even if the primary dataset (e.g., `transactions`) is correctly paginated or mapped.
**Action:** Always map secondary contextual datasets down to only the fields necessary for the specific AI prompt (e.g., extracting just `amount` and `dueDate` from bills) before stringifying them for the AI model.
