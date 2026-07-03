import { supabase } from './supabaseClient';
import { db } from './db';

export interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  lastActive: string;
  createdAt: string;
}

export const sessionService = {
  getActiveSessions: async (): Promise<ActiveSession[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('active_sessions')
      .select('*').eq('organization_id', db.getOrgId())
      .order('last_active', { ascending: false });
    return (data || []) as ActiveSession[];
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    if (supabase) await supabase.from('active_sessions').delete().eq('id', sessionId);
  },

  revokeAllExcept: async (currentSessionId: string): Promise<void> => {
    if (!supabase) return;
    await supabase.from('active_sessions')
      .delete()
      .eq('organization_id', db.getOrgId())
      .neq('id', currentSessionId);
  },
};
