
import type { FixedAsset } from '../types';
import { apiClient } from './apiClient';

export const fixedAssetService = {
    fetchAssets: async (): Promise<FixedAsset[]> => {
        return await apiClient.get('/fixed_assets');
    },

    addAsset: async (asset: Omit<FixedAsset, 'id' | 'status'>): Promise<FixedAsset> => {
        return await apiClient.post('/fixed_assets', { ...asset, status: 'Active' });
    },

    disposeAsset: async (id: string, price: number): Promise<void> => {
        const asset = await apiClient.get(`/fixed_assets/${id}`);
        if (asset) {
            await apiClient.put(`/fixed_assets/${id}`, {
                ...asset,
                status: 'Disposed',
                disposalDate: new Date().toISOString(),
                disposalPrice: price,
                bookValue: 0
            });
        }
    }
};
