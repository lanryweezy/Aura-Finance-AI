import { supabase } from './supabaseClient';
import { db } from './db';

export interface BonusScheme {
  id: string;
  name: string;
  type: 'performance' | 'attendance' | 'target' | 'custom';
  calculation: string;
  isActive: boolean;
  organizationId: string;
}

export const bonusSchemeService = {
  fetch: async (): Promise<BonusScheme[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('bonus_schemes')
      .select('*').eq('organization_id', db.getOrgId());
    return (data || []) as BonusScheme[];
  },

  create: async (scheme: Omit<BonusScheme, 'id' | 'organizationId'>): Promise<BonusScheme> => {
    if (supabase) {
      const { data } = await supabase.from('bonus_schemes').insert({
        ...scheme, organization_id: db.getOrgId(),
      }).select().single();
      return data as BonusScheme;
    }
    return { ...scheme, id: `bs_${Date.now()}`, organizationId: '' };
  },

  calculateBonus: (grossSalary: number, schemeType: string, performance?: number): number => {
    switch (schemeType) {
      case 'performance': return Math.round(grossSalary * (performance || 0.1));
      case 'attendance': return Math.round(grossSalary * 0.05);
      case 'target': return Math.round(grossSalary * 0.15);
      default: return 0;
    }
  },
};
