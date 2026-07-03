import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SavingsInsightsWidget } from '../SavingsInsightsWidget';
import { CloseCheckWidget } from '../CloseCheckWidget';
import { SpendPolicyWidget } from '../SpendPolicyWidget';
import { ForecastingDashboard } from '../ForecastingDashboard';
import { AnomalyDetectionWidget } from '../AnomalyDetectionWidget';
import { SeasonalPatternsWidget } from '../SeasonalPatternsWidget';

interface WidgetConfig {
  id: string;
  name: string;
  component: React.FC;
  enabled: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'savings', name: 'Savings Insights', component: SavingsInsightsWidget, enabled: true },
  { id: 'close', name: 'Month-End Close', component: CloseCheckWidget, enabled: true },
  { id: 'policies', name: 'Spend Policies', component: SpendPolicyWidget, enabled: true },
  { id: 'forecast', name: 'Cash Flow Forecast', component: ForecastingDashboard, enabled: true },
  { id: 'anomaly', name: 'Anomaly Detection', component: AnomalyDetectionWidget, enabled: true },
  { id: 'seasonal', name: 'Seasonal Patterns', component: SeasonalPatternsWidget, enabled: true },
];

export const CustomDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('aura_dashboard_widgets');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });
  const [editing, setEditing] = useState(false);

  const toggleWidget = (id: string) => {
    setWidgets(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w);
      localStorage.setItem('aura_dashboard_widgets', JSON.stringify(updated));
      return updated;
    });
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.setItem('aura_dashboard_widgets', JSON.stringify(DEFAULT_WIDGETS));
  };

  const enabledWidgets = widgets.filter(w => w.enabled);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">Dashboard Widgets</h3>
        <button onClick={() => setEditing(!editing)} className="text-xs text-brand-cyan hover:underline">
          {editing ? 'Done' : 'Customize'}
        </button>
      </div>

      {editing && (
        <div className="bg-dark-primary rounded-xl p-4 space-y-2">
          {widgets.map(w => (
            <label key={w.id} className="flex items-center gap-3 text-sm cursor-pointer">
              <input type="checkbox" checked={w.enabled} onChange={() => toggleWidget(w.id)}
                className="w-4 h-4 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan" />
              <span className="text-gray-300">{w.name}</span>
            </label>
          ))}
          <button onClick={resetWidgets} className="text-xs text-gray-500 hover:text-white mt-2">Reset to default</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enabledWidgets.map(w => {
          const Component = w.component;
          return <Component key={w.id} />;
        })}
      </div>
    </div>
  );
};
