import { monitoringService } from './monitoringService';

import type { PurchaseOrder } from '../types';
import { authService } from './authService';

const getStorageKey = () => `aura_${authService.getTenantId()}_purchase_orders`;

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
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            monitoringService.trackError('SERVICE', e, { message: 'Failed to parse POs' });
            return initialPOs;
        }
    }
    return initialPOs;
};

export const fetchPurchaseOrders = (): Promise<PurchaseOrder[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(loadPOs()), 500);
    });
};

export const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'status' | 'issueDate'>): Promise<PurchaseOrder> => {
    return new Promise(resolve => {
        const current = loadPOs();
        const newPO: PurchaseOrder = {
            ...poData,
            id: `po_${Date.now()}`,
            issueDate: new Date().toISOString(),
            status: 'Draft',
        };
        const updated = [newPO, ...current];
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        setTimeout(() => resolve(newPO), 300);
    });
};

export const updatePurchaseOrder = (po: PurchaseOrder): Promise<PurchaseOrder> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const current = loadPOs();
            const updated = current.map(p => p.id === po.id ? po : p);
            localStorage.setItem(getStorageKey(), JSON.stringify(updated));
            resolve(po);
        }, 300);
    });
}
