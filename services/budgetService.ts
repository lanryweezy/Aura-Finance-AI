import type { Budget } from '../types';
import { supabase } from './supabaseClient';
import { db } from './db';

const TABLE = 'budgets';

export const fetchBudgets = async (): Promise<Budget[]> => {
  return db.query<Budget>(TABLE);
};

export const saveBudgets = async (budgets: Budget[]): Promise<void> => {
  if (!supabase) return;  // Graceful fallback for demo mode
  const orgId = db.getOrgId();

  await supabase.from(TABLE).delete().eq('organization_id', orgId);

  if (budgets.length > 0) {
    const rows = budgets.map(b => ({
      category: b.category,
      amount: b.amount,
      entity_id: b.entityId,
      organization_id: orgId,
    }));
    const { error } = await supabase.from(TABLE).insert(rows);
    if (error) throw error;
  }
};
