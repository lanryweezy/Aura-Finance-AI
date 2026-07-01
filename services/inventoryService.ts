import type { InventoryItem, Warehouse } from '../types';
import { db } from './db';

const TABLE = 'inventory';
const WH_TABLE = 'warehouses';

export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  return db.query<InventoryItem>(TABLE);
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  return db.insert<InventoryItem>(TABLE, {
    name: item.name,
    sku: item.sku,
    category: item.category,
    type: item.type,
    cost_price: item.costPrice,
    sale_price: item.salePrice,
    quantity: item.quantity,
    lots: JSON.stringify(item.lots || []),
    valuation_method: item.valuationMethod,
    warehouse_balances: JSON.stringify(item.warehouseBalances || {}),
    low_stock_threshold: item.lowStockThreshold,
    entity_id: item.entityId,
  });
};

export const updateInventoryItem = async (item: InventoryItem): Promise<InventoryItem> => {
  return db.update<InventoryItem>(TABLE, item.id, {
    name: item.name,
    sku: item.sku,
    category: item.category,
    type: item.type,
    cost_price: item.costPrice,
    sale_price: item.salePrice,
    quantity: item.quantity,
    lots: JSON.stringify(item.lots || []),
    valuation_method: item.valuationMethod,
    warehouse_balances: JSON.stringify(item.warehouseBalances || {}),
    low_stock_threshold: item.lowStockThreshold,
  });
};

export const updateStock = async (id: string, change: number): Promise<void> => {
  const items = await db.query<InventoryItem>(TABLE);
  const item = items.find(i => i.id === id);
  if (item) {
    await db.update<InventoryItem>(TABLE, id, { quantity: item.quantity + change });
  }
};

export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  return db.query<Warehouse>(WH_TABLE);
};
