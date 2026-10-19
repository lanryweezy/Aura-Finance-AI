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
## 2024-05-19 - Stop silently corrupting data with mock AI fallbacks
**Learning:** Implementing "graceful degradation" by returning simulated business data (e.g., returning a mock object from `simulateExtraction`) when the AI fails or is unconfigured violates data integrity. It masks errors and inserts fake data into the user's workflow without their explicit knowledge.
**Action:** Always fail loudly by throwing an error instead of returning simulated data for critical business objects when an AI generation fails or the client is not configured.

## 2025-02-19 - Resilient AI Batch Processing with Exponential Backoff
**Learning:** Batch AI operations (like categorization or bill matching) are highly susceptible to transient 429/500 errors. Standard timeouts alone (`withTimeout`) only abort the process; they do not automatically retry it, causing entire chunks of data to drop or require manual intervention.
**Action:** Always wrap transient-prone AI calls in chunked batch loops with a `withRetry` exponential backoff handler before applying the `withTimeout` wrapper (e.g., `withRetry(() => withTimeout(...))`). Ensure the retry mechanism delegates transient failures based on HTTP 429/500/503 errors and timeout messages.

## 2025-10-10 - Strict Numeric Sanitization for AI Financial Outputs
**Learning:** Trusting raw AI-generated JSON output for financial fields without runtime range and type assertions can lead to silent logic errors (e.g., negative amounts or stringified numbers causing NaN calculations).
**Action:** Always implement a strict parsing layer (e.g., `Math.max(0, Number(val) || 0)`) after `safeParseJSON` for all numeric fields representing financial amounts or quantities to enforce non-negative boundaries and prevent data corruption downstream.
## 2025-10-10 - Strict Numeric Sanitization for AI Financial Outputs
**Learning:** Trusting raw AI-generated JSON output for financial fields without runtime range and type assertions can lead to silent logic errors (e.g., negative amounts or stringified numbers causing NaN calculations).
**Action:** Always implement a strict parsing layer (e.g., `Math.max(0, Number(val) || 0)`) after `safeParseJSON` for all numeric fields representing financial amounts or quantities to enforce non-negative boundaries and prevent data corruption downstream.

## 2025-10-15 - Never Trust AI with Source Data Integrity
**Learning:** Returning entire original objects (e.g., `RawTransaction`) in the AI schema and mapping them directly to the app state trusts the AI to accurately reconstruct and echo back non-inferred data (amounts, dates). This is brittle, uses unnecessary output tokens, and can silently corrupt data if the model hallucinates or truncates numbers.
**Action:** Always restrict the AI output schema strictly to the fields it must infer/predict (e.g., `id`, `category`), and use a mapping layer in code to apply the predicted properties back to the original source object via a unique ID.
## 2026-10-13 - Fail Loudly on AI Output Validation
**Learning:** Silently mutating or defaulting missing/invalid fields in parsed AI output (e.g., coercing missing titles to empty strings, or substituting an invalid type enum with a default) prevents the application from failing and throwing an error. This circumvents the intended error handling flow where a `catch` block triggers a graceful fallback (like `simulateSearch`), thereby causing the system to run on silently corrupted data instead of safe fallback data.
**Action:** When validating parsed AI JSON output, do not silently mutate or provide default values for missing/invalid required fields. Instead, explicitly check for the presence and validity of required fields and throw a descriptive Error (e.g., `throw new Error('AI output is missing required fields or has invalid types')`) to properly trigger the `catch` block.
## 2025-10-18 - Restrict Output Schema to Prevent Source Data Corruption
**Learning:** Returning entire original objects (like `title`, `subtitle`, `amount`, `date`) in the AI JSON output schema and mapping them directly to the app state trusts the AI to accurately reconstruct and echo back non-inferred data. This is brittle, wastes output tokens, and can silently corrupt data if the model hallucinated amounts, truncated text, or reformatted dates.
**Action:** Always restrict the AI output schema strictly to the fields it must infer/predict (e.g., `id`, `type`), and use a mapping loop in code to look up the source objects via a unique ID to populate the final payload.

## 2024-05-19 - Strict Element-by-Element Validation for AI Arrays
**Learning:** Checking only the first element of an AI-generated array (`result.length > 0 && typeof result[0] === 'object'`) is insufficient. If the model returns an array where the first element is valid but subsequent elements are hallucinated strings or missing required fields, it will cause silent UI crashes or partial data corruption downstream when the app iterates over the list.
**Action:** Always iterate through the entire AI-generated array using a `for...of` loop and validate the presence of required fields and types for *every* element before accepting the payload. Fail loudly by throwing an error if any element is malformed.

## 2024-05-18 - Deep validation of AI generated arrays
**Learning:** Validating only the first element of an AI-generated JSON array (e.g., `!result[0] || typeof result[0] !== 'object'`) can lead to unexpected `TypeError`s or silent data corruption downstream if the model produces a mixed array (e.g., some objects, some nulls or strings). The model may fail mid-generation and produce invalid subsequent items.
**Action:** Always implement comprehensive deep validation when consuming AI-generated JSON arrays. Iterate through the entire array using a `for...of` loop and explicitly validate that *every* element is a valid object containing all required fields and correct types before trusting the data. If any element is malformed, throw an explicit error to fail loudly and trigger graceful fallback mechanisms.

## 2024-05-18 - Allow Empty Strings and Coercible Numbers in AI Array Validation
**Learning:** When validating AI-generated JSON arrays (e.g., `lineItems`), using strict falsy checks (`!item.name`) or strict type checks (`typeof item.quantity !== 'number'`) can cause false positives. The model may correctly follow instructions to return empty strings for missing fields (which are falsy), and LLMs frequently return numbers as strings. Throwing errors in these cases breaks previously working, recoverable logic.
**Action:** Use explicit string type checks (`typeof item.name !== 'string'`) to allow empty strings. Avoid strict numeric type checks if the subsequent parsing layer coerces values (e.g., `Number(val)`); validate that the coerced value is valid instead.
