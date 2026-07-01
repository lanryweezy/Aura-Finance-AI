import type { Bill } from '../types';
import { db } from './db';

const TABLE = 'bills';

export const fetchBills = async (): Promise<Bill[]> => {
  return db.query<Bill>(TABLE);
};

export const addBill = async (billData: Omit<Bill, 'id' | 'status' | 'issueDate'>): Promise<Bill> => {
  return db.insert<Bill>(TABLE, {
    vendor: billData.vendor,
    description: billData.description,
    amount: billData.amount,
    due_date: billData.dueDate,
    wht_applies: billData.whtApplies,
    line_items: JSON.stringify(billData.lineItems),
    project_id: billData.projectId,
    currency: billData.currency,
    exchange_rate: billData.exchangeRate,
    is_recurring: billData.isRecurring,
    recurring_schedule: billData.recurringSchedule ? JSON.stringify(billData.recurringSchedule) : null,
    entity_id: billData.entityId,
    status: 'Unpaid',
  });
};

export const updateBill = async (bill: Bill): Promise<Bill> => {
  return db.update<Bill>(TABLE, bill.id, {
    status: bill.status,
    amount: bill.amount,
    vendor: bill.vendor,
  });
};
