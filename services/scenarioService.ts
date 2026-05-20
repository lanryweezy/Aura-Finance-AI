
import { CategorizedTransaction, Bill, Invoice } from '../types';

export interface ScenarioImpact {
    label: string;
    description: string;
    impactType: 'Positive' | 'Negative' | 'Neutral';
    value: string;
}

export interface ScenarioResult {
    predictedRunwayDelta: number; // Days
    predictedMarginDelta: number; // Percentage
    impacts: ScenarioImpact[];
}

class ScenarioService {
    calculateImpact(
        transactions: CategorizedTransaction[],
        scenarioType: 'hiring' | 'fuel_hike' | 'market_expansion' | 'price_increase',
        params: any
    ): ScenarioResult {
        const currentBurn = transactions
            .filter(t => t.type === 'debit')
            .reduce((s, t) => s + t.amount, 0) / 3 || 1;

        const currentIncome = transactions
            .filter(t => t.type === 'credit')
            .reduce((s, t) => s + t.amount, 0) / 3 || 1;

        let predictedRunwayDelta = 0;
        let predictedMarginDelta = 0;
        const impacts: ScenarioImpact[] = [];

        switch (scenarioType) {
            case 'hiring':
                const hireCost = (params.salary || 500000) * (params.count || 1);
                const newBurn = currentBurn + hireCost;
                predictedRunwayDelta = Math.round((currentBurn / newBurn - 1) * 30); // Rough approximation
                predictedMarginDelta = -(hireCost / currentIncome) * 100;
                impacts.push({
                    label: 'Operational Overhead',
                    description: `Increased monthly payroll by ${hireCost}`,
                    impactType: 'Negative',
                    value: `-${Math.round(predictedMarginDelta)}% Margin`
                });
                break;
            case 'fuel_hike':
                const fuelSpend = transactions
                    .filter(t => t.category === 'Fuel & Diesel')
                    .reduce((s, t) => s + t.amount, 0) / 3;
                const hikeImpact = fuelSpend * (params.increasePercent / 100 || 0.2);
                predictedMarginDelta = -(hikeImpact / currentIncome) * 100;
                impacts.push({
                    label: 'Energy Costs',
                    description: 'Sensitivity to fuel price fluctuations',
                    impactType: 'Negative',
                    value: `₦${Math.round(hikeImpact)} extra cost`
                });
                break;
            case 'price_increase':
                const priceHike = currentIncome * (params.increasePercent / 100 || 0.1);
                predictedMarginDelta = (priceHike / currentIncome) * 100;
                impacts.push({
                    label: 'Revenue Lift',
                    description: 'Projected gain from price optimization',
                    impactType: 'Positive',
                    value: `+${params.increasePercent}% Top-line`
                });
                break;
        }

        return { predictedRunwayDelta, predictedMarginDelta, impacts };
    }
}

export const scenarioService = new ScenarioService();
