
import type { Budget } from '../types';
import { apiClient } from './apiClient';

export const fetchBudgets = async (): Promise<Budget[]> => {
    return await apiClient.get('/budgets');
};

export const saveBudgets = async (budgets: Budget[]): Promise<void> => {
    // In our simplified simulator, we can just POST the whole array if we want,
    // but typically we'd save individual ones or have a bulk endpoint.
    // For now, let's simulate bulk save.
    await apiClient.post('/budgets/bulk', budgets);
};
