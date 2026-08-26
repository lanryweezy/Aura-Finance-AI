## 2023-10-27 - [Avoid `.map()` before `.slice()` on large arrays]
**Learning:** Calling `.map()` on an entire large array (e.g. `transactions` in `Dashboard.tsx`) just to take the top N items using `.slice()` later causes a huge number of unnecessary object allocations and performance degradation, particularly in frequently run hooks like `useMemo`.
**Action:** Always filter, sort, and slice the raw array *before* applying `.map()` to restrict the expensive transformation to only the required number of items.

## 2023-11-09 - [Avoid chained `.filter().reduce()` for multiple aggregates]
**Learning:** Chaining `.filter()` followed by `.reduce()` creates intermediate array allocations (O(N) memory) and requires multiple passes over the dataset. In `StatsBar.tsx`, this caused O(4N) iterations over transactions, bills, and invoices on every render.
**Action:** Use a single-pass `for` loop (or a single `.reduce()`) to aggregate multiple values simultaneously. Always wrap expensive derivations in `useMemo` to prevent recalculation on every render.

## 2024-05-18 - [O(N*M) lookups inside list mapping loops]
**Learning:** Computing totals (like `getBalance` using `.filter().reduce()` on full arrays of invoices and bills) for every row inside a list mapping loop creates an O(N*M) performance issue that scales terribly as datasets grow.
**Action:** When calculating derived statistics per row for a list, pre-compute a lookup table (e.g. `Map<string, number>`) using `useMemo` with a single O(M) pass over the source data, then use O(1) lookups during the list mapping (O(N) total).
