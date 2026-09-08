## 2023-10-27 - [Avoid `.map()` before `.slice()` on large arrays]
**Learning:** Calling `.map()` on an entire large array (e.g. `transactions` in `Dashboard.tsx`) just to take the top N items using `.slice()` later causes a huge number of unnecessary object allocations and performance degradation, particularly in frequently run hooks like `useMemo`.
**Action:** Always filter, sort, and slice the raw array *before* applying `.map()` to restrict the expensive transformation to only the required number of items.

## 2023-11-09 - [Avoid chained `.filter().reduce()` for multiple aggregates]
**Learning:** Chaining `.filter()` followed by `.reduce()` creates intermediate array allocations (O(N) memory) and requires multiple passes over the dataset. In `StatsBar.tsx`, this caused O(4N) iterations over transactions, bills, and invoices on every render.
**Action:** Use a single-pass `for` loop (or a single `.reduce()`) to aggregate multiple values simultaneously. Always wrap expensive derivations in `useMemo` to prevent recalculation on every render.

## 2023-11-10 - [Avoid O(N*M) nested `.filter().reduce()` in render loops]
**Learning:** In `ContactsView.tsx`, computing balances dynamically via nested `.filter().reduce()` on large collections (e.g. `invoices` and `bills`) for each rendered contact element scales at O(C * (I + B)), resulting in performance bottlenecks.
**Action:** Lift array computations into a memoized pre-pass. Use `useMemo` with a single O(I + B) pass to construct a `Map` of aggregated balances, allowing O(1) map lookups during render. This turns O(C * (I + B)) complexity into O(C + I + B).

## 2024-03-05 - [Avoid O(N*T) redundant array filtering in nested map structures]
**Learning:** In `ChartOfAccountsView.tsx`, nesting `accounts.filter(a => a.type === type)` inside an iteration of `accountTypes.map(type => ...)` forces the component to repeatedly iterate over the full `accounts` array for every individual type, and creates redundant array allocations on every render cycle. Calling the exact same `.filter` twice in the render block (once to map elements, once to check `.length`) doubled this inefficiency.
**Action:** When a UI component needs to display a list grouped into multiple categories, avoid inline `.filter` calls during rendering. Instead, create a grouped dictionary (`Record<Type, Item[]>`) using `useMemo` with a single O(N) pass, enabling O(1) property access during render loops.
