
import React, { useState, useEffect } from 'react';
import type { CategorizedTransaction } from '../types';
import { fraudService } from '../services/fraudService';
import { useAppStore } from '../store/useAppStore';
import { forecastingService } from '../services/forecastingService';

interface Alert {
    id: string;
    type: 'anomaly' | 'budget' | 'tax' | 'insight';
    title: string;
    description: string;
    date: string;
    severity: 'high' | 'medium' | 'low';
}

export const AIAlerts: React.FC<{ transactions: CategorizedTransaction[] }> = ({ transactions }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const { bills, invoices, payrollHistory } = useAppStore();

    useEffect(() => {
        // Simulated proactive scanning
        const newAlerts: Alert[] = [];

        // -1. Predictive Forecasting
        if (transactions.length > 0) {
            const forecast = forecastingService.calculateForecast(transactions, bills, invoices, payrollHistory);
            if (forecast.riskLevel === 'High' || forecast.riskLevel === 'Medium') {
                newAlerts.push({
                    id: 'forecast_risk',
                    type: 'insight',
                    title: 'Cashflow Risk Detected',
                    description: forecast.recommendations[0] || `Your projected runway is ${forecast.predictedRunwayDays} days.`,
                    date: new Date().toISOString(),
                    severity: forecast.riskLevel === 'High' ? 'high' : 'medium'
                });
            }
        }

        // 0. Fraud Detection Heuristics
        const fraudAlerts = fraudService.runHeuristics({ invoices, bills });
        fraudAlerts.forEach((msg, idx) => {
            newAlerts.push({
                id: `fraud_${idx}`,
                type: 'anomaly',
                title: 'Security Alert',
                description: msg,
                date: new Date().toISOString(),
                severity: 'high'
            });
        });

        // 1. Check for anomalies (unusually high expenses)
        const recentExpenses = transactions.filter(t => t.type === 'debit').slice(0, 20);
        const avgExpense = recentExpenses.reduce((sum, t) => sum + t.amount, 0) / (recentExpenses.length || 1);

        recentExpenses.forEach(t => {
            if (t.amount > avgExpense * 3) {
                newAlerts.push({
                    id: `anomaly_${t.id}`,
                    type: 'anomaly',
                    title: 'Unusual Expense Detected',
                    description: `A transaction of ${t.amount} for "${t.narration}" is significantly higher than your average spend.`,
                    date: t.date,
                    severity: 'high'
                });
            }
        });

        // 2. Check for upcoming tax deadlines (mocked)
        newAlerts.push({
            id: 'tax_deadline',
            type: 'tax',
            title: 'VAT Filing Deadline',
            description: 'Your monthly VAT filing for the previous month is due in 3 days.',
            date: new Date().toISOString(),
            severity: 'medium'
        });

        // 3. Category insight
        const softwareSpend = transactions
            .filter(t => t.category === 'Software & Subscriptions')
            .reduce((sum, t) => sum + t.amount, 0);

        if (softwareSpend > 0) {
            newAlerts.push({
                id: 'insight_software',
                type: 'insight',
                title: 'Subscription Optimization',
                description: `You've spent a total of ${softwareSpend.toLocaleString()} on software this month. AI suggests reviewing for duplicate subscriptions.`,
                date: new Date().toISOString(),
                severity: 'low'
            });
        }

        setAlerts(newAlerts.slice(0, 3));
    }, [transactions]);

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-brand-cyan rounded-full animate-ping"></div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Proactive AI Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-2xl border backdrop-blur-md flex gap-4 transition-all hover:scale-[1.02] ${
                        alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                        alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-brand-cyan/10 border-brand-cyan/30'
                    }`}>
                        <div className={`p-2 rounded-xl h-fit ${
                            alert.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-brand-cyan/20 text-brand-cyan'
                        }`}>
                            {alert.type === 'anomaly' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                            {alert.type === 'tax' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                            {alert.type === 'insight' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-aura-gray-900 dark:text-white">{alert.title}</h4>
                            <p className="text-xs text-aura-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{alert.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
