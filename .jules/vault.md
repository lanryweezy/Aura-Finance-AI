## $(date +%Y-%m-%d) - Negative Quantities in Stock Movements
**Learning:** The `stock_movements` table intentionally uses negative values in its `quantity` column to represent stock leaving the system. Adding a `CHECK (quantity >= 0)` constraint would break core inventory tracking logic.
**Action:** When auditing tables for positive-amount constraints, verify domain logic for directional movements (like inventory or double-entry accounting) where negative quantities denote outward flow.
