import { useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { auditLogService } from '../auditLogService';
import { fetchBills, addBill } from '../billService';
import { fetchInvoices, addInvoice } from '../receivablesService';
import { usageService } from '../usageService';
import type { Bill, Invoice } from '../../types';

export function useBills() {
  const { bills, setBills } = useAppStore();

  const log = useCallback(async (action: string) => {
    await auditLogService.add(action, 'User', 'Payables');
    const logs = await auditLogService.getLogs();
    useAppStore.getState().setAuditLog(logs);
  }, []);

  const handleAddBill = useCallback(async (data: Omit<Bill, 'id' | 'status' | 'issueDate'>) => {
    const newBill = await addBill(data);
    setBills(prev => [newBill, ...prev]);
    await log(`Added bill from ${newBill.vendor}`);
    return newBill;
  }, [setBills, log]);

  const handlePayBill = useCallback((billId: string) => {
    setBills(prev => prev.map(b => (b.id === billId ? { ...b, status: 'Paid' as const } : b)));
    const bill = bills.find(b => b.id === billId);
    if (bill) log(`Paid bill #${bill.id.slice(-4)} from ${bill.vendor}`);
  }, [bills, setBills, log]);

  return { bills, handleAddBill, handlePayBill };
}

export function useInvoices() {
  const { invoices, setInvoices } = useAppStore();

  const log = useCallback(async (action: string) => {
    await auditLogService.add(action, 'User', 'Receivables');
    const logs = await auditLogService.getLogs();
    useAppStore.getState().setAuditLog(logs);
  }, []);

  const handleAddInvoice = useCallback(async (data: Omit<Invoice, 'id' | 'status' | 'issueDate'>) => {
    if (await usageService.isRateLimited('invoices_sent')) throw new Error('Invoice limit reached');
    const inv = await addInvoice(data);
    setInvoices(prev => [inv, ...prev]);
    usageService.trackUsage('invoices_sent');
    await log(`Created invoice for ${inv.customer}`);
    return inv;
  }, [setInvoices, log]);

  const handleRecordPayment = useCallback((invoiceId: string) => {
    setInvoices(prev => prev.map(i => (i.id === invoiceId ? { ...i, status: 'Paid' as const } : i)));
    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) log(`Recorded payment for invoice #${inv.id.slice(-4)} from ${inv.customer}`);
  }, [invoices, setInvoices, log]);

  return { invoices, handleAddInvoice, handleRecordPayment };
}
