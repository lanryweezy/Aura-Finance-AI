## 2025-06-12 - Missing ARIA Labels on Icon-Only Close Buttons
**Learning:** Found an accessibility issue pattern across this app where icon-only close buttons in modals/alerts (such as the "Secure Shareable Link" alert) lack `aria-label` attributes, making them completely inaccessible to screen reader users.
**Action:** Always verify that buttons containing only SVGs or icons have a descriptive `aria-label` added for proper keyboard/screen reader navigation.

## 2026-08-21 - Missing ARIA Labels on AI Alerts dismiss buttons
**Learning:** Found that the dismiss button ('✕') in the AI Alerts widget was lacking an aria-label. This is consistent with the previously identified pattern of icon-only close buttons missing labels.
**Action:** Remember to explicitly check dynamically rendered widgets like AI Alerts for icon-only buttons lacking accessibility labels.
