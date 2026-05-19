
import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { useAppStore } from '../store/useAppStore';
import { useCurrency } from './ui/CurrencyProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ConsolidatedReportsView: React.FC = () => {
    const { subsidiaries, transactions } = useAppStore();
    const { formatAmount } = useCurrency();
    const [selectedEntity, setSelectedEntity] = React.useState<string | null>(null);

    const consolidationData = useMemo(() => {
        const parentIncome = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
        const parentExpenses = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

        // Simulate subsidiary data
        return [
            { name: 'Parent (HQ)', income: parentIncome, expenses: parentExpenses },
            { name: 'Logistics South', income: parentIncome * 0.4, expenses: parentExpenses * 0.45 },
            { name: 'Manufacturing', income: parentIncome * 0.8, expenses: parentExpenses * 0.7 },
        ];
    }, [transactions]);

    const totals = useMemo(() => {
        return consolidationData.reduce((acc, curr) => {
            acc.income += curr.income;
            acc.expenses += curr.expenses;
            return acc;
        }, { income: 0, expenses: 0 });
    }, [consolidationData]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Group Consolidation</h2>
                    <p className="text-gray-400">Consolidated financial performance across {subsidiaries.length + 1} entities.</p>
                </div>
                <div className="flex gap-2 p-1 bg-dark-secondary rounded-lg border border-white/5">
                    <button className="px-4 py-2 bg-brand-cyan text-black text-xs font-bold rounded-lg shadow-lg">Group View</button>
                    <button className="px-4 py-2 text-gray-400 text-xs font-bold rounded-lg hover:text-white">Subsidiary Mapping</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-brand-cyan/20 to-transparent">
                    <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Group Total Revenue</h3>
                    <p className="text-3xl font-bold text-white">{formatAmount(totals.income)}</p>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                        +8.2% vs previous period
                    </p>
                </Card>
                <Card className="bg-gradient-to-br from-brand-pink/10 to-transparent">
                    <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Group Total Expenses</h3>
                    <p className="text-3xl font-bold text-white">{formatAmount(totals.expenses)}</p>
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                        +3.1% vs previous period
                    </p>
                </Card>
                <Card className="bg-gradient-to-br from-brand-purple/20 to-transparent">
                    <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Group Net Profit</h3>
                    <p className="text-3xl font-bold text-brand-cyan">{formatAmount(totals.income - totals.expenses)}</p>
                    <p className="text-xs text-gray-500 mt-2">Margin: {((totals.income - totals.expenses) / totals.income * 100).toFixed(1)}%</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Revenue Distribution</h3>
                        {selectedEntity && (
                            <button onClick={() => setSelectedEntity(null)} className="text-xs text-brand-cyan hover:underline">Back to Group</button>
                        )}
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={consolidationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatAmount(v, { compact: true })} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1C203F', border: '1px solid #333', borderRadius: '12px' }}
                                    formatter={(v: number) => formatAmount(v)}
                                />
                                <Bar
                                    dataKey="income"
                                    fill="#00F5D4"
                                    radius={[4, 4, 0, 0]}
                                    name="Income"
                                    onClick={(data) => setSelectedEntity(data.name)}
                                    className="cursor-pointer"
                                />
                                <Bar dataKey="expenses" fill="#F15BB5" radius={[4, 4, 0, 0]} name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-bold text-white mb-6">Entity Health Score</h3>
                    <div className="space-y-6">
                        {consolidationData.map(entity => (
                            <div key={entity.name} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-medium text-gray-300">{entity.name}</span>
                                    <span className="text-xs font-bold text-brand-cyan">Good</span>
                                </div>
                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-brand-cyan to-brand-purple h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.random() * 30 + 70}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500">
                                    <span>P&L Variance: -2.1%</span>
                                    <span>Compliance: 100%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-brand-purple/20 bg-brand-purple/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-purple rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Intercompany Eliminations</h4>
                            <p className="text-xs text-gray-400">Aura has automatically identified ₦1.2M in intercompany transactions and eliminated them for the consolidated view.</p>
                        </div>
                    </div>
                </Card>

                <Card className="border-brand-cyan/20 bg-brand-cyan/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-cyan rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Shared Economic Drivers</h4>
                            <p className="text-xs text-gray-400">Group fuel costs increased 42% last month. AI suggests consolidating logistics vendor for a potential ₦500k saving.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
