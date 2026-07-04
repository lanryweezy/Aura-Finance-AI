import React from 'react';
import { SavingsInsightsWidget } from '../SavingsInsightsWidget';
import { CloseCheckWidget } from '../CloseCheckWidget';
import { SpendPolicyWidget } from '../SpendPolicyWidget';
import { ForecastingDashboard } from '../ForecastingDashboard';
import { AnomalyDetectionWidget } from '../AnomalyDetectionWidget';
import { SeasonalPatternsWidget } from '../SeasonalPatternsWidget';
import { AutonomousDashboard } from '../AutonomousDashboard';
import { MLStatusWidget } from '../MLStatusWidget';

export const WidgetsGrid: React.FC = () => (
  <div className="space-y-4">
    <MLStatusWidget />
    <AutonomousDashboard />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ForecastingDashboard />
      <AnomalyDetectionWidget />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SavingsInsightsWidget />
      <CloseCheckWidget />
      <SpendPolicyWidget />
    </div>
    <SeasonalPatternsWidget />
  </div>
);
