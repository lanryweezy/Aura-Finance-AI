
import type { Budget } from '../types';
import { api } from './api';

let mockBudgets: Budget[] = [
    { category: 'Software & Subscriptions', amount: 50000 },
    { category: 'Marketing & Advertising', amount: 100000 },
    { category: 'Travel', amount: 75000 },
];

export const fetchBudgets = async (): Promise<Budget[]> => {
    try {
        return await api.get<Budget[]>('/budgets/');
    } catch {
        return [...mockBudgets];
    }
};

export const saveBudgets = async (updatedBudgets: Budget[]): Promise<Budget[]> => {
    try {
        return await api.put<Budget[]>('/budgets/', { budgets: updatedBudgets });
    } catch {
        mockBudgets = updatedBudgets;
        return [...mockBudgets];
    }
};
