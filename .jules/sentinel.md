## 2026-07-03 - Cross-Site Scripting (XSS) via window.open and document.write
**Vulnerability:** Injecting raw HTML containing user-supplied data into `printWindow.document.write(...)` without proper sanitization creates a Cross-Site Scripting (XSS) vulnerability.
**Learning:** `window.open` and `document.write` are powerful APIs that evaluate and execute HTML. When generating documents dynamically (e.g. print documents or reports), relying on `element.innerHTML` or unescaped template literals creates a pathway for malicious scripts if the source data (such as item names or descriptions) is uncontrolled or tampered with.
**Prevention:** Use a robust HTML sanitizer like DOMPurify (`DOMPurify.sanitize()`) when passing raw HTML containing user input to `document.write`. In cases where HTML tags are not needed, `sanitizeHTML` (escaping special characters) should be used inside template literals.

## 2026-08-17 - Further Hardening XSS via window.open and document.write
**Vulnerability:** Although a previous entry noted this vulnerability, raw `innerText` and `html` strings were still being passed directly into `printWindow.document.write(...)` without proper sanitization in multiple files (`DocumentPreviewModal.tsx`, `TaxFilingView.tsx`, `FinancialReportsView.tsx`), creating residual Cross-Site Scripting (XSS) risks.
**Learning:** `innerText` isn't entirely safe if an attacker can manipulate content such that it's interpreted contextually as code, or simply to preserve exact formatting when switching to a safer `innerHTML`. Unescaped template literal evaluations injected straight into DOM sinks bypass standard React protections.
**Prevention:** Strictly enforce the usage of `DOMPurify.sanitize()` around all dynamically generated HTML content injected into `document.write()`.

## 2026-09-12 - Reverse Tabnabbing via window.open
**Vulnerability:** Opening links with `window.open(url, '_blank')` allows the newly opened tab to retain a reference to the originating page's `window` object via `window.opener`. This exposes the original page to Reverse Tabnabbing attacks, where the new page can navigate the original page to a malicious site.
**Learning:** This is particularly dangerous for links to external or unverified sites, as an attacker could replace the legitimate originating application tab with a phishing page.
**Prevention:** Always include the `'noopener,noreferrer'` features when using `window.open` with `'_blank'` for external links. Example: `window.open(url, '_blank', 'noopener,noreferrer')`. This breaks the connection to the `window.opener` object and prevents referer headers from leaking sensitive URLs.
**Important Exception:** Do *not* use `'noopener'` when the application needs to interact with the newly opened window's document (e.g., calling `document.write` on `about:blank` for printing). When `'noopener'` is used, `window.open` returns `null`, breaking functionality that relies on the `WindowProxy` reference.
