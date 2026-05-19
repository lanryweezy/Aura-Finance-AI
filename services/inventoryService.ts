
import type { Warehouse, InventoryItem } from '../types';
import { authService } from './authService';
import { monitoringService } from './monitoringService';

const getInventoryKey = () => `aura_${authService.getTenantId()}_inventory`;
const getWarehouseKey = () => `aura_${authService.getTenantId()}_warehouses`;

const initialInventory: InventoryItem[] = [
    {
        id: 'inv_item_1', name: 'Web Dev Retainer (Monthly)', sku: 'WD-RETAIN', category: 'Services', type: 'Service',
        costPrice: 0, salePrice: 500000, quantity: 9999, valuationMethod: 'Average'
    },
    {
        id: 'inv_item_2', name: 'Social Media Management', sku: 'SMM-BASIC', category: 'Services', type: 'Service',
        costPrice: 0, salePrice: 250000, quantity: 9999, valuationMethod: 'Average'
    },
    {
        id: 'inv_item_3', name: 'Laptop - 16" Pro', sku: 'HW-LAP-PRO16', category: 'Hardware', type: 'Product',
        costPrice: 950000, salePrice: 1250000, quantity: 5, valuationMethod: 'FIFO',
        lots: [
            { id: 'lot_1', purchaseDate: '2023-11-01', quantity: 2, unitCost: 900000 },
            { id: 'lot_2', purchaseDate: '2023-12-15', quantity: 3, unitCost: 983333 }
        ]
    },
    {
        id: 'inv_item_4', name: 'Ergonomic Office Chair', sku: 'HW-CHR-ERGO', category: 'Furniture', type: 'Product',
        costPrice: 85000, salePrice: 150000, quantity: 12, valuationMethod: 'FIFO',
        lots: [
            { id: 'lot_3', purchaseDate: '2023-10-10', quantity: 12, unitCost: 85000 }
        ]
    },
];

export const inventoryService = {
    fetchWarehouses: async (): Promise<Warehouse[]> => {
        const stored = localStorage.getItem(getWarehouseKey());
        if (stored) return JSON.parse(stored);
        return [
            { id: 'wh_1', name: 'Lagos Central', location: 'Ikeja, Lagos', entityId: 'ent_main' },
            { id: 'wh_2', name: 'Abuja Distribution', location: 'Garki, Abuja', entityId: 'ent_main' }
        ];
    },

    fetchInventory: async (): Promise<InventoryItem[]> => {
        const stored = localStorage.getItem(getInventoryKey());
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                monitoringService.trackError('SERVICE', e, { message: 'Failed to parse inventory' });
                return initialInventory;
            }
        }
        return initialInventory;
    },

    saveInventory: (items: InventoryItem[]) => {
        localStorage.setItem(getInventoryKey(), JSON.stringify(items));
    },

    addInventoryItem: async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
        const current = await inventoryService.fetchInventory();
        const newItem: InventoryItem = { ...item, id: `inv_item_${Date.now()}` };
        const updated = [newItem, ...current];
        inventoryService.saveInventory(updated);
        return newItem;
    },

    updateInventoryItem: async (item: InventoryItem): Promise<InventoryItem> => {
        const current = await inventoryService.fetchInventory();
        const updated = current.map(i => i.id === item.id ? item : i);
        inventoryService.saveInventory(updated);
        return item;
    },

    updateStock: async (itemId: string, quantityChange: number): Promise<void> => {
        const current = await inventoryService.fetchInventory();
        const itemIndex = current.findIndex(i => i.id === itemId);
        if (itemIndex > -1) {
            const item = current[itemIndex];
            item.quantity += quantityChange;

            // Basic FIFO implementation for stock reduction
            if (quantityChange < 0 && item.lots && item.lots.length > 0) {
                let toRemove = Math.abs(quantityChange);
                const sortedLots = [...item.lots].sort((a, b) =>
                    item.valuationMethod === 'FIFO'
                        ? a.purchaseDate.localeCompare(b.purchaseDate)
                        : b.purchaseDate.localeCompare(a.purchaseDate)
                );

                for (const lot of sortedLots) {
                    if (toRemove <= 0) break;
                    if (lot.quantity <= toRemove) {
                        toRemove -= lot.quantity;
                        lot.quantity = 0;
                    } else {
                        lot.quantity -= toRemove;
                        toRemove = 0;
                    }
                }
                item.lots = sortedLots.filter(l => l.quantity > 0);
            } else if (quantityChange > 0) {
                // For additions, we'd typically create a new lot, but for simulation we just add to the last lot or create one
                const newLot = {
                    id: `lot_${Date.now()}`,
                    purchaseDate: new Date().toISOString().split('T')[0],
                    quantity: quantityChange,
                    unitCost: item.costPrice
                };
                item.lots = [...(item.lots || []), newLot];
            }

            inventoryService.saveInventory(current);
        }
    }
};

// Aliases for compatibility
export const fetchInventoryItems = inventoryService.fetchInventory;
export const addInventoryItem = inventoryService.addInventoryItem;
export const updateInventoryItem = inventoryService.updateInventoryItem;
export const updateStock = inventoryService.updateStock;
