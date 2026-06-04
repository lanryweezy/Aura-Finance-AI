import React, { Suspense } from 'react';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import type { PandLData } from '../../types';
import { useCurrency } from "../ui/CurrencyProvider";

const ExpenseBreakdownChart = React.lazy(() => import('./ExpenseBreakdownChart'));

interface ProfitAndLossReportProps {
    data: PandLData;
    onDrillDown: (title: string, type: 'credit' | 'debit', categories: string[]) => void;
}

const ReportRow: React.FC<{label: string, value?: number, isTotal?: boolean, isHeader?: boolean, isProfit?: boolean, className?: string, onDrillDown?: () => void, formatAmount: (v: number) => string}> =
({ label, value, isTotal, isHeader, isProfit, className, onDrillDown, formatAmount }) => (
    <tr 
        className={`${isTotal ? 'section-total' : ''} ${isHeader ? 'section-header' : 'section-item'} ${onDrillDown ? 'cursor-pointer hover:bg-dark-secondary' : ''} ${isHeader ? (className ?? '') : ''}`}
        onClick={onDrillDown}
    >
        <td className={`py-2 ${isTotal || isHeader ? 'font-bold' : 'pl-4'}`} colSpan={isHeader ? 2 : 1}>{label}</td>
        {!isHeader && (
            <td className={`text-right font-mono ${isProfit && typeof value === 'number' && value < 0 ? 'text-brand-pink' : ''} ${!isHeader ? (className ?? '') : ''}`}>
                {typeof value === 'number' && (value < 0 ? `(${formatAmount(Math.abs(value))})` : formatAmount(value))}
            </td>
        )}
    </tr>
);

export const ProfitAndLossReport: React.FC<ProfitAndLossReportProps> = ({ data, onDrillDown }) => {
    const { formatAmount } = useCurrency();
    
    const expenseChartData = React.useMemo(() => Object.entries(data.expensesByCategory)
        .map(([name, value]) => ({ name, value: Number(value) }))
        .sort((a,b) => (b.value as number) - (a.value as number)), [data.expensesByCategory]);

    return (
        <Card>
            <h2 className="text-2xl font-semibold text-white mb-4">Profit & Loss Statement</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3">
                     <table className="w-full text-white">
                        <tbody>
                            <ReportRow label="Revenue" isHeader formatAmount={formatAmount} onDrillDown={() => onDrillDown('Revenue', 'credit', ['All'])} />
                            <ReportRow label="Total Revenue" value={data.revenue} className="text-green-400" isTotal formatAmount={formatAmount} onDrillDown={() => onDrillDown('Revenue', 'credit', ['All'])} />
                            
                            <ReportRow label="Cost of Goods Sold" value={-data.cogs} className="text-red-400" formatAmount={formatAmount} onDrillDown={() => onDrillDown('COGS', 'debit', ['COGS - Raw Materials', 'COGS - Direct Labor', 'Cost of Sales'])} />
                            <ReportRow label="Gross Profit" value={data.grossProfit} isTotal formatAmount={formatAmount} />
                            
                            <ReportRow label="Operating Expenses" isHeader className="pt-6" formatAmount={formatAmount} onDrillDown={() => onDrillDown('All Expenses', 'debit', Object.keys(data.expensesByCategory))}/>
                            {Object.entries(data.expensesByCategory).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([category, amount]) => (
                                <ReportRow key={category} label={category} value={-amount} className="text-red-400" formatAmount={formatAmount} onDrillDown={() => onDrillDown(category, 'debit', [category])} />
                            ))}
                            <ReportRow label="Total Operating Expenses" value={-data.totalExpenses} isTotal formatAmount={formatAmount} />
                            
                            <ReportRow label="Net Operating Income" value={data.netOperatingIncome} isTotal isProfit className={`text-xl ${data.netOperatingIncome >= 0 ? 'text-brand-cyan' : 'text-brand-pink'}`} formatAmount={formatAmount} />

                            <ReportRow label="Net Profit" value={data.netProfit} isTotal isProfit className={`text-xl font-black ${data.netProfit >= 0 ? 'text-brand-cyan' : 'text-brand-pink'}`} formatAmount={formatAmount} />
                        </tbody>
                    </table>
                </div>
                <div className="md:col-span-2 space-y-8">
                     <div>
                        <h3 className="text-lg font-semibold text-white mb-4 text-center">Expense Breakdown</h3>
                        <Suspense fallback={<div className="h-[200px] flex items-center justify-center"><Spinner /></div>}>
                            <ExpenseBreakdownChart data={expenseChartData} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </Card>
    );
};
