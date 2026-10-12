-- ============================================================
-- Migration: Add CHECK constraints for temporal ordering of lifecycle timestamps
-- Gap Closed: Prevents invalid states where system-generated temporal lifecycle events are marked as occurring before the entity was created.
-- Invalid state prevented: Timeline corruption and impossible state transitions across multiple domain entities.
-- Note: Domain/Business event timestamps (like paid_at, issued_at) are intentionally excluded because they can legitimately precede system creation time (e.g. recording historical events).
-- ============================================================

ALTER TABLE client_portal_links ADD CONSTRAINT client_portal_links_viewed_at_check CHECK (viewed_at >= created_at) NOT VALID;
ALTER TABLE active_sessions ADD CONSTRAINT active_sessions_last_active_check CHECK (last_active >= created_at) NOT VALID;
ALTER TABLE integrations ADD CONSTRAINT integrations_last_synced_check CHECK (last_synced >= created_at) NOT VALID;
ALTER TABLE bank_connections ADD CONSTRAINT bank_connections_last_synced_check CHECK (last_synced >= created_at) NOT VALID;

/*
-- DOWN Migration:
ALTER TABLE client_portal_links DROP CONSTRAINT IF EXISTS client_portal_links_viewed_at_check;
ALTER TABLE active_sessions DROP CONSTRAINT IF EXISTS active_sessions_last_active_check;
ALTER TABLE integrations DROP CONSTRAINT IF EXISTS integrations_last_synced_check;
ALTER TABLE bank_connections DROP CONSTRAINT IF EXISTS bank_connections_last_synced_check;
*/
