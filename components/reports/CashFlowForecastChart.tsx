
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../ui/CurrencyProvider';

interface CashFlowForecastChartProps {
    data: Array<{ month: string; actual?: number; forecast: number }>;
}

const CashFlowForecastChart: React.FC<CashFlowForecastChartProps> = ({ data }) => {
    const { formatAmount } = useCurrency();

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00F5D4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9B5DE5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9B5DE5" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatAmount(v, { compact: true })} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#10142C', border: '1px solid #1F2937', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(v: number) => formatAmount(v)}
                />
                <Area type="monotone" dataKey="actual" stroke="#00F5D4" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="forecast" stroke="#9B5DE5" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default CashFlowForecastChart;
