## 2024-03-24 - Form Accessibility
**Learning:** Found multiple instances where form `<label>` elements were missing the `htmlFor` attribute linking them to their corresponding `<input>` using the `id` attribute. This is a critical accessibility issue for screen readers.
**Action:** When adding or updating forms, always ensure `<label>` has `htmlFor` and the corresponding `<input>` has a matching `id` attribute to establish a clear association.

## 2024-03-24 - Form Accessibility
**Learning:** Found multiple instances where form `<label>` elements were missing the `htmlFor` attribute linking them to their corresponding `<input>` using the `id` attribute. This is a critical accessibility issue for screen readers.
**Action:** When adding or updating forms, always ensure `<label>` has `htmlFor` and the corresponding `<input>` has a matching `id` attribute to establish a clear association.

## 2026-07-02 - Icon-Only Button Accessibility in Interactive Chat Widgets
**Learning:** In highly interactive components like `AIChat.tsx`, dynamically enabled/disabled buttons that contain only SVGs (e.g., send buttons) are easily missed during standard ARIA sweeps if they lack textual content.
**Action:** Always ensure that icon-only interactive elements explicitly define an `aria-label` describing their action (e.g., "Send message"), especially in chat or messaging widgets.
## 2024-05-18 - Form Fields Missing explicit id associations
**Learning:** In dynamically generated forms like `FixedAssetsView.tsx` where new elements might not be tied to an underlying explicit database model yet, `htmlFor` and `id` linking for standard form inputs (text, number, date, select) are frequently omitted, degrading screen reader accessibility.
**Action:** Always verify that every standard `<label>` explicitly associates with its `<input>`/`<select>` using the `htmlFor` and `id` attributes.

## 2024-05-20 - Receipt Scanner Modal Accessibility
**Learning:** Found multiple instances where the Receipt Scanner Modal lacked proper `htmlFor` attributes on the `<label>` elements linking them to corresponding `<input>` using the `id` attributes. This is a critical accessibility issue for screen readers and makes the target area smaller for pointer-based navigation.
**Action:** When working on complex interactive form elements like modals that collect AI output, verify standard `<label>` and `<input>`/`<select>` associations exist via `htmlFor` and `id` tags.
## 2026-10-15 - Form Accessibility and Missing Linking Attributes\n**Learning:** Discovered multiple components (`AutonomousDashboard`, `AdvancedFilter`, `InventoryView`, `ProjectsView`) with form labels missing the `htmlFor` attribute linking them to their corresponding `input` or `select` using the `id` attribute. In some cases, dynamic lists (like config toggles or advanced filters) lacked a uniquely generated `id` to correctly link labels.\n**Action:** When working on generic forms, dynamic lists of filters, or modals, always ensure that each `<label>` explicitly associates with its `<input>` or `<select>` using matching `htmlFor` and `id` attributes. For dynamic forms, generate unique IDs based on keys or fields.
