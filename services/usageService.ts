
import { authService } from './authService';

export type UsageType = 'ai_insight' | 'ai_chat' | 'ocr_scan' | 'bank_sync';

interface UsageRecord {
    tenantId: string;
    type: UsageType;
    count: number;
    lastUsed: string;
}

const STORAGE_KEY = 'aura_usage_tracking';

// Tier Limits per month
export const TIER_LIMITS: Record<string, Record<UsageType, number>> = {
    'Free': {
        'ai_insight': 5,
        'ai_chat': 10,
        'ocr_scan': 3,
        'bank_sync': 50
    },
    'Growth': {
        'ai_insight': 100,
        'ai_chat': 500,
        'ocr_scan': 50,
        'bank_sync': 5000
    },
    'Enterprise': {
        'ai_insight': 999999,
        'ai_chat': 999999,
        'ocr_scan': 999999,
        'bank_sync': 999999
    }
};

export const usageService = {
    getUsage: (): UsageRecord[] => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    getTenantUsage: (type: UsageType): number => {
        const tenantId = authService.getTenantId();
        const allUsage = usageService.getUsage();
        const record = allUsage.find(r => r.tenantId === tenantId && r.type === type);
        return record ? record.count : 0;
    },

    trackUsage: (type: UsageType) => {
        const tenantId = authService.getTenantId();
        const allUsage = usageService.getUsage();
        const recordIndex = allUsage.findIndex(r => r.tenantId === tenantId && r.type === type);

        if (recordIndex > -1) {
            allUsage[recordIndex].count += 1;
            allUsage[recordIndex].lastUsed = new Date().toISOString();
        } else {
            allUsage.push({ tenantId, type, count: 1, lastUsed: new Date().toISOString() });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsage));
    },

    isRateLimited: (type: UsageType): boolean => {
        const orgStr = localStorage.getItem('aura_org');
        const plan = orgStr ? JSON.parse(orgStr).plan : 'Free';
        const currentUsage = usageService.getTenantUsage(type);
        const limit = TIER_LIMITS[plan]?.[type] || 0;

        return currentUsage >= limit;
    },

    getUsageStats: () => {
        const orgStr = localStorage.getItem('aura_org');
        const plan = orgStr ? JSON.parse(orgStr).plan : 'Free';
        const limits = TIER_LIMITS[plan];

        return Object.keys(limits).map(key => {
            const type = key as UsageType;
            return {
                type,
                used: usageService.getTenantUsage(type),
                limit: limits[type]
            };
        });
    }
};
