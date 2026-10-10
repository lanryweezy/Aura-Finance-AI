## 2024-03-24 - Form Accessibility
**Learning:** Found multiple instances where form `<label>` elements were missing the `htmlFor` attribute linking them to their corresponding `<input>` using the `id` attribute. This is a critical accessibility issue for screen readers.
**Action:** When adding or updating forms, always ensure `<label>` has `htmlFor` and the corresponding `<input>` has a matching `id` attribute to establish a clear association.

## 2024-03-24 - Form Accessibility
**Learning:** Found multiple instances where form `<label>` elements were missing the `htmlFor` attribute linking them to their corresponding `<input>` using the `id` attribute. This is a critical accessibility issue for screen readers.
**Action:** When adding or updating forms, always ensure `<label>` has `htmlFor` and the corresponding `<input>` has a matching `id` attribute to establish a clear association.

## 2026-07-02 - Icon-Only Button Accessibility in Interactive Chat Widgets
**Learning:** In highly interactive components like `AIChat.tsx`, dynamically enabled/disabled buttons that contain only SVGs (e.g., send buttons) are easily missed during standard ARIA sweeps if they lack textual content.
**Action:** Always ensure that icon-only interactive elements explicitly define an `aria-label` describing their action (e.g., "Send message"), especially in chat or messaging widgets.

## 2024-03-24 - Form Accessibility
**Learning:** Found multiple instances where form `<label>` elements were missing the `htmlFor` attribute linking them to their corresponding `<input>` using the `id` attribute. This is a critical accessibility issue for screen readers.
**Action:** When adding or updating forms, always ensure `<label>` has `htmlFor` and the corresponding `<input>` has a matching `id` attribute to establish a clear association.
