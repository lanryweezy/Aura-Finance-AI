
import type { InventoryItem, Warehouse } from '../types';
import { apiClient } from './apiClient';

export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
    return await apiClient.get('/inventory');
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    return await apiClient.post('/inventory', item);
};

export const updateInventoryItem = async (item: InventoryItem): Promise<InventoryItem> => {
    return await apiClient.put(`/inventory/${item.id}`, item);
};

export const updateStock = async (id: string, change: number): Promise<void> => {
    const item = await apiClient.get(`/inventory/${id}`);
    if (item) {
        item.quantity += change;
        await apiClient.put(`/inventory/${id}`, item);
    }
};

export const fetchWarehouses = async (): Promise<Warehouse[]> => {
    return await apiClient.get('/warehouses');
};
