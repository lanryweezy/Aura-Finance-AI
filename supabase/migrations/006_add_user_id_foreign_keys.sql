-- ============================================================
-- Migration: Add missing foreign keys for user_id
-- Gap Closed: Ensures `user_id` references valid `users`.
-- Invalid state prevented: orphaned user permissions, audit logs, and active sessions when a user is deleted.
-- ============================================================

-- UP
-- Add the constraints safely using NOT VALID to avoid heavy table locks
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE audit_logs_v2 ADD CONSTRAINT audit_logs_v2_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE active_sessions ADD CONSTRAINT active_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT VALID;
