import { supabase } from './supabaseClient';
import { db } from './db';
import type { CorporateCard, CardTransaction } from '../types';

function generateCardNumber(): string {
  const prefix = '4'; // Visa
  let num = prefix;
  for (let i = 0; i < 15; i++) num += Math.floor(Math.random() * 10);
  return num;
}

function generateCVV(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

function generateExpiry(): string {
  const now = new Date();
  const exp = new Date(now.getFullYear() + 3, now.getMonth());
  return `${String(exp.getMonth() + 1).padStart(2, '0')}/${String(exp.getFullYear()).slice(-2)}`;
}

export const cardService = {
  fetchCards: async (): Promise<CorporateCard[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('corporate_cards')
      .select('*')
      .eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(c => ({
      ...c,
      categoryControls: c.category_controls || [],
    })) as CorporateCard[];
  },

  createCard: async (cardData: {
    name: string;
    type: 'virtual' | 'physical';
    spendLimit: number;
    assignedTo?: string;
    assignedToName?: string;
    categoryControls?: { category: string; enabled: boolean; limit?: number }[];
  }): Promise<CorporateCard> => {
    const card: Partial<CorporateCard> = {
      name: cardData.name,
      type: cardData.type,
      status: 'active',
      last4: generateCardNumber().slice(-4),
      spendLimit: cardData.spendLimit,
      spentAmount: 0,
      currency: 'NGN',
      assignedTo: cardData.assignedTo,
      assignedToName: cardData.assignedToName,
      categoryControls: cardData.categoryControls || [],
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('corporate_cards')
        .insert({
          ...card,
          category_controls: JSON.stringify(card.categoryControls),
          organization_id: db.getOrgId(),
        })
        .select()
        .single();
      if (error) throw error;
      return { ...data, categoryControls: data.category_controls || [] } as CorporateCard;
    }

    return { ...card, id: `card_${Date.now()}` } as CorporateCard;
  },

  freezeCard: async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from('corporate_cards').update({ status: 'frozen', is_active: false }).eq('id', id);
    }
  },

  unfreezeCard: async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from('corporate_cards').update({ status: 'active', is_active: true }).eq('id', id);
    }
  },

  cancelCard: async (id: string): Promise<void> => {
    if (supabase) {
      await supabase.from('corporate_cards').update({ status: 'cancelled', is_active: false }).eq('id', id);
    }
  },

  updateSpendLimit: async (id: string, limit: number): Promise<void> => {
    if (supabase) {
      await supabase.from('corporate_cards').update({ spend_limit: limit }).eq('id', id);
    }
  },

  updateCategoryControls: async (id: string, controls: { category: string; enabled: boolean; limit?: number }[]): Promise<void> => {
    if (supabase) {
      await supabase.from('corporate_cards').update({ category_controls: JSON.stringify(controls) }).eq('id', id);
    }
  },

  fetchTransactions: async (cardId?: string): Promise<CardTransaction[]> => {
    if (!supabase) return [];
    let q = supabase.from('card_transactions').select('*').eq('organization_id', db.getOrgId());
    if (cardId) q = q.eq('card_id', cardId);
    const { data, error } = await q.order('date', { ascending: false }).limit(100);
    if (error) return [];
    return (data || []) as CardTransaction[];
  },

  checkSpendLimit: async (cardId: string, amount: number): Promise<{ allowed: boolean; reason?: string }> => {
    if (!supabase) return { allowed: true };
    const { data } = await supabase.from('corporate_cards').select('*').eq('id', cardId).single();
    if (!data) return { allowed: false, reason: 'Card not found' };
    if (data.status !== 'active') return { allowed: false, reason: 'Card is not active' };
    if (data.spent_amount + amount > data.spend_limit) {
      return { allowed: false, reason: `Exceeds spend limit. Remaining: ₦${(data.spend_limit - data.spent_amount).toLocaleString()}` };
    }
    return { allowed: true };
  },

  recordTransaction: async (tx: Omit<CardTransaction, 'id'>): Promise<void> => {
    if (supabase) {
      await supabase.from('card_transactions').insert({
        ...tx,
        organization_id: db.getOrgId(),
      });
      // Update spent amount
      await supabase.rpc('increment_card_spent', { card_id: tx.cardId, amount: tx.amount });
    }
  },

  getCardStats: async () => {
    const cards = await cardService.fetchCards();
    const totalLimit = cards.reduce((s, c) => s + c.spendLimit, 0);
    const totalSpent = cards.reduce((s, c) => s + c.spentAmount, 0);
    return {
      totalCards: cards.length,
      activeCards: cards.filter(c => c.status === 'active').length,
      totalLimit,
      totalSpent,
      utilization: totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0,
    };
  },
};
