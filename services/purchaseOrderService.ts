
import type { PurchaseOrder } from '../types';

const STORAGE_KEY = 'aura_purchase_orders';

const initialPOs: PurchaseOrder[] = [
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

const loadPOs = (): PurchaseOrder[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse POs', e);
            return initialPOs;
        }
    }
    return initialPOs;
};

let mockPOs: PurchaseOrder[] = loadPOs();

const savePOs = (pos: PurchaseOrder[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
};

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
        savePOs(mockPOs);
        setTimeout(() => resolve(newPO), 300);
    });
};

export const updatePurchaseOrder = (po: PurchaseOrder): Promise<PurchaseOrder> => {
    return new Promise(resolve => {
        setTimeout(() => {
            mockPOs = mockPOs.map(p => p.id === po.id ? po : p);
            savePOs(mockPOs);
            resolve(po);
        }, 300);
    });
}
