## 2026-06-11 - Validate AI JSON Output
**Learning:** Parsing raw AI output directly with `JSON.parse()` without structural validation can lead to silent data corruption or runtime exceptions (like `TypeError` when expecting arrays or objects).
**Action:** Always validate the structure and required fields of `JSON.parse()` output before trusting it or passing it to downstream functions. Throw errors on validation failure to trigger graceful fallbacks.

## 2026-06-15 - Enforce Bounded Execution for AI Calls
**Learning:** Unguarded external AI model calls (e.g., `aiClient.models.generateContent`) can hang indefinitely when the provider is slow or unresponsive, leading to silent UI freezes and degraded user experience.
**Action:** Always wrap raw external AI model calls in a `withTimeout` promise wrapper (from `services/aiConfig.ts`) with a strict maximum execution time (e.g., 10,000ms). This ensures requests fail quickly and trigger the application's graceful fallbacks.

## 2026-06-15 - Enforce Bounded Execution for Streamed AI Calls
**Learning:** Unguarded streaming AI model calls (e.g., `chatInstance.current.sendMessageStream`) can also hang when the provider is slow or unresponsive, causing the chat UI to hang with a loading state indefinitely.
**Action:** Wrap streaming AI API interactions, such as `sendMessageStream` inside `components/AIChat.tsx`, with `withTimeout` just like single-shot completions. This ensures the chat fallback is triggered effectively.

## 2026-06-25 - Validate `JSON.parse` Arrays
**Learning:** `JSON.parse()` output should be explicitly checked to be an array (e.g. `Array.isArray(result)`) before casting it as an array of objects. Otherwise, subsequent mapping or filtering on it will cause runtime errors if the AI returns an object.
**Action:** Always wrap `JSON.parse()` array responses with `if (!Array.isArray(result)) throw new Error('AI output is not an array');`
## 2026-06-16 - Safe AI JSON Parsing
**Learning:** `JSON.parse` will throw an exception if the AI model outputs extraneous text or markdown blocks (e.g. ` ```json `) alongside the JSON.
**Action:** Use a `safeParseJSON` utility to wrap `JSON.parse`. It should extract valid JSON substrings by looking for '{' and '}' (or '[' and ']') to handle slightly malformed responses.

## 2026-06-26 - Validate Structured AI JSON Object Responses
**Learning:** Even when using `safeParseJSON`, explicitly validate the resulting object and its critical fields (e.g., checking if it's not null, is an object, and that nested arrays exist) to prevent downstream `TypeError` crashes (like "Cannot read properties of null").
**Action:** Always add structural checks like `if (!result || typeof result !== 'object' || !result.customer || !Array.isArray(result.lineItems)) throw new Error(...)` immediately after parsing AI JSON objects to "fail loudly and recover gracefully".

## 2026-06-27 - Safely Validate AI JSON Field Types
**Learning:** Checking the presence of fields using destructuring or simple truthiness on `JSON.parse` output can silently crash or return `undefined` down the line if the parsed output is not a dictionary.
**Action:** Always validate `typeof result === 'object'` immediately before checking nested fields (`result.customer`) to prevent downstream UI errors or silent crashes. Ensure complex nested arrays inside the AI output are checked with `Array.isArray`.

## 2026-06-28 - Explicitly Validate All Required Fields from safeParseJSON Output
**Learning:** Relying purely on `safeParseJSON` only guarantees that the output is syntactically valid JSON. It does not guarantee the structure matches the schema (e.g., missing arrays like `highlights` or `risks` in `aiReportService.ts`). This leads to silent UI crashes when the UI attempts to map or render these undefined fields.
**Action:** Always follow `safeParseJSON` with explicit structural validation (e.g., `!result.executiveSummary || !Array.isArray(result.highlights)`) and throw an error to trigger the simulated fallback when the schema contract is violated.
