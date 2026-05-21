
import type { Bill } from '../types';
import { apiClient } from './apiClient';

export const fetchBills = async (): Promise<Bill[]> => {
  return await apiClient.get('/bills');
};

export const addBill = async (billData: Omit<Bill, 'id'|'status'|'issueDate'>): Promise<Bill> => {
    return await apiClient.post('/bills', billData);
};

export const updateBill = async (bill: Bill): Promise<Bill> => {
    return await apiClient.put(`/bills/${bill.id}`, bill);
};
