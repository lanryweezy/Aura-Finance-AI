import type { Invoice } from '../types';
import { db } from './db';

const TABLE = 'invoices';

export const fetchInvoices = async (): Promise<Invoice[]> => {
  return db.query<Invoice>(TABLE);
};

export const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'status' | 'issueDate'>): Promise<Invoice> => {
  return db.insert<Invoice>(TABLE, {
    customer: invoiceData.customer,
    description: invoiceData.description,
    amount: invoiceData.amount,
    vat: invoiceData.vat,
    total: invoiceData.total,
    due_date: invoiceData.dueDate,
    wht_applied: invoiceData.whtApplied,
    line_items: JSON.stringify(invoiceData.lineItems),
    project_id: invoiceData.projectId,
    currency: invoiceData.currency,
    exchange_rate: invoiceData.exchangeRate,
    is_recurring: invoiceData.isRecurring,
    recurring_schedule: invoiceData.recurringSchedule ? JSON.stringify(invoiceData.recurringSchedule) : null,
    entity_id: invoiceData.entityId,
    status: 'Unpaid',
  });
};

export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
  return db.update<Invoice>(TABLE, invoice.id, {
    status: invoice.status,
    amount: invoice.amount,
    total: invoice.total,
    customer: invoice.customer,
  });
};
