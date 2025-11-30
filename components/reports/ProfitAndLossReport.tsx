
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Card } from '../ui/Card';
import type { PandLData } from '../../types';

interface ProfitAndLossReportProps {
    data: PandLData;
    onDrillDown: (title: string, type: 'credit' | 'debit', categories: string[]) => void;
}

const formatNaira = (amount: number, compact = false) => {
    if (compact) {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', notation: 'compact', maximumFractionDigits: 1 }).format(amount);
    }
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

const ReportRow: React.FC<{label: string, value?: number, isTotal?: boolean, isHeader?: boolean, isProfit?: boolean, className?: string, onDrillDown?: () => void}> = 
({ label, value, isTotal, isHeader, isProfit, className, onDrillDown }) => (
    <tr 
        className={`${isTotal ? 'section-total' : ''} ${isHeader ? 'section-header' : 'section-item'} ${onDrillDown ? 'cursor-pointer hover:bg-dark-secondary' : ''} ${isHeader ? (className ?? '') : ''}`}
        onClick={onDrillDown}
    >
        <td className={`py-2 ${isTotal || isHeader ? 'font-bold' : 'pl-4'}`} colSpan={isHeader ? 2 : 1}>{label}</td>
        {!isHeader && (
            <td className={`text-right font-mono ${isProfit && typeof value === 'number' && value < 0 ? 'text-brand-pink' : ''} ${!isHeader ? (className ?? '') : ''}`}>
                {typeof value === 'number' && (value < 0 ? `(${formatNaira(Math.abs(value))})` : formatNaira(value))}
            </td>
        )}
    </tr>
);

export const ProfitAndLossReport: React.FC<ProfitAndLossReportProps> = ({ data, onDrillDown }) => {
    
    const expenseChartData = Object.entries(data.expensesByCategory)
        .map(([name, value]) => ({ name, value: Number(value) }))
        .sort((a,b) => (b.value as number) - (a.value as number));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9B5DE5', '#F15BB5', '#4ade80', '#fb923c'];

    return (
        <Card>
            <h2 className="text-2xl font-semibold text-white mb-4">Profit & Loss Statement</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3">
                     <table className="w-full text-white">
                        <tbody>
                            <ReportRow label="Revenue" isHeader onDrillDown={() => onDrillDown('Revenue', 'credit', ['All'])} />
                            <ReportRow label="Total Revenue" value={data.revenue} className="text-green-400" isTotal onDrillDown={() => onDrillDown('Revenue', 'credit', ['All'])} />
                            
                            <ReportRow label="Cost of Goods Sold" value={-data.cogs} className="text-red-400" onDrillDown={() => onDrillDown('COGS', 'debit', ['COGS - Raw Materials', 'COGS - Direct Labor', 'Cost of Sales'])} />
                            <ReportRow label="Gross Profit" value={data.grossProfit} isTotal />
                            
                            <ReportRow label="Operating Expenses" isHeader className="pt-6" onDrillDown={() => onDrillDown('All Expenses', 'debit', Object.keys(data.expensesByCategory))}/>
                            {Object.entries(data.expensesByCategory).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([category, amount]) => (
                                <ReportRow key={category} label={category} value={-amount} className="text-red-400" onDrillDown={() => onDrillDown(category, 'debit', [category])} />
                            ))}
                            <ReportRow label="Total Operating Expenses" value={-data.totalExpenses} isTotal />
                            
                            <ReportRow label="Net Operating Income" value={data.netOperatingIncome} isTotal isProfit className={`text-xl ${data.netOperatingIncome >= 0 ? 'text-brand-cyan' : 'text-brand-pink'}`} />

                            <ReportRow label="Net Profit" value={data.netProfit} isTotal isProfit className={`text-xl font-black ${data.netProfit >= 0 ? 'text-brand-cyan' : 'text-brand-pink'}`} />
                        </tbody>
                    </table>
                </div>
                <div className="md:col-span-2 space-y-8">
                     <div>
                        <h3 className="text-lg font-semibold text-white mb-4 text-center">Expense Breakdown</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={expenseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false}>
                                     {expenseChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatNaira(value)} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={8} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Card>
    );
};
