import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';

interface AISettings {
  // Transaction Automation
  autoCategorizationEnabled: boolean;
  autoCategorizationConfidence: number;
  autoReceiptMatching: boolean;
  smartDuplicateDetection: boolean;
  
  // Invoice & Payment Automation
  autoInvoiceReminders: boolean;
  autoPaymentReconciliation: boolean;
  smartPaymentTerms: boolean;
  autoLateFeesCalculation: boolean;
  
  // Expense Management
  autoExpenseApproval: boolean;
  expenseApprovalThreshold: number;
  smartVendorMatching: boolean;
  autoMileageTracking: boolean;
  
  // Tax & Compliance Automation
  autoVATCalculation: boolean;
  autoWHTDeduction: boolean;
  smartTaxOptimization: boolean;
  complianceAlerts: boolean;
  
  // Cash Flow & Forecasting
  cashFlowForecasting: boolean;
  forecastPeriod: number;
  smartBudgetAdjustments: boolean;
  automaticReporting: boolean;
  
  // AI Insights & Analytics
  aiInsightsFrequency: 'daily' | 'weekly' | 'monthly';
  predicitiveAnalytics: boolean;
  businessTrendAnalysis: boolean;
  competitorBenchmarking: boolean;
  
  // Notifications & Alerts
  smartNotifications: boolean;
  urgencyThreshold: 'low' | 'medium' | 'high';
  notificationChannels: string[];
  quietHours: { start: string; end: string };
  
  // Learning & Adaptation
  adaptiveLearning: boolean;
  userPreferenceLearning: boolean;
  businessPatternRecognition: boolean;
  customModelTraining: boolean;
}

const defaultSettings: AISettings = {
  autoCategorizationEnabled: true,
  autoCategorizationConfidence: 85,
  autoReceiptMatching: true,
  smartDuplicateDetection: true,
  autoInvoiceReminders: true,
  autoPaymentReconciliation: true,
  smartPaymentTerms: false,
  autoLateFeesCalculation: false,
  autoExpenseApproval: false,
  expenseApprovalThreshold: 10000,
  smartVendorMatching: true,
  autoMileageTracking: false,
  autoVATCalculation: true,
  autoWHTDeduction: true,
  smartTaxOptimization: true,
  complianceAlerts: true,
  cashFlowForecasting: true,
  forecastPeriod: 90,
  smartBudgetAdjustments: false,
  automaticReporting: true,
  aiInsightsFrequency: 'weekly',
  predicitiveAnalytics: true,
  businessTrendAnalysis: true,
  competitorBenchmarking: false,
  smartNotifications: true,
  urgencyThreshold: 'medium',
  notificationChannels: ['app', 'email'],
  quietHours: { start: '22:00', end: '07:00' },
  adaptiveLearning: true,
  userPreferenceLearning: true,
  businessPatternRecognition: true,
  customModelTraining: false,
};

export const AISettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('automation');
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('aiSettings', JSON.stringify(settings));
    setHasChanges(false);
    // Show success notification
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  useEffect(() => {
    const saved = localStorage.getItem('aiSettings');
    if (saved) {
      setSettings({ ...defaultSettings, ...JSON.parse(saved) });
    }
  }, []);

  const tabs = [
    { id: 'automation', label: 'Automation', icon: '🤖' },
    { id: 'insights', label: 'AI Insights', icon: '🧠' },
    { id: 'notifications', label: 'Smart Alerts', icon: '🔔' },
    { id: 'learning', label: 'AI Learning', icon: '📚' },
  ];

  const SettingToggle: React.FC<{
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    premium?: boolean;
  }> = ({ label, description, checked, onChange, premium = false }) => (
    <div className="flex items-start justify-between p-4 bg-dark-secondary/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-white">{label}</h4>
          {premium && (
            <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-brand-cyan to-brand-pink text-black rounded-full font-medium">
              Pro
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-gradient-to-r from-brand-cyan to-nigerian-green' : 'bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  const SettingSlider: React.FC<{
    label: string;
    description: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    suffix?: string;
    onChange: (value: number) => void;
  }> = ({ label, description, value, min, max, step = 1, suffix = '', onChange }) => (
    <div className="p-4 bg-dark-secondary/50 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-white">{label}</h4>
        <span className="text-brand-cyan font-medium">{value}{suffix}</span>
      </div>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #00F5D4 0%, #00F5D4 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );

  const SettingSelect: React.FC<{
    label: string;
    description: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }> = ({ label, description, value, options, onChange }) => (
    <div className="p-4 bg-dark-secondary/50 rounded-lg border border-gray-700">
      <h4 className="font-medium text-white mb-1">{label}</h4>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 bg-dark-tertiary border border-gray-600 rounded-lg text-white focus:border-brand-cyan focus:outline-none"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">AI & Automation Settings</h1>
          <p className="text-gray-400">Configure intelligent automation for your Nigerian business</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="px-6 py-2 bg-gradient-to-r from-brand-cyan to-nigerian-green text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* AI Status Overview */}
      <Card className="bg-gradient-to-r from-brand-cyan/10 to-nigerian-green/10 border-brand-cyan/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-brand-cyan to-nigerian-green rounded-xl flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">AI Assistant Status</h3>
            <p className="text-sm text-gray-300">
              Your AI is actively learning and optimizing your Nigerian business operations
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-brand-cyan">94%</div>
            <div className="text-xs text-gray-400">Efficiency Score</div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-secondary/50 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                : 'text-gray-400 hover:text-white hover:bg-dark-tertiary/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'automation' && (
          <>
            <div>
              <h2 className="text-xl font-bold text-white mb-4">🔄 Transaction Automation</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SettingToggle
                  label="Auto-Categorization"
                  description="Automatically categorize transactions using Nigerian business patterns"
                  checked={settings.autoCategorizationEnabled}
                  onChange={(checked) => updateSetting('autoCategorizationEnabled', checked)}
                />
                <SettingToggle
                  label="Smart Receipt Matching"
                  description="Match receipts to transactions using AI image recognition"
                  checked={settings.autoReceiptMatching}
                  onChange={(checked) => updateSetting('autoReceiptMatching', checked)}
                  premium
                />
                <SettingToggle
                  label="Duplicate Detection"
                  description="Automatically detect and flag duplicate transactions"
                  checked={settings.smartDuplicateDetection}
                  onChange={(checked) => updateSetting('smartDuplicateDetection', checked)}
                />
                <SettingSlider
                  label="Categorization Confidence"
                  description="Minimum confidence level for auto-categorization"
                  value={settings.autoCategorizationConfidence}
                  min={60}
                  max={95}
                  suffix="%"
                  onChange={(value) => updateSetting('autoCategorizationConfidence', value)}
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">💰 Payment & Invoice Automation</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SettingToggle
                  label="Auto Invoice Reminders"
                  description="Send intelligent reminders for overdue invoices"
                  checked={settings.autoInvoiceReminders}
                  onChange={(checked) => updateSetting('autoInvoiceReminders', checked)}
                />
                <SettingToggle
                  label="Payment Reconciliation"
                  description="Automatically match payments to invoices"
                  checked={settings.autoPaymentReconciliation}
                  onChange={(checked) => updateSetting('autoPaymentReconciliation', checked)}
                />
                <SettingToggle
                  label="Smart Payment Terms"
                  description="AI-suggested payment terms based on customer history"
                  checked={settings.smartPaymentTerms}
                  onChange={(checked) => updateSetting('smartPaymentTerms', checked)}
                  premium
                />
                <SettingToggle
                  label="Auto Late Fee Calculation"
                  description="Automatically calculate and apply late fees per Nigerian standards"
                  checked={settings.autoLateFeesCalculation}
                  onChange={(checked) => updateSetting('autoLateFeesCalculation', checked)}
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">📊 Expense & Tax Automation</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SettingToggle
                  label="Auto VAT Calculation"
                  description="Automatically calculate 7.5% VAT on eligible transactions"
                  checked={settings.autoVATCalculation}
                  onChange={(checked) => updateSetting('autoVATCalculation', checked)}
                />
                <SettingToggle
                  label="Auto WHT Deduction"
                  description="Calculate withholding tax based on Nigerian rates"
                  checked={settings.autoWHTDeduction}
                  onChange={(checked) => updateSetting('autoWHTDeduction', checked)}
                />
                <SettingToggle
                  label="Smart Tax Optimization"
                  description="AI suggestions for tax efficiency and compliance"
                  checked={settings.smartTaxOptimization}
                  onChange={(checked) => updateSetting('smartTaxOptimization', checked)}
                  premium
                />
                <SettingSlider
                  label="Auto-Approval Threshold"
                  description="Expenses below this amount are auto-approved"
                  value={settings.expenseApprovalThreshold}
                  min={1000}
                  max={100000}
                  step={1000}
                  suffix=" NGN"
                  onChange={(value) => updateSetting('expenseApprovalThreshold', value)}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'insights' && (
          <>
            <div>
              <h2 className="text-xl font-bold text-white mb-4">🧠 AI Insights & Analytics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SettingSelect
                  label="Insights Frequency"
                  description="How often should AI generate business insights"
                  value={settings.aiInsightsFrequency}
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' }
                  ]}
                  onChange={(value) => updateSetting('aiInsightsFrequency', value as any)}
                />
                <SettingToggle
                  label="Predictive Analytics"
                  description="Forecast business trends and cash flow patterns"
                  checked={settings.predicitiveAnalytics}
                  onChange={(checked) => updateSetting('predicitiveAnalytics', checked)}
                  premium
                />
                <SettingToggle
                  label="Business Trend Analysis"
                  description="Analyze Nigerian market trends affecting your business"
                  checked={settings.businessTrendAnalysis}
                  onChange={(checked) => updateSetting('businessTrendAnalysis', checked)}
                />
                <SettingToggle
                  label="Competitor Benchmarking"
                  description="Compare your performance against industry standards"
                  checked={settings.competitorBenchmarking}
                  onChange={(checked) => updateSetting('competitorBenchmarking', checked)}
                  premium
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">📈 Cash Flow & Forecasting</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SettingToggle
                  label="Cash Flow Forecasting"
                  description="AI-powered cash flow predictions for better planning"
                  checked={settings.cashFlowForecasting}
                  onChange={(checked) => updateSetting('cashFlowForecasting', checked)}
                />
                <SettingToggle
                  label="Automatic Reporting"
                  description="Generate and email financial reports automatically"
                  checked={settings.automaticReporting}
                  onChange={(checked) => updateSetting('automaticReporting', checked)}
                />
                <SettingSlider
                  label="Forecast Period"
                  description="How far ahead to forecast cash flow"
                  value={settings.forecastPeriod}
                  min={30}
                  max={365}
                  step={30}
                  suffix=" days"
                  onChange={(value) => updateSetting('forecastPeriod', value)}
                />
                <SettingToggle
                  label="Smart Budget Adjustments"
                  description="AI-recommended budget adjustments based on performance"
                  checked={settings.smartBudgetAdjustments}
                  onChange={(checked) => updateSetting('smartBudgetAdjustments', checked)}
                  premium
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'notifications' && (
          <>
            <div>
              <h2 className="text-xl font-bold text-white mb-4">🔔 Smart Notifications</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SettingToggle
                  label="Smart Notifications"
                  description="AI-powered notifications based on importance and urgency"
                  checked={settings.smartNotifications}
                  onChange={(checked) => updateSetting('smartNotifications', checked)}
                />
                <SettingToggle
                  label="Compliance Alerts"
                  description="Automated alerts for Nigerian tax and compliance deadlines"
                  checked={settings.complianceAlerts}
                  onChange={(checked) => updateSetting('complianceAlerts', checked)}
                />
                <SettingSelect
                  label="Urgency Threshold"
                  description="Minimum urgency level for notifications"
                  value={settings.urgencyThreshold}
                  options={[
                    { value: 'low', label: 'Low - All notifications' },
                    { value: 'medium', label: 'Medium - Important only' },
                    { value: 'high', label: 'High - Critical only' }
                  ]}
                  onChange={(value) => updateSetting('urgencyThreshold', value as any)}
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">⏰ Quiet Hours</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 bg-dark-secondary/50 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-white mb-2">Quiet Hours Start</h4>
                  <p className="text-sm text-gray-400 mb-3">No notifications will be sent after this time</p>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => updateSetting('quietHours', { ...settings.quietHours, start: e.target.value })}
                    className="w-full p-3 bg-dark-tertiary border border-gray-600 rounded-lg text-white focus:border-brand-cyan focus:outline-none"
                  />
                </div>
                <div className="p-4 bg-dark-secondary/50 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-white mb-2">Quiet Hours End</h4>
                  <p className="text-sm text-gray-400 mb-3">Notifications resume after this time</p>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => updateSetting('quietHours', { ...settings.quietHours, end: e.target.value })}
                    className="w-full p-3 bg-dark-tertiary border border-gray-600 rounded-lg text-white focus:border-brand-cyan focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'learning' && (
          <>
            <div>
              <h2 className="text-xl font-bold text-white mb-4">📚 AI Learning & Adaptation</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SettingToggle
                  label="Adaptive Learning"
                  description="AI learns from your corrections and improves over time"
                  checked={settings.adaptiveLearning}
                  onChange={(checked) => updateSetting('adaptiveLearning', checked)}
                />
                <SettingToggle
                  label="User Preference Learning"
                  description="Remember and adapt to your business preferences"
                  checked={settings.userPreferenceLearning}
                  onChange={(checked) => updateSetting('userPreferenceLearning', checked)}
                />
                <SettingToggle
                  label="Business Pattern Recognition"
                  description="Learn unique patterns specific to your Nigerian business"
                  checked={settings.businessPatternRecognition}
                  onChange={(checked) => updateSetting('businessPatternRecognition', checked)}
                />
                <SettingToggle
                  label="Custom Model Training"
                  description="Train a custom AI model on your business data"
                  checked={settings.customModelTraining}
                  onChange={(checked) => updateSetting('customModelTraining', checked)}
                  premium
                />
              </div>
            </div>

            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">AI Learning Progress</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Your AI has processed <span className="text-brand-cyan font-medium">2,847 transactions</span> and 
                    learned <span className="text-brand-cyan font-medium">156 business patterns</span> unique to your Nigerian business.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Transaction Categorization</span>
                        <span className="text-brand-cyan font-medium">94%</span>
                      </div>
                      <div className="w-full bg-dark-tertiary rounded-full h-2">
                        <div className="bg-gradient-to-r from-brand-cyan to-nigerian-green h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Nigerian Business Patterns</span>
                        <span className="text-brand-cyan font-medium">87%</span>
                      </div>
                      <div className="w-full bg-dark-tertiary rounded-full h-2">
                        <div className="bg-gradient-to-r from-brand-cyan to-nigerian-green h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Tax Compliance Accuracy</span>
                        <span className="text-brand-cyan font-medium">98%</span>
                      </div>
                      <div className="w-full bg-dark-tertiary rounded-full h-2">
                        <div className="bg-gradient-to-r from-brand-cyan to-nigerian-green h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Save Changes Banner */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-brand-cyan to-nigerian-green text-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <span className="font-medium">You have unsaved changes</span>
          <button
            onClick={saveSettings}
            className="bg-black/20 hover:bg-black/30 px-4 py-1 rounded-lg transition-colors"
          >
            Save Now
          </button>
        </div>
      )}
    </div>
  );
};