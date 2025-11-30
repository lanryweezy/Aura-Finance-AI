
import type { Budget } from '../types';

let mockBudgets: Budget[] = [
    { category: 'Software & Subscriptions', amount: 50000 },
    { category: 'Marketing & Advertising', amount: 100000 },
    { category: 'Travel', amount: 75000 },
];

export const fetchBudgets = (): Promise<Budget[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve([...mockBudgets]), 300);
    });
};

export const saveBudgets = (updatedBudgets: Budget[]): Promise<Budget[]> => {
    return new Promise(resolve => {
        mockBudgets = updatedBudgets;
        setTimeout(() => resolve([...mockBudgets]), 500);
    });
};
