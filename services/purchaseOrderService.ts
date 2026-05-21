
import type { PurchaseOrder } from '../types';
import { apiClient } from './apiClient';

export const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    return await apiClient.get('/purchase_orders');
};

export const addPurchaseOrder = async (po: Omit<PurchaseOrder, 'id'|'status'|'issueDate'>): Promise<PurchaseOrder> => {
    return await apiClient.post('/purchase_orders', po);
};

export const updatePurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder> => {
    return await apiClient.put(`/purchase_orders/${po.id}`, po);
};
