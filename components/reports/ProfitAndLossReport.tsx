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
        className={`${isTotal ? 'section-total border-t-2 border-gray-100 dark:border-gray-800' : ''} ${isHeader ? 'section-header' : 'section-item'} ${onDrillDown ? 'cursor-pointer hover:bg-aura-gray-50 dark:hover:bg-dark-secondary transition-colors' : ''} ${isHeader ? (className ?? '') : ''}`}
        onClick={onDrillDown}
    >
        <td className={`py-3 ${isTotal || isHeader ? 'font-bold text-gray-900 dark:text-white' : 'pl-6 text-gray-600 dark:text-gray-400 font-medium'}`} colSpan={isHeader ? 2 : 1}>{label}</td>
        {!isHeader && (
            <td className={`text-right font-mono font-bold ${isProfit && typeof value === 'number' && value < 0 ? 'text-brand-pink' : ''} ${!isHeader ? (className ?? '') : ''}`}>
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
        <Card className="border-gray-100 dark:border-white/5 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Profit & Loss Statement</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="md:col-span-3">
                     <table className="w-full">
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            <ReportRow label="Revenue" isHeader formatAmount={formatAmount} onDrillDown={() => onDrillDown('Revenue', 'credit', ['All'])} />
                            <ReportRow label="Total Revenue" value={data.revenue} className="text-green-600 dark:text-green-400" isTotal formatAmount={formatAmount} onDrillDown={() => onDrillDown('Revenue', 'credit', ['All'])} />
                            
                            <ReportRow label="Cost of Goods Sold" value={-data.cogs} className="text-red-600 dark:text-red-400" formatAmount={formatAmount} onDrillDown={() => onDrillDown('COGS', 'debit', ['COGS - Raw Materials', 'COGS - Direct Labor', 'Cost of Sales'])} />
                            <ReportRow label="Gross Profit" value={data.grossProfit} isTotal formatAmount={formatAmount} />
                            
                            <ReportRow label="Operating Expenses" isHeader className="pt-6" formatAmount={formatAmount} onDrillDown={() => onDrillDown('All Expenses', 'debit', Object.keys(data.expensesByCategory))}/>
                            {Object.entries(data.expensesByCategory).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([category, amount]) => (
                                <ReportRow key={category} label={category} value={-amount} className="text-red-600 dark:text-red-400" formatAmount={formatAmount} onDrillDown={() => onDrillDown(category, 'debit', [category])} />
                            ))}
                            <ReportRow label="Total Operating Expenses" value={-data.totalExpenses} isTotal formatAmount={formatAmount} />
                            
                            <ReportRow label="Net Operating Income" value={data.netOperatingIncome} isTotal isProfit className={`text-xl ${data.netOperatingIncome >= 0 ? 'text-brand-cyan' : 'text-brand-pink'}`} formatAmount={formatAmount} />

                            <ReportRow label="Net Profit" value={data.netProfit} isTotal isProfit className={`text-2xl font-black ${data.netProfit >= 0 ? 'text-brand-cyan' : 'text-brand-pink'}`} formatAmount={formatAmount} />
                        </tbody>
                    </table>
                </div>
                <div className="md:col-span-2 space-y-8">
                     <div>
                        <h3 className="text-lg font-semibold text-white mb-4 text-center">Expense Breakdown</h3>
                        <Suspense fallback={<div className="h-[200px] flex items-center justify-center"><Spinner /></div>}>
                            <ExpenseBreakdownChart data={expenseChartData} />
                        </Suspense>
                     <div className="bg-aura-gray-50 dark:bg-dark-secondary/20 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
                        <h3 className="text-lg font-bold text-aura-gray-900 dark:text-white mb-6 text-center">Expense Breakdown</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={expenseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false}>
                                     {expenseChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatAmount(value)} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={8} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Card>
    );
};
