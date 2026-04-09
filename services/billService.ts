
import type { Bill } from '../types';
import { authService } from './authService';

const today = new Date();
const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
const twoWeeksFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

const getStorageKey = () => `aura_${authService.getTenantId()}_bills`;

const initialBills: Bill[] = [
  {
    id: 'bill_1',
    vendor: 'Paystack',
    description: 'Monthly API Subscription',
    amount: 10000,
    issueDate: oneWeekAgo.toISOString(),
    dueDate: twoWeeksFromNow.toISOString(),
    status: 'Unpaid',
    whtApplies: false,
    lineItems: [{id: 'li_b1', name: 'sub', description: 'api', quantity: 1, unitPrice: 10000, total: 10000}]
  },
  {
    id: 'bill_2',
    vendor: 'Google Workspace',
    description: 'Team Business Plan',
    amount: 35000,
    issueDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
    dueDate: new Date(today.getFullYear(), today.getMonth(), 15).toISOString(),
    status: 'Unpaid', 
    whtApplies: true,
    lineItems: [{id: 'li_b2', name: 'gsuite', description: 'team', quantity: 1, unitPrice: 35000, total: 35000}]
  },
  {
    id: 'bill_3',
    vendor: 'Landlord-Office Space',
    description: 'November Office Rent',
    amount: 450000,
    issueDate: new Date(2023, 10, 1).toISOString(),
    dueDate: new Date(2023, 10, 5).toISOString(),
    status: 'Paid',
    whtApplies: false,
    lineItems: [{id: 'li_b3', name: 'rent', description: 'office', quantity: 1, unitPrice: 450000, total: 450000}]
  },
];

const loadBills = (): Bill[] => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse bills', e);
            return initialBills;
        }
    }
    return initialBills;
};

const getStatus = (dueDate: string, currentStatus: Bill['status']): Bill['status'] => {
  if (currentStatus === 'Paid') {
    return 'Paid';
  }
  if (new Date(dueDate) < new Date()) {
    return 'Overdue';
  }
  return 'Unpaid';
}


export const fetchBills = (): Promise<Bill[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
        const bills = loadBills();
        const processedBills = bills.map(bill => ({
            ...bill,
            status: getStatus(bill.dueDate, bill.status)
        })).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      resolve(processedBills);
    }, 400);
  });
};

export const addBill = (billData: Omit<Bill, 'id'|'status'|'issueDate'>): Promise<Bill> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const currentBills = loadBills();
            const newBill: Bill = {
                id: `bill_${Date.now()}`,
                status: 'Unpaid',
                issueDate: new Date().toISOString(),
                ...billData
            };
            const updatedBills = [newBill, ...currentBills];
            localStorage.setItem(getStorageKey(), JSON.stringify(updatedBills));
            resolve(newBill);
        }, 300);
    });
};

export const updateBill = (bill: Bill): Promise<Bill> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const currentBills = loadBills();
            const updatedBills = currentBills.map(b => b.id === bill.id ? bill : b);
            localStorage.setItem(getStorageKey(), JSON.stringify(updatedBills));
            resolve(bill);
        }, 300);
    });
}
