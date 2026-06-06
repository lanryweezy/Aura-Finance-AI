import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import type { Account, CategorizedTransaction, ReportPeriod } from '../../types';
import { useCurrency } from "../ui/CurrencyProvider";

interface TrialBalanceReportProps {
    accounts: Account[];
    transactions: CategorizedTransaction[];
    period: ReportPeriod;
}

export const TrialBalanceReport: React.FC<TrialBalanceReportProps> = ({ accounts, transactions, period }) => {
    const { currency, formatAmount } = useCurrency();
    
    const balances = useMemo(() => {
        const periodTransactions = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= period.start && txDate <= period.end;
        });

        const accountBalances = accounts.map(account => {
            const balance = periodTransactions.reduce((acc, t) => {
                if (t.category === account.name) {
                    if (['Asset', 'Expense'].includes(account.type)) {
                        return t.type === 'debit' ? acc + t.amount : acc - t.amount;
                    } else { // Liability, Equity, Revenue
                        return t.type === 'credit' ? acc + t.amount : acc - t.amount;
                    }
                }
                return acc;
            }, 0);
            return { name: account.name, type: account.type, balance };
        }).filter(b => b.balance !== 0);

        return accountBalances;

    }, [accounts, transactions, period]);

    const totals = useMemo(() => {
        return balances.reduce((acc, item) => {
            if (['Asset', 'Expense'].includes(item.type)) {
                 acc.debit += item.balance > 0 ? item.balance : 0;
                 acc.credit += item.balance < 0 ? -item.balance : 0;
            } else { // Liability, Equity, Revenue
                 acc.credit += item.balance > 0 ? item.balance : 0;
                 acc.debit += item.balance < 0 ? -item.balance : 0;
            }
            return acc;
        }, { debit: 0, credit: 0 });
    }, [balances]);

    return (
        <Card className="border-gray-100 dark:border-white/5 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Trial Balance</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">As at {period.end.toLocaleDateString()}</p>
             <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-aura-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Account</th>
                            <th className="p-4 text-right text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Debit ({currency})</th>
                            <th className="p-4 text-right text-xs font-black uppercase tracking-widest text-aura-gray-500 dark:text-gray-400">Credit ({currency})</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                        {balances.map(item => {
                            const isDebit = ['Asset', 'Expense'].includes(item.type);
                            const isCredit = ['Liability', 'Equity', 'Revenue'].includes(item.type);
                            return (
                                <tr key={item.name} className="hover:bg-aura-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="p-4 text-sm font-bold text-aura-gray-900 dark:text-white">{item.name}</td>
                                    <td className="p-4 text-right font-mono text-sm text-aura-gray-600 dark:text-gray-300">
                                        {(isDebit && item.balance > 0) || (isCredit && item.balance < 0) ? formatAmount(Math.abs(item.balance)) : '-'}
                                    </td>
                                    <td className="p-4 text-right font-mono text-sm text-aura-gray-600 dark:text-gray-300">
                                        {(isCredit && item.balance > 0) || (isDebit && item.balance < 0) ? formatAmount(Math.abs(item.balance)) : '-'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="trial-balance-total bg-aura-gray-100 dark:bg-dark-secondary/20">
                            <td className="p-4 font-black text-aura-gray-900 dark:text-white uppercase tracking-widest text-xs">Total</td>
                            <td className="p-4 text-right font-black font-mono text-brand-cyan text-lg">{formatAmount(totals.debit)}</td>
                            <td className="p-4 text-right font-black font-mono text-brand-cyan text-lg">{formatAmount(totals.credit)}</td>
                        </tr>
                    </tfoot>
                </table>
             </div>
        </Card>
    );
};
