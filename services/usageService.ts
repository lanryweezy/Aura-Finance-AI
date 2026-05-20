import { monitoringService } from './monitoringService';

import { authService } from './authService';
import { apiClient } from './apiClient';

export type UsageType = 'ai_insight' | 'ai_chat' | 'ocr_scan' | 'bank_sync' | 'invoices_sent' | 'txn_volume';

// Tier Limits per month (Source of truth should be backend in production)
export const TIER_LIMITS: Record<string, Record<UsageType, number>> = {
    'Free': {
        'ai_insight': 5,
        'ai_chat': 10,
        'ocr_scan': 3,
        'bank_sync': 50,
        'invoices_sent': 10,
        'txn_volume': 50
    },
    'Growth': {
        'ai_insight': 100,
        'ai_chat': 500,
        'ocr_scan': 50,
        'bank_sync': 5000,
        'invoices_sent': 500,
        'txn_volume': 5000
    },
    'Enterprise': {
        'ai_insight': 999999,
        'ai_chat': 999999,
        'ocr_scan': 999999,
        'bank_sync': 999999,
        'invoices_sent': 999999,
        'txn_volume': 999999
    }
};

export const usageService = {
    getTenantUsage: async (type: UsageType): Promise<number> => {
        try {
            const data = await apiClient.get(`/usage?type=${type}`);
            return data.count;
        } catch {
            return 0;
        }
    },

    trackUsage: async (type: UsageType) => {
        try {
            await apiClient.post('/usage/track', { type });
        } catch (e) {
            monitoringService.trackError('SERVICE', e, { message: "Failed to track usage via API" });
        }
    },

    isRateLimited: async (type: UsageType): Promise<boolean> => {
        const org = authService.getCurrentUser()?.org;
        const plan = org?.plan || 'Free';
        const currentUsage = await usageService.getTenantUsage(type);
        const limit = TIER_LIMITS[plan]?.[type] || 0;

        return currentUsage >= limit;
    },

    getUsageStats: async () => {
        try {
            return await apiClient.get('/usage/summary');
        } catch {
            // Static mock data for demo if API fails
            const org = authService.getCurrentUser()?.org;
            const plan = org?.plan || 'Free';
            const limits = TIER_LIMITS[plan];

            return [
                { type: 'ai_chat', used: 2, limit: limits.ai_chat },
                { type: 'ai_insight', used: 0, limit: limits.ai_insight },
                { type: 'ocr_scan', used: 0, limit: limits.ocr_scan },
                { type: 'invoices_sent', used: 5, limit: limits.invoices_sent },
                { type: 'bank_sync', used: 1, limit: limits.bank_sync },
                { type: 'txn_volume', used: 25, limit: limits.txn_volume }
            ];
        }
    }
};
