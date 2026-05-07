import { monitoringService } from './monitoringService';

import { authService } from './authService';
import { apiClient } from './apiClient';

export type UsageType = 'ai_insight' | 'ai_chat' | 'ocr_scan' | 'bank_sync';

// Tier Limits per month (Source of truth should be backend in production)
export const TIER_LIMITS: Record<string, Record<UsageType, number>> = {
    'Free': { 'ai_insight': 5, 'ai_chat': 10, 'ocr_scan': 3, 'bank_sync': 50 },
    'Growth': { 'ai_insight': 100, 'ai_chat': 500, 'ocr_scan': 50, 'bank_sync': 5000 },
    'Enterprise': { 'ai_insight': 999999, 'ai_chat': 999999, 'ocr_scan': 999999, 'bank_sync': 999999 }
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
        } catch (e: any) {
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
            // Static default for UI during migration
            return [];
        }
    }
};
