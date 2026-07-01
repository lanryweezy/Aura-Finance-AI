import { supabase } from './supabaseClient';
import { authService } from './authService';

export type UsageType = 'ai_insight' | 'ai_chat' | 'ocr_scan' | 'bank_sync' | 'invoices_sent' | 'txn_volume';

export const TIER_LIMITS: Record<string, Record<UsageType, number>> = {
  'Free': { ai_insight: 5, ai_chat: 10, ocr_scan: 3, bank_sync: 50, invoices_sent: 10, txn_volume: 50 },
  'Growth': { ai_insight: 100, ai_chat: 500, ocr_scan: 50, bank_sync: 5000, invoices_sent: 500, txn_volume: 5000 },
  'Enterprise': { ai_insight: 999999, ai_chat: 999999, ocr_scan: 999999, bank_sync: 999999, invoices_sent: 999999, txn_volume: 999999 },
};

const USAGE_KEY = 'aura_usage_counters';

function getLocalUsage(): Record<string, number> {
  const stored = localStorage.getItem(USAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveLocalUsage(usage: Record<string, number>) {
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

export const usageService = {
  getTenantUsage: async (type: UsageType): Promise<number> => {
    if (supabase) {
      const orgId = authService.getTenantId();
      const { data } = await supabase
        .from('usage_tracking')
        .select('count')
        .eq('organization_id', orgId)
        .eq('type', type)
        .single();
      return data?.count || 0;
    }
    return getLocalUsage()[type] || 0;
  },

  trackUsage: async (type: UsageType) => {
    if (supabase) {
      const orgId = authService.getTenantId();
      const { data: existing } = await supabase
        .from('usage_tracking')
        .select('id, count')
        .eq('organization_id', orgId)
        .eq('type', type)
        .single();

      if (existing) {
        await supabase
          .from('usage_tracking')
          .update({ count: existing.count + 1 })
          .eq('id', existing.id);
      } else {
        await supabase.from('usage_tracking').insert({
          organization_id: orgId,
          type,
          count: 1,
        });
      }
      return;
    }
    const usage = getLocalUsage();
    usage[type] = (usage[type] || 0) + 1;
    saveLocalUsage(usage);
  },

  isRateLimited: async (type: UsageType): Promise<boolean> => {
    const org = authService.getCurrentUser()?.org;
    const plan = org?.plan || 'Free';
    const currentUsage = await usageService.getTenantUsage(type);
    const limit = TIER_LIMITS[plan]?.[type] || 0;
    return currentUsage >= limit;
  },

  getUsageStats: async () => {
    const org = authService.getCurrentUser()?.org;
    const plan = org?.plan || 'Free';
    const limits = TIER_LIMITS[plan];
    const usage = getLocalUsage();

    return [
      { type: 'ai_chat', used: usage.ai_chat || 0, limit: limits.ai_chat },
      { type: 'ai_insight', used: usage.ai_insight || 0, limit: limits.ai_insight },
      { type: 'ocr_scan', used: usage.ocr_scan || 0, limit: limits.ocr_scan },
      { type: 'invoices_sent', used: usage.invoices_sent || 0, limit: limits.invoices_sent },
      { type: 'bank_sync', used: usage.bank_sync || 0, limit: limits.bank_sync },
      { type: 'txn_volume', used: usage.txn_volume || 0, limit: limits.txn_volume },
    ];
  },
};
