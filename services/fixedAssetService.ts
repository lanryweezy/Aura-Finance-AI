import type { FixedAsset } from '../types';
import { db } from './db';

const TABLE = 'fixed_assets';

export const fixedAssetService = {
  fetchAssets: async (): Promise<FixedAsset[]> => {
    return db.query<FixedAsset>(TABLE);
  },

  addAsset: async (asset: Omit<FixedAsset, 'id' | 'status'>): Promise<FixedAsset> => {
    return db.insert<FixedAsset>(TABLE, {
      name: asset.name,
      category: asset.category,
      purchase_date: asset.purchaseDate,
      purchase_cost: asset.purchaseCost,
      salvage_value: asset.salvageValue,
      useful_life_years: asset.usefulLifeYears,
      depreciation_method: asset.depreciationMethod,
      accumulated_depreciation: asset.accumulatedDepreciation,
      book_value: asset.bookValue,
      entity_id: asset.entityId,
      status: 'Active',
    });
  },

  disposeAsset: async (id: string, price: number): Promise<void> => {
    await db.update<FixedAsset>(TABLE, id, {
      status: 'Disposed',
      disposal_date: new Date().toISOString(),
      disposal_price: price,
      book_value: 0,
    });
  },
};
