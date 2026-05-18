
import { Bill, Invoice, Contact } from '../types';
import { monitoringService } from './monitoringService';

export const fraudService = {
    detectDuplicateInvoice: (invoice: Invoice, existingInvoices: Invoice[]): boolean => {
        const duplicate = existingInvoices.find(i =>
            i.id !== invoice.id &&
            i.customer === invoice.customer &&
            i.amount === invoice.amount &&
            Math.abs(new Date(i.issueDate).getTime() - new Date(invoice.issueDate).getTime()) < 24 * 60 * 60 * 1000
        );

        if (duplicate) {
            monitoringService.log('warn', 'FRAUD', `Duplicate invoice detected for ${invoice.customer}`, { invoiceId: invoice.id });
            return true;
        }
        return false;
    },

    detectDuplicatePayment: (bill: Bill, existingBills: Bill[]): boolean => {
        const duplicate = existingBills.find(b =>
            b.id !== bill.id &&
            b.vendor === bill.vendor &&
            b.amount === bill.amount &&
            b.status === 'Paid' &&
            Math.abs(new Date(b.issueDate).getTime() - new Date(bill.issueDate).getTime()) < 24 * 60 * 60 * 1000
        );

        if (duplicate) {
            monitoringService.log('warn', 'FRAUD', `Potential duplicate payment detected for ${bill.vendor}`, { billId: bill.id });
            return true;
        }
        return false;
    },

    detectVendorBankChange: (contact: Contact, oldContact?: Contact): boolean => {
        if (!oldContact) return false;

        // Mock detection of bank detail changes using metadata if available
        // or simulating a change in sensitive payment fields
        const contactAny = contact as any;
        const oldContactAny = oldContact as any;

        if (contactAny.bankAccount !== oldContactAny.bankAccount ||
            contactAny.routingNumber !== oldContactAny.routingNumber) {

            if (contactAny.bankAccount && oldContactAny.bankAccount) {
                monitoringService.log('critical', 'FRAUD', `Bank account changed for vendor: ${contact.name}`);
                return true;
            }
        }
        return false;
    },

    runHeuristics: (data: { invoices: Invoice[], bills: Bill[] }) => {
        const alerts: string[] = [];

        // Check for sudden spikes in vendor payments
        const vendorTotals: Record<string, number> = {};
        data.bills.forEach(b => {
            vendorTotals[b.vendor] = (vendorTotals[b.vendor] || 0) + b.amount;
        });

        // Mock heuristic: if any vendor exceeds 50% of total bills, flag it
        const totalOutflow = data.bills.reduce((sum, b) => sum + b.amount, 0);
        Object.entries(vendorTotals).forEach(([vendor, total]) => {
            if (total > totalOutflow * 0.5 && totalOutflow > 100000) {
                alerts.push(`High concentration of payments to vendor: ${vendor}`);
            }
        });

        return alerts;
    }
};
