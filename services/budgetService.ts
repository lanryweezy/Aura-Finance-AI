
import type { Budget } from '../types';
import { authService } from './authService';

const getStorageKey = () => `aura_${authService.getTenantId()}_budgets`;

const initialBudgets: Budget[] = [
    { category: 'Software & Subscriptions', amount: 50000 },
    { category: 'Marketing & Advertising', amount: 100000 },
    { category: 'Travel', amount: 75000 },
];

const loadBudgets = (): Budget[] => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse budgets', e);
            return initialBudgets;
        }
    }
    return initialBudgets;
};

export const fetchBudgets = (): Promise<Budget[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(loadBudgets()), 300);
    });
};

export const saveBudgets = (updatedBudgets: Budget[]): Promise<Budget[]> => {
    return new Promise(resolve => {
        localStorage.setItem(getStorageKey(), JSON.stringify(updatedBudgets));
        setTimeout(() => resolve(updatedBudgets), 500);
    });
};
