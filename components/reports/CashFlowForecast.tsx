
import React, { Suspense } from 'react';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';

const CashFlowForecastChart = React.lazy(() => import('./CashFlowForecastChart'));

const FORECAST_DATA = [
    { month: 'Jan', actual: 450000, forecast: 450000 },
    { month: 'Feb', actual: 520000, forecast: 520000 },
    { month: 'Mar', actual: 480000, forecast: 480000 },
    { month: 'Apr', forecast: 550000 },
    { month: 'May', forecast: 610000 },
    { month: 'Jun', forecast: 680000 },
];

export const CashFlowForecast: React.FC = () => {
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
                <Suspense fallback={<div className="h-full flex items-center justify-center"><Spinner /></div>}>
                    <CashFlowForecastChart data={FORECAST_DATA} />
                </Suspense>
            </div>
        </Card>
    );
};
