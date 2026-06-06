
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCurrency } from '../ui/CurrencyProvider';

interface DashboardChartProps {
    data: Array<{ name: string; value: number; color: string }>;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ data }) => {
    const { formatAmount } = useCurrency();

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={false} />
                <XAxis type="number" stroke="#888888" tickFormatter={(value) => formatAmount(value, { compact: true })} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#888888" width={100} axisLine={false} tickLine={false} />
                <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ backgroundColor: '#1C203F', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={(value: number) => formatAmount(value)}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DashboardChart;
