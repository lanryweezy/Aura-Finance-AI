-- ============================================================
-- DOWN Migration: Add missing foreign keys for user_id
-- ============================================================

ALTER TABLE active_sessions DROP CONSTRAINT IF EXISTS active_sessions_user_id_fkey;
ALTER TABLE audit_logs_v2 DROP CONSTRAINT IF EXISTS audit_logs_v2_user_id_fkey;
ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS user_permissions_user_id_fkey;
