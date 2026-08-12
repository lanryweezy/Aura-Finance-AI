## 2026-06-11 - Validate AI JSON Output
**Learning:** Parsing raw AI output directly with `JSON.parse()` without structural validation can lead to silent data corruption or runtime exceptions (like `TypeError` when expecting arrays or objects).
**Action:** Always validate the structure and required fields of `JSON.parse()` output before trusting it or passing it to downstream functions. Throw errors on validation failure to trigger graceful fallbacks.

## 2026-06-15 - Enforce Bounded Execution for AI Calls
**Learning:** Unguarded external AI model calls (e.g., `aiClient.models.generateContent`) can hang indefinitely when the provider is slow or unresponsive, leading to silent UI freezes and degraded user experience.
**Action:** Always wrap raw external AI model calls in a `withTimeout` promise wrapper (from `services/aiConfig.ts`) with a strict maximum execution time (e.g., 10,000ms). This ensures requests fail quickly and trigger the application's graceful fallbacks.

## 2026-06-15 - Enforce Bounded Execution for Streamed AI Calls
**Learning:** Unguarded streaming AI model calls (e.g., `chatInstance.current.sendMessageStream`) can also hang when the provider is slow or unresponsive, causing the chat UI to hang with a loading state indefinitely.
**Action:** Wrap streaming AI API interactions, such as `sendMessageStream` inside `components/AIChat.tsx`, with `withTimeout` just like single-shot completions. This ensures the chat fallback is triggered effectively.

## 2026-06-16 - Safe AI JSON Parsing
**Learning:** `JSON.parse` will throw an exception if the AI model outputs extraneous text or markdown blocks (e.g. ` ```json `) alongside the JSON.
**Action:** Use a `safeParseJSON` utility to wrap `JSON.parse`. It should extract valid JSON substrings by looking for '{' and '}' (or '[' and ']') to handle slightly malformed responses.
