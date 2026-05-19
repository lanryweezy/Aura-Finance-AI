
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { useCurrency } from './ui/CurrencyProvider';
import type { Bill, Invoice } from '../types';

interface RecurringTransactionsViewProps {
    invoices: Invoice[];
    bills: Bill[];
}

export const RecurringTransactionsView: React.FC<RecurringTransactionsViewProps> = ({ invoices, bills }) => {
    const { formatAmount } = useCurrency();
    const recurringInvoices = invoices.filter(i => i.isRecurring);
    const recurringBills = bills.filter(b => b.isRecurring);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recurring Transactions</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Automate your subscriptions, rent, and regular client billing.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-cyan"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
                        Recurring Invoices
                    </h3>
                    <div className="space-y-3">
                        {recurringInvoices.map(inv => (
                            <Card key={inv.id} className="p-4 flex justify-between items-center group hover:border-brand-cyan/30 transition-all">
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{inv.customer}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Every {inv.recurringSchedule?.frequency} • Next: {inv.recurringSchedule?.nextOccurrence}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-brand-cyan">{formatAmount(inv.total)}</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-black">{inv.recurringSchedule?.occurrencesCount} sent</div>
                                </div>
                            </Card>
                        ))}
                        {recurringInvoices.length === 0 && <Card className="p-8 text-center text-gray-400 border-dashed border-2">No recurring invoices set up yet.</Card>}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-pink"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 3v18"></path><path d="M3 7h18"></path><path d="M3 12h18"></path><path d="M3 17h18"></path></svg>
                        Recurring Bills
                    </h3>
                    <div className="space-y-3">
                        {recurringBills.map(bill => (
                            <Card key={bill.id} className="p-4 flex justify-between items-center group hover:border-brand-pink/30 transition-all">
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{bill.vendor}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Every {bill.recurringSchedule?.frequency} • Next: {bill.recurringSchedule?.nextOccurrence}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-brand-pink">{formatAmount(bill.amount)}</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-black">{bill.recurringSchedule?.occurrencesCount} processed</div>
                                </div>
                            </Card>
                        ))}
                        {recurringBills.length === 0 && <Card className="p-8 text-center text-gray-400 border-dashed border-2">No recurring bills set up yet.</Card>}
                    </div>
                </div>
            </div>
        </div>
    );
};
