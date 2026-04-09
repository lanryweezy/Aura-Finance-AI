
import type { Budget } from '../types';

const STORAGE_KEY = 'aura_budgets';

const initialBudgets: Budget[] = [
    { category: 'Software & Subscriptions', amount: 50000 },
    { category: 'Marketing & Advertising', amount: 100000 },
    { category: 'Travel', amount: 75000 },
];

const loadBudgets = (): Budget[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
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

let mockBudgets: Budget[] = loadBudgets();

const saveBudgetsToStore = (budgets: Budget[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
};

export const fetchBudgets = (): Promise<Budget[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve([...mockBudgets]), 300);
    });
};

export const saveBudgets = (updatedBudgets: Budget[]): Promise<Budget[]> => {
    return new Promise(resolve => {
        mockBudgets = updatedBudgets;
        saveBudgetsToStore(mockBudgets);
        setTimeout(() => resolve([...mockBudgets]), 500);
    });
};
