
import type { InventoryItem } from '../types';

let mockInventory: InventoryItem[] = [
    { id: 'inv_item_1', name: 'Web Dev Retainer (Monthly)', sku: 'WD-RETAIN', category: 'Services', type: 'Service', costPrice: 0, salePrice: 500000, quantity: 9999 },
    { id: 'inv_item_2', name: 'Social Media Management', sku: 'SMM-BASIC', category: 'Services', type: 'Service', costPrice: 0, salePrice: 250000, quantity: 9999 },
    { id: 'inv_item_3', name: 'Laptop - 16" Pro', sku: 'HW-LAP-PRO16', category: 'Hardware', type: 'Product', costPrice: 950000, salePrice: 1250000, quantity: 5 },
    { id: 'inv_item_4', name: 'Ergonomic Office Chair', sku: 'HW-CHR-ERGO', category: 'Furniture', type: 'Product', costPrice: 85000, salePrice: 150000, quantity: 12 },
];

export const fetchInventoryItems = (): Promise<InventoryItem[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve([...mockInventory]), 400);
    });
};

export const addInventoryItem = (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    return new Promise(resolve => {
        const newItem: InventoryItem = { ...item, id: `inv_item_${Date.now()}` };
        mockInventory = [newItem, ...mockInventory];
        setTimeout(() => resolve(newItem), 300);
    });
};

export const updateInventoryItem = (item: InventoryItem): Promise<InventoryItem> => {
     return new Promise(resolve => {
        mockInventory = mockInventory.map(i => i.id === item.id ? item : i);
        setTimeout(() => resolve(item), 300);
    });
};

export const updateStock = (itemId: string, quantityChange: number): void => {
    const itemIndex = mockInventory.findIndex(i => i.id === itemId);
    if(itemIndex > -1) {
        mockInventory[itemIndex].quantity += quantityChange;
    }
}
