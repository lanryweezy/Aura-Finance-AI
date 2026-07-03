import { supabase } from './supabaseClient';
import { db } from './db';

export interface MileageEntry {
  id: string;
  employeeId: string;
  date: string;
  startLocation: string;
  endLocation: string;
  kilometers: number;
  purpose: string;
  ratePerKm: number;
  amount: number;
  approved: boolean;
  createdAt: string;
}

const NIGERIAN_MILEAGE_RATE = 100; // ₦100 per km (standard rate)

export const mileageService = {
  calculateAmount: (km: number, rate: number = NIGERIAN_MILEAGE_RATE): number => {
    return Math.round(km * rate);
  },

  record: async (data: Omit<MileageEntry, 'id' | 'amount' | 'approved' | 'createdAt'>): Promise<MileageEntry> => {
    const amount = mileageService.calculateAmount(data.kilometers, data.ratePerKm);
    if (supabase) {
      const { data: saved } = await supabase.from('mileage_entries').insert({
        ...data, amount, approved: false, organization_id: db.getOrgId(),
      }).select().single();
      return saved as MileageEntry;
    }
    return { ...data, id: `mil_${Date.now()}`, amount, approved: false, createdAt: new Date().toISOString() };
  },

  getByEmployee: async (employeeId: string): Promise<MileageEntry[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('mileage_entries')
      .select('*').eq('employee_id', employeeId).eq('organization_id', db.getOrgId())
      .order('date', { ascending: false });
    return (data || []) as MileageEntry[];
  },

  approve: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('mileage_entries').update({ approved: true }).eq('id', id);
  },
};
