
import type { Bill } from '../types';
import { apiClient } from './apiClient';

// Transitioning to API-first pattern.
//Direct localStorage access is being phased out in favor of backend persistence.

export const fetchBills = async (): Promise<Bill[]> => {
  try {
      return await apiClient.get('/bills');
  } catch (err) {
      console.warn("API failed, falling back to local simulation", err);
      // Fallback for demo/dev purposes
      const stored = localStorage.getItem(`aura_bills_local_dev`);
      return stored ? JSON.parse(stored) : [];
  }
};

export const addBill = async (billData: Omit<Bill, 'id'|'status'|'issueDate'>): Promise<Bill> => {
    return await apiClient.post('/bills', billData);
};

export const updateBill = async (bill: Bill): Promise<Bill> => {
    return await apiClient.put(`/bills/${bill.id}`, bill);
};
