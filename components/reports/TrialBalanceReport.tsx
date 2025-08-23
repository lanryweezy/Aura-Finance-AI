
import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import type { Account, CategorizedTransaction, ReportPeriod } from '../../types';

interface TrialBalanceReportProps {
    accounts: Account[];
    transactions: CategorizedTransaction[];
    period: ReportPeriod;
}

const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const TrialBalanceReport: React.FC<TrialBalanceReportProps> = ({ accounts, transactions, period }) => {
    
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
        <Card>
            <h2 className="text-2xl font-semibold text-white mb-4">Trial Balance</h2>
            <p className="text-sm text-gray-400 mb-6">As at {period.end.toLocaleDateString()}</p>
             <table className="w-full text-white">
                <thead>
                    <tr className="border-b-2 border-gray-600">
                        <th className="p-3 text-left font-semibold">Account</th>
                        <th className="p-3 text-right font-semibold">Debit (NGN)</th>
                        <th className="p-3 text-right font-semibold">Credit (NGN)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {balances.map(item => {
                         const isDebit = ['Asset', 'Expense'].includes(item.type);
                         const isCredit = ['Liability', 'Equity', 'Revenue'].includes(item.type);
                        return (
                             <tr key={item.name}>
                                <td className="p-3">{item.name}</td>
                                <td className="p-3 text-right font-mono">
                                    {(isDebit && item.balance > 0) || (isCredit && item.balance < 0) ? formatNaira(Math.abs(item.balance)) : '-'}
                                </td>
                                <td className="p-3 text-right font-mono">
                                     {(isCredit && item.balance > 0) || (isDebit && item.balance < 0) ? formatNaira(Math.abs(item.balance)) : '-'}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
                <tfoot>
                    <tr className="trial-balance-total text-lg">
                        <td className="p-3 font-bold">Total</td>
                        <td className="p-3 text-right font-bold font-mono">{formatNaira(totals.debit)}</td>
                        <td className="p-3 text-right font-bold font-mono">{formatNaira(totals.credit)}</td>
                    </tr>
                </tfoot>
            </table>
        </Card>
    );
};
