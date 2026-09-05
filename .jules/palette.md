## 2024-06-25 - Icon-only Links Missing ARIA Labels
**Learning:** In addition to `<button>` elements, icon-only `<a>` tags (such as those wrapping SVG components like `<Icons.Receipt />`) must also include `aria-label` attributes for screen reader accessibility, even if a `title` attribute is present.
**Action:** Always check both `<button>` and `<a>` elements that are interactive and lack text content to ensure they have an explicit `aria-label`.
