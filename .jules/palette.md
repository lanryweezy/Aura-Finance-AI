## 2025-06-12 - Missing ARIA Labels on Icon-Only Close Buttons
**Learning:** Found an accessibility issue pattern across this app where icon-only close buttons in modals/alerts (such as the "Secure Shareable Link" alert) lack `aria-label` attributes, making them completely inaccessible to screen reader users.
**Action:** Always verify that buttons containing only SVGs or icons have a descriptive `aria-label` added for proper keyboard/screen reader navigation.

## 2026-08-21 - Missing ARIA Labels on AI Alerts dismiss buttons
**Learning:** Found that the dismiss button ('✕') in the AI Alerts widget was lacking an aria-label. This is consistent with the previously identified pattern of icon-only close buttons missing labels.
**Action:** Remember to explicitly check dynamically rendered widgets like AI Alerts for icon-only buttons lacking accessibility labels.

## 2025-06-13 - Missing ARIA Labels on Emoji-Only Buttons in Data Tables
**Learning:** Found that an emoji-only action button ("📄") used for downloading a PDF inside the `PayrollRunDetailModal` table completely lacked an `aria-label`. This made the action invisible/inaccessible to screen reader users navigating the table rows.
**Action:** Always verify that buttons containing only emojis (like "📄", "✏️", "🗑️") have a descriptive `aria-label` added, especially when dynamically rendered inside table rows or lists.

## 2025-06-13 - Missing ARIA Labels on Emoji-Only Buttons in Data Tables (Receivables)
**Learning:** Found that an emoji-only action button ("🖨️") used for printing an invoice inside the `ReceivablesView` table lacked an `aria-label`. This is consistent with the previously identified pattern of emoji-only buttons missing labels.
**Action:** Always verify that buttons containing only emojis have a descriptive `aria-label` added, especially when dynamically rendered inside table rows or lists.

## $(date +%Y-%m-%d) - Proper association of labels and form inputs
**Learning:** Found an accessibility issue pattern across this app where `components/ui/FormField.tsx` does not associate its `<label>` elements with `<input>`, `<select>`, and `<textarea>` elements via `htmlFor` and `id` properties. This prevented screen readers from associating the label with the input and broke click-to-focus functionality.
**Action:** When creating reusable form control components, explicitly link `<label>` elements to their interactive controls using `htmlFor` and unique `id`s (potentially generating an ID based on a `name` prop) to ensure robust form accessibility and standard click behavior.
