
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { scenarioService, ScenarioResult } from '../services/scenarioService';
import { useAppStore } from '../store/useAppStore';
import { useCurrency } from './ui/CurrencyProvider';

export const ScenarioPlannerView: React.FC = () => {
    const { transactions } = useAppStore();
    const { formatAmount } = useCurrency();
    const [selectedScenario, setSelectedScenario] = useState<'hiring' | 'fuel_hike' | 'price_increase'>('hiring');
    const [params, setParams] = useState<any>({ salary: 250000, count: 1, increasePercent: 20 });

    const result = scenarioService.calculateImpact(transactions, selectedScenario, params);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">AI Scenario Planner</h2>
                <p className="text-gray-400">Model the impact of business decisions on your runway and profitability.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Decision Parameters</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-2 block">Decision Type</label>
                                <select
                                    value={selectedScenario}
                                    onChange={(e) => setSelectedScenario(e.target.value as any)}
                                    className="w-full bg-dark-secondary border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-cyan outline-none"
                                >
                                    <option value="hiring">New Hires</option>
                                    <option value="fuel_hike">Fuel Price Increase</option>
                                    <option value="price_increase">Optimize Pricing</option>
                                </select>
                            </div>

                            {selectedScenario === 'hiring' && (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-2 block">Monthly Salary (₦)</label>
                                        <input
                                            type="number"
                                            value={params.salary}
                                            onChange={(e) => setParams({...params, salary: Number(e.target.value)})}
                                            className="w-full bg-dark-secondary border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-cyan outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-2 block">Headcount</label>
                                        <input
                                            type="range" min="1" max="10"
                                            value={params.count}
                                            onChange={(e) => setParams({...params, count: Number(e.target.value)})}
                                            className="w-full accent-brand-cyan"
                                        />
                                        <p className="text-center text-brand-cyan font-bold mt-2">{params.count} employees</p>
                                    </div>
                                </>
                            )}

                            {selectedScenario === 'fuel_hike' && (
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Expected Price Jump (%)</label>
                                    <input
                                        type="number"
                                        value={params.increasePercent}
                                        onChange={(e) => setParams({...params, increasePercent: Number(e.target.value)})}
                                        className="w-full bg-dark-secondary border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-cyan outline-none"
                                    />
                                </div>
                            )}

                            {selectedScenario === 'price_increase' && (
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Pricing Uplift (%)</label>
                                    <input
                                        type="number"
                                        value={params.increasePercent}
                                        onChange={(e) => setParams({...params, increasePercent: Number(e.target.value)})}
                                        className="w-full bg-dark-secondary border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-cyan outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="bg-gradient-to-br from-brand-purple/20 to-transparent">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Runway Impact</h4>
                            <p className={`text-4xl font-black ${result.predictedRunwayDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {result.predictedRunwayDelta >= 0 ? '+' : ''}{result.predictedRunwayDelta} Days
                            </p>
                        </Card>
                        <Card className="bg-gradient-to-br from-brand-cyan/20 to-transparent">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Margin Delta</h4>
                            <p className={`text-4xl font-black ${result.predictedMarginDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {result.predictedMarginDelta >= 0 ? '+' : ''}{result.predictedMarginDelta.toFixed(1)}%
                            </p>
                        </Card>
                    </div>

                    <Card>
                        <h3 className="text-lg font-bold text-white mb-6">Strategic Impact Analysis</h3>
                        <div className="space-y-4">
                            {result.impacts.map((impact, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-dark-secondary rounded-2xl border border-white/5">
                                    <div className={`p-2 rounded-full ${
                                        impact.impactType === 'Positive' ? 'bg-green-500/20 text-green-400' :
                                        impact.impactType === 'Negative' ? 'bg-red-500/20 text-red-400' :
                                        'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {impact.impactType === 'Positive' ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-bold text-white">{impact.label}</p>
                                        <p className="text-xs text-gray-500">{impact.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-mono font-bold ${impact.impactType === 'Positive' ? 'text-green-400' : 'text-red-400'}`}>{impact.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="border-brand-cyan/20 bg-brand-cyan/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-cyan rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,245,212,0.4)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white italic">"Aura suggests: Your current cash reserves allow for this expansion, but consider hedging fuel costs if the hike exceeds 25%."</h4>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
