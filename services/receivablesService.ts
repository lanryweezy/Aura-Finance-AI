
import type { Invoice } from '../types';

const today = new Date();
const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
const twoWeeksFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

let mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    customer: 'Client A Inc.',
    description: 'Web Development Services',
    amount: 500000,
    vat: 37500,
    total: 537500,
    issueDate: oneWeekAgo.toISOString(),
    dueDate: twoWeeksFromNow.toISOString(),
    status: 'Unpaid',
    whtApplied: true,
    lineItems: [{id: 'li_1', name: 'Web Dev', description: ' retainer', quantity: 1, unitPrice: 500000, total: 500000}]
  },
  {
    id: 'inv_2',
    customer: 'Client B Ltd.',
    description: 'Q4 Social Media Campaign',
    amount: 750000,
    vat: 56250,
    total: 806250,
    issueDate: new Date(2023, 10, 2).toISOString(),
    dueDate: new Date(2023, 11, 2).toISOString(),
    status: 'Paid',
    whtApplied: true,
     lineItems: [{id: 'li_2', name: 'SMM', description: 'q4', quantity: 1, unitPrice: 750000, total: 750000}]
  },
  {
    id: 'inv_3',
    customer: 'Startup C',
    description: 'Initial Consultation',
    amount: 50000,
    vat: 0,
    total: 50000,
    issueDate: today.toISOString(),
    dueDate: today.toISOString(),
    status: 'Draft',
    whtApplied: false,
     lineItems: [{id: 'li_3', name: 'Consult', description: 'initial', quantity: 1, unitPrice: 50000, total: 50000}]
  },
  {
    id: 'inv_4',
    customer: 'Legacy Corp',
    description: 'System Maintenance - Oct',
    amount: 120000,
    vat: 9000,
    total: 129000,
    issueDate: new Date(2023, 9, 15).toISOString(),
    dueDate: new Date(2023, 10, 15).toISOString(),
    status: 'Overdue',
    whtApplied: false,
     lineItems: [{id: 'li_4', name: 'Maint', description: 'oct', quantity: 1, unitPrice: 120000, total: 120000}]
  },
];

const getStatus = (dueDate: string, currentStatus: Invoice['status']): Invoice['status'] => {
  if (currentStatus === 'Paid' || currentStatus === 'Draft') {
    return currentStatus;
  }
  if (new Date(dueDate) < new Date()) {
    return 'Overdue';
  }
  return 'Unpaid';
}


export const fetchInvoices = (): Promise<Invoice[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
        const processedInvoices = mockInvoices.map(invoice => ({
            ...invoice,
            status: getStatus(invoice.dueDate, invoice.status)
        })).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      resolve(processedInvoices);
    }, 800);
  });
};

export const addInvoice = (invoiceData: Omit<Invoice, 'id'|'status'|'issueDate'>): Promise<Invoice> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newInvoice: Invoice = {
                id: `inv_${Date.now()}`,
                status: 'Draft',
                issueDate: new Date().toISOString(),
                ...invoiceData,
            };
            mockInvoices.unshift(newInvoice);
            resolve(newInvoice);
        }, 300);
    });
};
