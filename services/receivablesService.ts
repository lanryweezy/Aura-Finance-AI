
import type { Invoice } from '../types';
import { apiClient } from './apiClient';

export const fetchInvoices = async (): Promise<Invoice[]> => {
  return await apiClient.get('/invoices');
};

export const addInvoice = async (invoiceData: Omit<Invoice, 'id'|'status'|'issueDate'>): Promise<Invoice> => {
    return await apiClient.post('/invoices', invoiceData);
};

export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
    return await apiClient.put(`/invoices/${invoice.id}`, invoice);
}
