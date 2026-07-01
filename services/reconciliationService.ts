import { supabase } from './supabaseClient';
import { db } from './db';
import type { BankTransaction, ReconciliationSession } from '../types';

export const reconciliationService = {
  createSession: async (bankAccountId: string, period: string, statementBalance: number): Promise<ReconciliationSession> => {
    if (supabase) {
      const { data } = await supabase.from('reconciliation_sessions').insert({
        bank_account_id: bankAccountId, period, statement_balance: statementBalance,
        book_balance: 0, difference: statementBalance, matched_count: 0, unmatched_count: 0,
        status: 'in_progress', organization_id: db.getOrgId(),
      }).select().single();
      return data as ReconciliationSession;
    }
    return { id: `rec_${Date.now()}`, bankAccountId, period, statementBalance, bookBalance: 0, difference: statementBalance, matchedCount: 0, unmatchedCount: 0, status: 'in_progress', createdAt: new Date().toISOString() } as ReconciliationSession;
  },

  autoMatch: async (sessionId: string): Promise<{ matched: number; unmatched: number }> => {
    // Auto-match by amount + date proximity
    if (!supabase) return { matched: 0, unmatched: 0 };
    const { data: session } = await supabase.from('reconciliation_sessions').select('*').eq('id', sessionId).single();
    if (!session) return { matched: 0, unmatched: 0 };

    const { data: bankTx } = await supabase.from('transactions')
      .select('*').eq('organization_id', db.getOrgId());
    const { data: bookTx } = await supabase.from('transactions')
      .select('*').eq('organization_id', db.getOrgId());

    if (!bankTx || !bookTx) return { matched: 0, unmatched: 0 };

    let matched = 0;
    const matchedIds: string[] = [];
    for (const bt of bankTx) {
      const best = bookTx.find(bk =>
        !matchedIds.includes(bk.id) &&
        Math.abs(bt.amount - bk.amount) < 1 &&
        Math.abs(new Date(bt.date).getTime() - new Date(bk.date).getTime()) < 7 * 86400000
      );
      if (best) {
        matchedIds.push(best.id);
        matched++;
      }
    }

    await supabase.from('reconciliation_sessions').update({
      matched_count: matched, unmatched_count: bankTx.length - matched,
    }).eq('id', sessionId);

    return { matched, unmatched: bankTx.length - matched };
  },

  completeSession: async (sessionId: string): Promise<void> => {
    if (supabase) {
      await supabase.from('reconciliation_sessions').update({
        status: 'completed', completed_at: new Date().toISOString(),
      }).eq('id', sessionId);
    }
  },

  fetchSessions: async (): Promise<ReconciliationSession[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('reconciliation_sessions')
      .select('*').eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false });
    return (data || []) as ReconciliationSession[];
  },
};
