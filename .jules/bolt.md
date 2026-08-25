## 2023-10-27 - [Avoid `.map()` before `.slice()` on large arrays]
**Learning:** Calling `.map()` on an entire large array (e.g. `transactions` in `Dashboard.tsx`) just to take the top N items using `.slice()` later causes a huge number of unnecessary object allocations and performance degradation, particularly in frequently run hooks like `useMemo`.
**Action:** Always filter, sort, and slice the raw array *before* applying `.map()` to restrict the expensive transformation to only the required number of items.

## 2023-11-09 - [Avoid chained `.filter().reduce()` for multiple aggregates]
**Learning:** Chaining `.filter()` followed by `.reduce()` creates intermediate array allocations (O(N) memory) and requires multiple passes over the dataset. In `StatsBar.tsx`, this caused O(4N) iterations over transactions, bills, and invoices on every render.
**Action:** Use a single-pass `for` loop (or a single `.reduce()`) to aggregate multiple values simultaneously. Always wrap expensive derivations in `useMemo` to prevent recalculation on every render.
## 2025-08-25 - Single Pass Loops over Array methods
**Learning:** In calculation-heavy services (like `forecastingService.ts` and `validationService.ts`), chaining `.filter()` and `.reduce()` over large datasets creates unnecessary O(N) intermediate array allocations and blocks CPU cycles. Mathematical logic can be safely preserved by combining these operations.
**Action:** Replaced chained array methods with single-pass `for` loops when computing multiple aggregates from the same dataset. This drastically reduces execution time and memory footprint on large datasets.
