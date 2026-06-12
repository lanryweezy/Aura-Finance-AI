## 2025-06-12 - Missing ARIA Labels on Icon-Only Close Buttons
**Learning:** Found an accessibility issue pattern across this app where icon-only close buttons in modals/alerts (such as the "Secure Shareable Link" alert) lack `aria-label` attributes, making them completely inaccessible to screen reader users.
**Action:** Always verify that buttons containing only SVGs or icons have a descriptive `aria-label` added for proper keyboard/screen reader navigation.
