## 2024-03-24 - Unbounded Context Growth in Financial Insights
**Learning:** Passing raw, unbounded arrays (like full pending bill or invoice lists) directly into the `JSON.stringify(context)` payload for `aiClient.models.generateContent` can lead to rapid token limit exhaustion and unbounded context growth. This was discovered in `getFinancialInsights` where `.filter()` results were included without size limits.
**Action:** Always slice, chunk, or aggregate large datasets before assigning them to the context object for AI prompts (e.g. `bills.filter(b => b.status !== 'Paid').slice(0, 10)`).

## 2024-03-24 - Unbounded Context Growth in Financial Insights
**Learning:** Passing raw, unbounded arrays (like full pending bill or invoice lists) directly into the `JSON.stringify(context)` payload for `aiClient.models.generateContent` can lead to rapid token limit exhaustion and unbounded context growth. This was discovered in `getFinancialInsights` where `.filter()` results were included without size limits.
**Action:** Always slice, chunk, or aggregate large datasets before assigning them to the context object for AI prompts (e.g. `bills.filter(b => b.status !== 'Paid').slice(0, 10)`).
## 2024-03-24 - Do Not Truncate Secondary Relational Context in Batch Prompts
**Learning:** When batch processing data in chunks to avoid token limits (e.g., `bills`), arbitrarily slicing secondary relational context arrays (e.g., `purchase orders`) provided to the prompt is dangerous. Truncating secondary datasets hides valid targets from the AI and breaks core matching business logic, as the AI becomes blind to any target beyond the slice index.
**Action:** Always maintain the full secondary relational dataset in the prompt when chunking primary data, or implement a multi-step retrieval mechanism if the secondary dataset itself exceeds token limits. Do not use `.slice()` on context targets just to save tokens.
