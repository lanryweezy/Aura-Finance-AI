
import type { PurchaseOrder } from '../types';

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

export const fetchPurchaseOrders = (): Promise<PurchaseOrder[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve([...mockPOs]), 500);
    });
};

export const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'status' | 'issueDate'>): Promise<PurchaseOrder> => {
    return new Promise(resolve => {
        const newPO: PurchaseOrder = {
            ...poData,
            id: `po_${Date.now()}`,
            issueDate: new Date().toISOString(),
            status: 'Draft',
        };
        mockPOs = [newPO, ...mockPOs];
        setTimeout(() => resolve(newPO), 300);
    });
};
