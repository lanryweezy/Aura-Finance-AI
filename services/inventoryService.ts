
import type { InventoryItem } from '../types';
import { authService } from './authService';

const getStorageKey = () => `aura_${authService.getTenantId()}_inventory`;

const initialInventory: InventoryItem[] = [
    { id: 'inv_item_1', name: 'Web Dev Retainer (Monthly)', sku: 'WD-RETAIN', category: 'Services', type: 'Service', costPrice: 0, salePrice: 500000, quantity: 9999 },
    { id: 'inv_item_2', name: 'Social Media Management', sku: 'SMM-BASIC', category: 'Services', type: 'Service', costPrice: 0, salePrice: 250000, quantity: 9999 },
    { id: 'inv_item_3', name: 'Laptop - 16" Pro', sku: 'HW-LAP-PRO16', category: 'Hardware', type: 'Product', costPrice: 950000, salePrice: 1250000, quantity: 5 },
    { id: 'inv_item_4', name: 'Ergonomic Office Chair', sku: 'HW-CHR-ERGO', category: 'Furniture', type: 'Product', costPrice: 85000, salePrice: 150000, quantity: 12 },
];

const loadInventory = (): InventoryItem[] => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse inventory', e);
            return initialInventory;
        }
    }
    return initialInventory;
};

export const fetchInventoryItems = (): Promise<InventoryItem[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(loadInventory()), 400);
    });
};

export const addInventoryItem = (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    return new Promise(resolve => {
        const current = loadInventory();
        const newItem: InventoryItem = { ...item, id: `inv_item_${Date.now()}` };
        const updated = [newItem, ...current];
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        setTimeout(() => resolve(newItem), 300);
    });
};

export const updateInventoryItem = (item: InventoryItem): Promise<InventoryItem> => {
     return new Promise(resolve => {
        const current = loadInventory();
        const updated = current.map(i => i.id === item.id ? item : i);
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        setTimeout(() => resolve(item), 300);
    });
};

export const updateStock = (itemId: string, quantityChange: number): void => {
    const current = loadInventory();
    const itemIndex = current.findIndex(i => i.id === itemId);
    if(itemIndex > -1) {
        current[itemIndex].quantity += quantityChange;
        localStorage.setItem(getStorageKey(), JSON.stringify(current));
    }
}
