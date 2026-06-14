## 2026-06-11 - Validate AI JSON Output
**Learning:** Parsing raw AI output directly with `JSON.parse()` without structural validation can lead to silent data corruption or runtime exceptions (like `TypeError` when expecting arrays or objects).
**Action:** Always validate the structure and required fields of `JSON.parse()` output before trusting it or passing it to downstream functions. Throw errors on validation failure to trigger graceful fallbacks.

## 2026-06-14 - Prevent AI Hangs with Timeout Wrapper
**Learning:** The default AI generation calls (e.g. `generateContent`) do not have built-in timeouts and can hang indefinitely if the AI model is unresponsive, causing silent failures or endless loading states in the UI.
**Action:** Always wrap raw AI calls with a `withTimeout` promise wrapper (implemented in `services/aiConfig.ts`) to enforce a strict maximum execution time. This ensures errors are surfaced quickly and graceful fallbacks are triggered instead of hanging the application.
