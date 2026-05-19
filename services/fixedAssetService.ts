
import { authService } from './authService';
import type { FixedAsset } from '../types';

const getStorageKey = () => `aura_${authService.getTenantId()}_fixed_assets`;

const initialAssets: FixedAsset[] = [
    {
        id: 'fa_1',
        name: 'MacBook Pro 16" (M3 Max)',
        category: 'Electronics',
        purchaseDate: '2023-11-15',
        purchaseCost: 3500000,
        salvageValue: 500000,
        usefulLifeYears: 4,
        depreciationMethod: 'Straight Line',
        status: 'Active',
        accumulatedDepreciation: 875000,
        bookValue: 2625000,
    }
];

export const fixedAssetService = {
    fetchAssets: async (): Promise<FixedAsset[]> => {
        const stored = localStorage.getItem(getStorageKey());
        if (stored) return JSON.parse(stored);
        return initialAssets;
    },

    addAsset: async (asset: Omit<FixedAsset, 'id' | 'accumulatedDepreciation' | 'bookValue'>): Promise<FixedAsset> => {
        const assets = await fixedAssetService.fetchAssets();
        const newAsset: FixedAsset = {
            ...asset,
            id: `fa_${Date.now()}`,
            accumulatedDepreciation: 0,
            bookValue: asset.purchaseCost
        };
        const updated = [newAsset, ...assets];
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        return newAsset;
    },

    calculateDepreciation: (asset: FixedAsset, currentDate: string = new Date().toISOString()): number => {
        const purchase = new Date(asset.purchaseDate);
        const current = new Date(currentDate);
        const yearsDiff = (current.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365);

        if (yearsDiff <= 0) return 0;

        if (asset.depreciationMethod === 'Straight Line') {
            const annualDep = (asset.purchaseCost - asset.salvageValue) / asset.usefulLifeYears;
            return Math.min(annualDep * yearsDiff, asset.purchaseCost - asset.salvageValue);
        }

        return 0; // Simplified for now
    }
};
