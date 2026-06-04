
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../ui/CurrencyProvider';

interface ExpenseBreakdownChartProps {
    data: Array<{ name: string; value: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9B5DE5', '#F15BB5', '#4ade80', '#fb923c'];

const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({ data }) => {
    const { formatAmount } = useCurrency();

    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatAmount(value)} />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={8} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ExpenseBreakdownChart;
