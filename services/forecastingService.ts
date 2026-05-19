
import { CategorizedTransaction, Invoice, Bill, PayrollRun } from '../types';

export interface ForecastingResult {
    predictedRunwayDays: number;
    monthlyBurnRate: number;
    predictedRevenueNextMonth: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    recommendations: string[];
}

export const forecastingService = {
    calculateForecast: (
        transactions: CategorizedTransaction[],
        bills: Bill[],
        invoices: Invoice[],
        payroll: PayrollRun[]
    ): ForecastingResult => {
        // 1. Calculate Monthly Burn Rate (Average of last 3 months expenses)
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        const relevantExpenses = transactions.filter(t => t.type === 'debit' && new Date(t.date) >= threeMonthsAgo);

        // Calculate the actual number of months in the data range (min 1)
        const earliestDate = relevantExpenses.length > 0
            ? new Date(Math.min(...relevantExpenses.map(t => new Date(t.date).getTime())))
            : threeMonthsAgo;
        const monthsDiff = Math.max(1, (now.getMonth() - earliestDate.getMonth()) + (12 * (now.getFullYear() - earliestDate.getFullYear())));

        const totalExpenses = relevantExpenses.reduce((sum, t) => sum + t.amount, 0);
        const monthlyBurnRate = totalExpenses / monthsDiff || 1;

        // 2. Current Cash Balance (Simplified sum of last balances or mock)
        const currentCash = transactions.length > 0 ? (transactions[0].balance || 5000000) : 5000000;

        // 3. Predicted Runway
        const predictedRunwayDays = Math.round((currentCash / (monthlyBurnRate / 30)));

        // 4. Predicted Revenue (Average income over available period + pending invoices)
        const relevantIncome = transactions.filter(t => t.type === 'credit' && new Date(t.date) >= threeMonthsAgo);
        const totalIncome = relevantIncome.reduce((sum, t) => sum + t.amount, 0);
        const avgMonthlyIncome = totalIncome / monthsDiff;
        const pendingInvoicesTotal = invoices
            .filter(i => i.status !== 'Paid')
            .reduce((sum, i) => sum + i.total, 0);

        // Simple prediction: avg income + 70% of pending invoices
        const predictedRevenueNextMonth = avgMonthlyIncome + (pendingInvoicesTotal * 0.7);

        // 5. Risk Level & Recommendations
        let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
        const recommendations: string[] = [];

        if (predictedRunwayDays < 30) {
            riskLevel = 'High';
            recommendations.push("Critical: Cash runway is less than 30 days. Prioritize invoice collection.");
        } else if (predictedRunwayDays < 90) {
            riskLevel = 'Medium';
            recommendations.push("Warning: Runway is below 90 days. Review non-essential expenses.");
        }

        if (pendingInvoicesTotal > avgMonthlyIncome) {
            recommendations.push("High volume of pending receivables. Consider automated reminders.");
        }

        const upcomingBills = bills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + b.amount, 0);
        if (upcomingBills > currentCash) {
            riskLevel = 'High';
            recommendations.push("Upcoming bills exceed current cash balance.");
        }

        return {
            predictedRunwayDays,
            monthlyBurnRate,
            predictedRevenueNextMonth,
            riskLevel,
            recommendations
        };
    }
};
