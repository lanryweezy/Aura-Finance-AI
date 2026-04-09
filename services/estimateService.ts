
import type { Estimate } from '../types';

const STORAGE_KEY = 'aura_estimates';

const initialEstimates: Estimate[] = [
    {
        id: `est_${Date.now() - 20000}`,
        customer: 'Potential Client X',
        issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Sent',
        lineItems: [
            { id: 'li_est1_1', inventoryItemId: 'inv_item_1', name: 'Web Dev Retainer (Monthly)', description: 'Full package', quantity: 1, unitPrice: 500000, total: 500000 },
            { id: 'li_est1_2', inventoryItemId: 'inv_item_2', name: 'Social Media Management', description: 'Basic package', quantity: 1, unitPrice: 250000, total: 250000 }
        ],
        total: 750000
    }
];

const loadEstimates = (): Estimate[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse estimates', e);
            return initialEstimates;
        }
    }
    return initialEstimates;
};

let mockEstimates: Estimate[] = loadEstimates();

const saveEstimates = (estimates: Estimate[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
};

export const fetchEstimates = (): Promise<Estimate[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve([...mockEstimates]), 500);
    });
};

export const addEstimate = (estData: Omit<Estimate, 'id' | 'status' | 'issueDate'>): Promise<Estimate> => {
    return new Promise(resolve => {
        const newEst: Estimate = {
            ...estData,
            id: `est_${Date.now()}`,
            issueDate: new Date().toISOString(),
            status: 'Draft',
        };
        mockEstimates = [newEst, ...mockEstimates];
        saveEstimates(mockEstimates);
        setTimeout(() => resolve(newEst), 300);
    });
};

export const updateEstimate = (est: Estimate): Promise<Estimate> => {
    return new Promise(resolve => {
        setTimeout(() => {
            mockEstimates = mockEstimates.map(e => e.id === est.id ? est : e);
            saveEstimates(mockEstimates);
            resolve(est);
        }, 300);
    });
}
