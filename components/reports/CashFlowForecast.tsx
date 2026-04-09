import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { useCurrency } from '../ui/CurrencyProvider';

const FORECAST_DATA = [
    { month: 'Jan', actual: 450000, forecast: 450000 },
    { month: 'Feb', actual: 520000, forecast: 520000 },
    { month: 'Mar', actual: 480000, forecast: 480000 },
    { month: 'Apr', forecast: 550000 },
    { month: 'May', forecast: 610000 },
    { month: 'Jun', forecast: 680000 },
];

export const CashFlowForecast: React.FC = () => {
    const { formatAmount } = useCurrency();
    return (
        <Card className="h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">Smart Cash Flow Forecast</h3>
                    <p className="text-sm text-gray-400">AI-predicted liquidity based on historical trends and pending invoices.</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-cyan uppercase">
                        <div className="w-2 h-2 rounded-full bg-brand-cyan"></div> Actual
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-purple uppercase">
                        <div className="w-2 h-2 rounded-full bg-brand-purple"></div> Forecast
                    </span>
                </div>
            </div>

            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={FORECAST_DATA}>
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
            </div>
        </Card>
    );
};
