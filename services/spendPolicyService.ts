import { supabase } from './supabaseClient';
import { db } from './db';
import type { CorporateCard } from '../types';

export interface SpendPolicy {
  id: string;
  name: string;
  maxAmount: number;
  maxDaily: number;
  maxMonthly: number;
  blockedCategories: string[];
  blockedVendors: string[];
  allowedCountries: string[];
  isActive: boolean;
  entityId?: string;
  organizationId: string;
  createdAt: string;
}

export interface PolicyViolation {
  id: string;
  cardId: string;
  transactionAmount: number;
  merchant: string;
  category: string;
  violationType: 'amount_exceeded' | 'daily_limit' | 'monthly_limit' | 'blocked_category' | 'blocked_vendor' | 'blocked_country';
  message: string;
  timestamp: string;
}

const defaultPolicies: Omit<SpendPolicy, 'id' | 'organizationId' | 'createdAt'>[] = [
  {
    name: 'Default Policy',
    maxAmount: 500000,
    maxDaily: 1000000,
    maxMonthly: 10000000,
    blockedCategories: ['gambling', 'crypto', 'adult'],
    blockedVendors: [],
    allowedCountries: ['NG'],
    isActive: true,
  },
  {
    name: 'Employee Standard',
    maxAmount: 100000,
    maxDaily: 300000,
    maxMonthly: 3000000,
    blockedCategories: ['gambling', 'crypto', 'adult', 'travel'],
    blockedVendors: [],
    allowedCountries: ['NG'],
    isActive: true,
  },
  {
    name: 'Executive',
    maxAmount: 2000000,
    maxDaily: 5000000,
    maxMonthly: 50000000,
    blockedCategories: [],
    blockedVendors: [],
    allowedCountries: ['NG', 'US', 'GB', 'EU'],
    isActive: true,
  },
];

export const spendPolicyService = {
  fetchPolicies: async (): Promise<SpendPolicy[]> => {
    if (!supabase) return defaultPolicies.map((p, i) => ({ ...p, id: `policy_${i}`, organizationId: '', createdAt: new Date().toISOString() }));
    const { data } = await supabase.from('spend_policies')
      .select('*').eq('organization_id', db.getOrgId());
    return (data || []) as SpendPolicy[];
  },

  createPolicy: async (policy: Omit<SpendPolicy, 'id' | 'organizationId' | 'createdAt'>): Promise<SpendPolicy> => {
    if (supabase) {
      const { data } = await supabase.from('spend_policies').insert({
        ...policy,
        blocked_categories: policy.blockedCategories,
        blocked_vendors: policy.blockedVendors,
        allowed_countries: policy.allowedCountries,
        organization_id: db.getOrgId(),
      }).select().single();
      return data as SpendPolicy;
    }
    return { ...policy, id: `policy_${Date.now()}`, organizationId: '', createdAt: new Date().toISOString() } as SpendPolicy;
  },

  deletePolicy: async (id: string): Promise<void> => {
    if (supabase) await supabase.from('spend_policies').delete().eq('id', id);
  },

  // Check if a transaction violates any policy
  checkTransaction: async (
    cardId: string,
    amount: number,
    merchant: string,
    category: string,
    country?: string
  ): Promise<{ allowed: boolean; violations: PolicyViolation[] }> => {
    const policies = await spendPolicyService.fetchPolicies();
    const activePolicies = policies.filter(p => p.isActive);
    const violations: PolicyViolation[] = [];

    for (const policy of activePolicies) {
      // Check amount limit
      if (amount > policy.maxAmount) {
        violations.push({
          id: `v_${Date.now()}_${Math.random()}`,
          cardId, transactionAmount: amount, merchant, category,
          violationType: 'amount_exceeded',
          message: `Amount ₦${amount.toLocaleString()} exceeds policy limit of ₦${policy.maxAmount.toLocaleString()}`,
          timestamp: new Date().toISOString(),
        });
      }

      // Check blocked categories
      if (policy.blockedCategories.some(c => category.toLowerCase().includes(c))) {
        violations.push({
          id: `v_${Date.now()}_${Math.random()}`,
          cardId, transactionAmount: amount, merchant, category,
          violationType: 'blocked_category',
          message: `Category "${category}" is blocked by policy "${policy.name}"`,
          timestamp: new Date().toISOString(),
        });
      }

      // Check blocked vendors
      if (policy.blockedVendors.some(v => merchant.toLowerCase().includes(v.toLowerCase()))) {
        violations.push({
          id: `v_${Date.now()}_${Math.random()}`,
          cardId, transactionAmount: amount, merchant, category,
          violationType: 'blocked_vendor',
          message: `Vendor "${merchant}" is blocked by policy "${policy.name}"`,
          timestamp: new Date().toISOString(),
        });
      }

      // Check country
      if (country && policy.allowedCountries.length > 0 && !policy.allowedCountries.includes(country)) {
        violations.push({
          id: `v_${Date.now()}_${Math.random()}`,
          cardId, transactionAmount: amount, merchant, category,
          violationType: 'blocked_country',
          message: `Country "${country}" is not allowed by policy "${policy.name}"`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return { allowed: violations.length === 0, violations };
  },

  // Get daily spend for a card
  getDailySpend: async (cardId: string): Promise<number> => {
    if (!supabase) return 0;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('card_transactions')
      .select('amount')
      .eq('card_id', cardId)
      .gte('date', today);
    return (data || []).reduce((sum: number, t: any) => sum + t.amount, 0);
  },

  // Get monthly spend for a card
  getMonthlySpend: async (cardId: string): Promise<number> => {
    if (!supabase) return 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data } = await supabase.from('card_transactions')
      .select('amount')
      .eq('card_id', cardId)
      .gte('date', monthStart);
    return (data || []).reduce((sum: number, t: any) => sum + t.amount, 0);
  },
};
