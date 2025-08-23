
import type { PurchaseOrder } from '../types';
import { api } from './api';

let mockPOs: PurchaseOrder[] = [
    {
        id: `po_${Date.now() - 10000}`,
        vendor: 'Tech Supplies Ltd',
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expectedDeliveryDate: new Date().toISOString(),
        status: 'Sent',
        lineItems: [
            { id: 'li_po1_1', inventoryItemId: 'inv_item_3', name: 'Laptop - 16" Pro', description: 'For new developer', quantity: 2, unitPrice: 950000, total: 1900000 }
        ],
        total: 1900000
    }
];

export const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    try {
        return await api.get<PurchaseOrder[]>('/purchase-orders/');
    } catch {
        return [...mockPOs];
    }
};

export const addPurchaseOrder = async (poData: Omit<PurchaseOrder, 'id' | 'status' | 'issueDate'>): Promise<PurchaseOrder> => {
    try {
        return await api.post<PurchaseOrder>('/purchase-orders/', poData);
    } catch {
        const newPO: PurchaseOrder = {
            ...poData,
            id: `po_${Date.now()}`,
            issueDate: new Date().toISOString(),
            status: 'Draft',
        };
        mockPOs = [newPO, ...mockPOs];
        return newPO;
    }
};
