
import type { Invoice } from '../types';
import { apiClient } from './apiClient';

export const fetchInvoices = async (): Promise<Invoice[]> => {
  try {
      return await apiClient.get('/invoices');
  } catch (err) {
      console.warn("API failed, falling back to local simulation", err);
      const stored = localStorage.getItem(`aura_invoices_local_dev`);
      try {
          return stored ? JSON.parse(stored) : [];
      } catch (parseErr) {
          console.warn("Failed to parse local storage fallback", parseErr);
          return [];
      }
  }
};

export const addInvoice = async (invoiceData: Omit<Invoice, 'id'|'status'|'issueDate'>): Promise<Invoice> => {
    return await apiClient.post('/invoices', invoiceData);
};

export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
    return await apiClient.put(`/invoices/${invoice.id}`, invoice);
}
