
import type { InventoryItem } from '../types';
import { api } from './api';

let mockInventory: InventoryItem[] = [
    { id: 'inv_item_1', name: 'Web Dev Retainer (Monthly)', sku: 'WD-RETAIN', category: 'Services', type: 'Service', costPrice: 0, salePrice: 500000, quantity: 9999 },
    { id: 'inv_item_2', name: 'Social Media Management', sku: 'SMM-BASIC', category: 'Services', type: 'Service', costPrice: 0, salePrice: 250000, quantity: 9999 },
    { id: 'inv_item_3', name: 'Laptop - 16" Pro', sku: 'HW-LAP-PRO16', category: 'Hardware', type: 'Product', costPrice: 950000, salePrice: 1250000, quantity: 5 },
    { id: 'inv_item_4', name: 'Ergonomic Office Chair', sku: 'HW-CHR-ERGO', category: 'Furniture', type: 'Product', costPrice: 85000, salePrice: 150000, quantity: 12 },
];

export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
    try {
        return await api.get<InventoryItem[]>('/inventory/');
    } catch {
        return [...mockInventory];
    }
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    try {
        return await api.post<InventoryItem>('/inventory/', item);
    } catch {
        const newItem: InventoryItem = { ...item, id: `inv_item_${Date.now()}` };
        mockInventory = [newItem, ...mockInventory];
        return newItem;
    }
};

export const updateInventoryItem = async (item: InventoryItem): Promise<InventoryItem> => {
     try {
        return await api.put<InventoryItem>(`/inventory/${item.id}`, item);
     } catch {
        mockInventory = mockInventory.map(i => i.id === item.id ? item : i);
        return item;
    }
};

export const updateStock = async (itemId: string, quantityChange: number): Promise<void> => {
    try {
        await api.post<InventoryItem>(`/inventory/${itemId}/stock-adjust`, { delta: quantityChange });
    } catch {
        const itemIndex = mockInventory.findIndex(i => i.id === itemId);
        if(itemIndex > -1) {
            mockInventory[itemIndex].quantity += quantityChange;
        }
    }
};
