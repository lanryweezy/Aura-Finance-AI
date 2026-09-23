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
**Learning:** Relying purely on `safeParseJSON` only guarantees that the output is syntactically valid JSON. It does not guarantee the structure matches the schema (e.g., missing arrays or required nested properties). This leads to silent UI crashes when the UI attempts to map or render these undefined fields.
**Action:** Always follow `safeParseJSON` with explicit structural validation (e.g., `!result || typeof result !== 'object' || typeof result.totalAmount !== 'number'`) and throw an error to trigger the simulated fallback when the schema contract is violated.

## 2026-06-29 - Enforce Personas and Structural Output Constraints using `systemInstruction`
**Learning:** Using single-turn string prompts (e.g. `contents: prompt`) without system instructions often leads to LLMs adopting a chatty, non-deterministic persona, resulting in verbose outputs that break UI layouts or sound unprofessional.
**Action:** When expecting raw text output from an LLM that will be presented directly in the UI (like an executive summary or an email body), always use `systemInstruction` in the `config` to enforce a strict persona and explicitly state output constraints (e.g., "Do not use markdown", "Provide a short, professional executive summary").
## 2026-08-28 - Enforce Personas and Structural Output Constraints using systemInstruction
**Learning:** Embedding personas and formatting rules directly in the user prompt payload for AI text generation can lead to lower adherence, chatty/non-deterministic outputs, and increased risk of prompt injection.
**Action:** Always extract the persona and output constraints into the `config.systemInstruction` property of the Gemini API call, keeping only the dynamic user input in the `contents` array. This applies specifically to text-generating or analysis functions, such as AI Invoice generation, to ensure strict adherence.

## 2026-06-30 - Refactor User Prompts to Use systemInstruction
**Learning:** Mixing personas and formatting instructions directly within the `user` role prompt (e.g., `parts: [{ text: "Analyze this... Return JSON with..." }]`) reduces model adherence, specifically for strictly-structured, non-chat outputs (like OCR, predictions, matching). The model might attempt to fulfill the prompt while adopting a chatty persona, ignoring some formatting constraints.
**Action:** When expecting specific structured output from an LLM that requires a persona or explicit constraints (even with structured schema enabled), always extract the instruction (e.g., "You are an AI assistant. Analyze this invoice and return JSON.") out of the `user` prompt and place it strictly within `config: { systemInstruction: ... }`. Keep the `user` prompt reserved solely for the raw data to be analyzed (e.g., the image or stringified JSON).
\n## 2026-08-30 - Extract persona and output constraints into systemInstruction\n**Learning:** Mixing personas and formatting rules (e.g. JSON array structure requirements) directly inside user prompt texts (like `text: You are a search engine... Return JSON array...`) is brittle, reduces strict adherence from models (often leading to non-array outputs), and exposes the system to prompt injection if the user query is mixed in.\n**Action:** Always move the AI's persona role definition and rigid output format constraints exclusively into the `config: { systemInstruction: ... }` field of the `generateContent` call. Reserve the `parts: [{text: ...}]` array strictly for dynamic context data and the raw user query, and add strict structural validation (e.g. checking elements within the array are objects) on the returned data immediately.

## 2024-05-24 - [Iterative JSON Parsing]
**Learning:** Hardcoded text slicing for `JSON.parse` by looking at the very first and last bracket/brace is brittle when models return conversational text before or after the JSON block that happens to include a `{` or `[`. This resulted in the JSON parse crashing and causing the UI to fail.
**Action:** Implemented an iterative parsing mechanism inside `safeParseJSON` that advances the start index of the bracket/brace search whenever `JSON.parse` fails. This ensures we actually find the valid JSON object inside conversational fluff even if it's peppered with brackets.

## 2026-09-11 - Implement Sequential Chunking for Batch AI Operations
**Learning:** Sending unbounded arrays of raw data (like full transaction lists) directly into AI prompts leads to context window token exhaustion and causes the entire batch to fail if the API returns an error or is rate-limited.
**Action:** Always slice or chunk large datasets into manageable batches (e.g., arrays of 50) before sending them to the AI model. Process these chunks sequentially, merge the results, and ensure that if a specific chunk fails, only that chunk gracefully falls back (e.g., to 'Uncategorized'), preventing a single error from bringing down the entire batch.

## 2026-09-12 - Standardize Structured Contents Array for Single Prompts
**Learning:** Passing a raw string to the `contents` parameter of `generateContent` works for simple prompts but is brittle and bypasses the SDK's structural expectations, increasing the risk of unpredictable parsing by the AI model.
**Action:** Always format the `contents` payload as a structured array (`[{ role: 'user', parts: [{ text: prompt }] }]`) even for simple, single-turn prompts to enforce structural consistency.
## 2026-09-17 - Centralize AI Client Instance and API Keys
**Learning:** Directly initializing `GoogleGenAI` inside individual components using `process.env.API_KEY` leads to fragile, inconsistent behavior across the app, prevents centralized timeout and error handling wrappers from acting on these requests, and breaks if bundlers (like Vite vs Webpack) handle environment variables differently.
**Action:** Never instantiate `new GoogleGenAI()` directly inside a component. Always import and use the centralized `aiClient` and `API_KEY` exported from `services/aiConfig.ts`. Validate the client is available (e.g., `if (aiClient && API_KEY)`) before interacting with it.

## 2026-10-24 - Enforce Centralized AI Client Usage in Components
**Learning:** Instantiating `new GoogleGenAI()` directly within React components (e.g., `AIChat.tsx`) using raw environment variables bypasses centralized AI quality controls, such as standardized timeout wrappers (`withTimeout`), fallback logic, and environment variable validation, leading to brittle and inconsistent AI behavior across the application.
**Action:** Never instantiate `GoogleGenAI` directly in components. Always import and use the pre-configured `aiClient` and `API_KEY` from `services/aiConfig.ts` to ensure consistent AI quality enforcement, error handling, and timeout behavior throughout the app.
## 2025-03-05 - Centralize AI Client Instantiation
**Learning:** Instantiating `new GoogleGenAI()` directly inside components using raw environment variables leads to duplicated configuration, inconsistent error handling (missing the warnings in `aiConfig.ts`), and bypassing of centralized availability checks.
**Action:** Never instantiate `new GoogleGenAI()` directly. Always import and use the centralized `aiClient` and `API_KEY` from `services/aiConfig.ts`, and validate their availability (`if (aiClient && API_KEY)`) before creating chat instances or generating content.
