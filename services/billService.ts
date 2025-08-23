
import type { Bill } from '../types';

const today = new Date();
const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
const twoWeeksFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());


let mockBills: Bill[] = [
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
    whtApplies: true, // Foreign digital service
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
    whtApplies: false, // Rent WHT is different, simplified for now
    lineItems: [{id: 'li_b3', name: 'rent', description: 'office', quantity: 1, unitPrice: 450000, total: 450000}]
  },
];

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
        const processedBills = mockBills.map(bill => ({
            ...bill,
            status: getStatus(bill.dueDate, bill.status)
        })).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      resolve(processedBills);
    }, 800);
  });
};

export const addBill = (billData: Omit<Bill, 'id'|'status'|'issueDate'>): Promise<Bill> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newBill: Bill = {
                id: `bill_${Date.now()}`,
                status: 'Unpaid',
                issueDate: new Date().toISOString(),
                ...billData
            };
            mockBills.unshift(newBill);
            resolve(newBill);
        }, 300);
    });
};
