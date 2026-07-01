import { supabase } from './supabaseClient';
import { db } from './db';
import type { Expense } from '../types';

const TABLE = 'expenses';

export const expenseService = {
  fetch: async (): Promise<Expense[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('organization_id', db.getOrgId())
      .order('date', { ascending: false });
    if (error) return [];
    return (data || []) as Expense[];
  },

  create: async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
    if (supabase) {
      const { data, error } = await supabase.from(TABLE).insert({
        ...expense,
        submitted_by: user.id,
        submitted_by_name: user.name,
        organization_id: db.getOrgId(),
      }).select().single();
      if (error) throw error;
      return data as Expense;
    }
    return { ...expense, id: `exp_${Date.now()}`, submittedBy: user.id, submittedByName: user.name, createdAt: new Date().toISOString() } as Expense;
  },

  approve: async (id: string): Promise<void> => {
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
    if (supabase) {
      await supabase.from(TABLE).update({ status: 'approved', approved_by: user.id }).eq('id', id);
    }
  },

  reimburse: async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from(TABLE).update({ status: 'reimbursed', reimbursed_at: new Date().toISOString() }).eq('id', id);
    }
  },

  reject: async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from(TABLE).update({ status: 'rejected' }).eq('id', id);
    }
  },

  delete: async (id: string): Promise<void> => {
    if (supabase) await supabase.from(TABLE).delete().eq('id', id);
  },

  getStats: async () => {
    const expenses = await expenseService.fetch();
    const thisMonth = expenses.filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      total: expenses.length,
      thisMonth: thisMonth.length,
      thisMonthTotal: thisMonth.reduce((s, e) => s + e.amount, 0),
      pending: expenses.filter(e => e.status === 'submitted').length,
      approved: expenses.filter(e => e.status === 'approved').length,
      reimbursed: expenses.filter(e => e.status === 'reimbursed').reduce((s, e) => s + e.amount, 0),
    };
  },
};
