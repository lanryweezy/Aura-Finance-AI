## 2026-08-14 - [Stitch: Drill-down wiring in BalanceSheetReport]
**Learning:** Incomplete drill-down stubs exist in BalanceSheetReport (rendered with a `showToast("not implemented yet")` but functionally wired in the parent component via `handleDrillDown`).
**Action:** Replaced the `showToast` stubs with calls to the existing `onDrillDown` property, using the correct category references. Type signatures were updated safely, making sure everything propagates seamlessly to the parent component.
