## 2023-10-27 - [Avoid `.map()` before `.slice()` on large arrays]
**Learning:** Calling `.map()` on an entire large array (e.g. `transactions` in `Dashboard.tsx`) just to take the top N items using `.slice()` later causes a huge number of unnecessary object allocations and performance degradation, particularly in frequently run hooks like `useMemo`.
**Action:** Always filter, sort, and slice the raw array *before* applying `.map()` to restrict the expensive transformation to only the required number of items.

## 2023-11-09 - [Avoid chained `.filter().reduce()` for multiple aggregates]
**Learning:** Chaining `.filter()` followed by `.reduce()` creates intermediate array allocations (O(N) memory) and requires multiple passes over the dataset. In `StatsBar.tsx`, this caused O(4N) iterations over transactions, bills, and invoices on every render.
**Action:** Use a single-pass `for` loop (or a single `.reduce()`) to aggregate multiple values simultaneously. Always wrap expensive derivations in `useMemo` to prevent recalculation on every render.

## 2023-11-10 - [Avoid O(N*M) nested `.filter().reduce()` in render loops]
**Learning:** In `ContactsView.tsx`, computing balances dynamically via nested `.filter().reduce()` on large collections (e.g. `invoices` and `bills`) for each rendered contact element scales at O(C * (I + B)), resulting in performance bottlenecks.
**Action:** Lift array computations into a memoized pre-pass. Use `useMemo` with a single O(I + B) pass to construct a `Map` of aggregated balances, allowing O(1) map lookups during render. This turns O(C * (I + B)) complexity into O(C + I + B).

## 2024-03-24 - [Consolidate redundant array iterations]
**Learning:** Computing multiple derived values (e.g. filtered arrays and totals) via separate array `.filter()` and `.reduce()` calls causes O(4N) iterations over the same dataset on every render, which is inefficient for large datasets like inventory items.
**Action:** Always compute derived array metrics in a single pass using a `for` loop inside a `useMemo` hook, ensuring it's only recalculated when dependencies change, and optimizing performance to O(N).

## 2024-03-24 - [Avoid O(P*T) nested iterations for aggregations in `.map()`]
**Learning:** In `ProjectsView.tsx`, calculating aggregate totals for every project by calling `transactions.filter(...)` inside the `projects.map()` loop caused an O(P * T) complexity, executing a full array scan for every iteration.
**Action:** Lift array filtering computations out of `.map()`. Pre-aggregate required totals into a lookup `Map` with a single O(N) pass, then access the pre-computed totals during the list mapping with O(1) lookups.
## 2026-09-19 - [Pre-aggregate values to avoid O(N*M) lookups inside list rendering]\n**Learning:** In MultiEntityDashboard.tsx, calculating aggregate totals for every entity by calling transactions.filter(...) inside the entities.map() loop caused an O(E * T) complexity, executing a full array scan for every iteration.\n**Action:** Lift array filtering computations out of .map(). Pre-aggregate required totals into a lookup Map with a single O(N) pass, then access the pre-computed totals during the list mapping with O(1) lookups.
## 2024-03-24 - [Avoid recalculating invariants inside filter arrays on every render]
**Learning:** Calculating derived values (like `toLowerCase()`, string parsings to Number, or `new Date()`) inside a `.filter` block on every render loop scales poorly on long arrays, resulting in slow renders due to repeated processing and object instantiations.
**Action:** Lift static conversions (`searchTerm.toLowerCase()`, `new Date(filters.start_date).getTime()`) out of the loop up to the nearest `useMemo` scope, while ensuring any conditional, row-specific logic within the filter remains lazily evaluated only when necessary.
## 2024-03-24 - [Avoid O(N*T) redundant filtering inside list rendering]
**Learning:** Repeating `array.filter(...).map(...)` for multiple fixed categories inside a render loop scales at O(N*T) (where N is items and T is categories), causing unnecessary full array scans on every render.
**Action:** Pre-compute a lookup dictionary (e.g., `Record<string, Item[]>`) in a single O(N) pass using `useMemo`, then iterate through the dictionary keys for rendering.

## 2024-05-18 - [Avoid O(E*(T+I)) nested `.filter()` in map during render]
**Learning:** In `MultiEntityDashboard.tsx`, computing transaction and invoice counts by calling `.filter()` inside the `entities.map()` render loop caused an O(E * (T + I)) complexity, resulting in performance bottlenecks as entities, transactions, and invoices scale.
**Action:** Lift array computations into a memoized pre-pass. Use `useMemo` with a single O(T + I) pass to construct a `Map` of aggregated counts, allowing O(1) map lookups during render. This turns O(E * (T + I)) complexity into O(T + I).
## 2024-05-18 - [Avoid O(E*N) nested filters inside render map loops]
**Learning:** Calling `.filter()` on the entire `transactions` and `invoices` array inside an `.map()` loop (e.g. over `entities`) causes a performance bottleneck of O(E * N), recreating arrays and traversing full collections on every iteration during render.
**Action:** Lift array computations out of `.map()` loops. Pre-compute entity metrics using a single O(N) pass across the data arrays wrapped in a `useMemo` hook, store results in a lookup `Map`, and use O(1) map lookups during render to change O(E * N) time complexity into O(E + N).
## 2025-02-28 - [Consolidate Array Filtering and Aggregation]
**Learning:** Performing multiple independent `.filter()` and `.length` passes over the same array inside a React component (e.g., in `ApprovalWorkflowsView.tsx` where it was filtering for `filtered` list and `pendingCount` separately) creates unnecessary O(2N) overhead.
**Action:** Always combine the filtering for rendered lists and the reduction for aggregate counts into a single-pass loop (or `.reduce`) wrapped in `useMemo`, allowing `O(N)` instead of `O(K*N)`.
