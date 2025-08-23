import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { aiAutomationUtils } from '../services/aiAutomationService';

interface AutomationMetrics {
  transactionsCategorized: number;
  duplicatesDetected: number;
  invoiceReminders: number;
  expensesApproved: number;
  taxOptimizations: number;
  cashFlowForecasts: number;
  notificationsSent: number;
  accuracyRate: number;
  timeSaved: number; // in hours
  moneySaved: number; // in NGN
}

interface AITask {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  progress: number;
  lastRun: string;
  nextRun?: string;
  details: string;
}

export const AIAutomationDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    transactionsCategorized: 2847,
    duplicatesDetected: 23,
    invoiceReminders: 156,
    expensesApproved: 89,
    taxOptimizations: 12,
    cashFlowForecasts: 45,
    notificationsSent: 234,
    accuracyRate: 94.3,
    timeSaved: 127.5,
    moneySaved: 450000,
  });

  const [activeTasks, setActiveTasks] = useState<AITask[]>([
    {
      id: '1',
      name: 'Transaction Categorization',
      status: 'running',
      progress: 75,
      lastRun: '2 minutes ago',
      details: 'Processing 23 new transactions from Access Bank'
    },
    {
      id: '2',
      name: 'Cash Flow Forecast',
      status: 'completed',
      progress: 100,
      lastRun: '1 hour ago',
      nextRun: 'Tomorrow 9:00 AM',
      details: '90-day forecast generated with 87% confidence'
    },
    {
      id: '3',
      name: 'Invoice Reminders',
      status: 'scheduled',
      progress: 0,
      lastRun: 'Yesterday',
      nextRun: 'In 3 hours',
      details: '12 overdue invoices pending reminder'
    },
    {
      id: '4',
      name: 'Tax Optimization Analysis',
      status: 'completed',
      progress: 100,
      lastRun: '6 hours ago',
      nextRun: 'Weekly on Monday',
      details: 'Identified ₦125,000 potential savings this quarter'
    },
  ]);

  const [realTimeActivity, setRealTimeActivity] = useState<Array<{
    id: string;
    action: string;
    timestamp: Date;
    type: 'success' | 'info' | 'warning';
  }>>([]);

  const settings = aiAutomationUtils.getAISettings();
  const formatNaira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  useEffect(() => {
    // Simulate real-time activity
    const interval = setInterval(() => {
      const activities = [
        'Categorized transaction: Airtel data purchase → Utilities',
        'Detected duplicate: NEPA bill payment',
        'Auto-approved expense: Office supplies ₦8,500',
        'Generated tax suggestion: WHT optimization',
        'Sent invoice reminder: Customer ABC Ltd',
        'Forecast updated: Cash flow projection improved',
      ];

      const newActivity = {
        id: Date.now().toString(),
        action: activities[Math.floor(Math.random() * activities.length)],
        timestamp: new Date(),
        type: ['success', 'info', 'warning'][Math.floor(Math.random() * 3)] as 'success' | 'info' | 'warning',
      };

      setRealTimeActivity(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>;
      case 'completed':
        return <div className="w-3 h-3 bg-green-400 rounded-full"></div>;
      case 'failed':
        return <div className="w-3 h-3 bg-red-400 rounded-full"></div>;
      case 'scheduled':
        return <div className="w-3 h-3 bg-blue-400 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-blue-400 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Automation Dashboard</h1>
          <p className="text-gray-400">Monitor your intelligent business automation in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">AI Active</span>
          </div>
          <button className="px-4 py-2 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-lg hover:bg-brand-cyan/30 transition-colors">
            Configure AI
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Time Saved</p>
              <p className="text-xl font-bold text-green-400">{metrics.timeSaved} hrs</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-brand-cyan/10 to-blue-500/10 border-brand-cyan/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-cyan/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Money Saved</p>
              <p className="text-xl font-bold text-brand-cyan">{formatNaira(metrics.moneySaved)}</p>
              <p className="text-xs text-gray-500">This quarter</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">AI Accuracy</p>
              <p className="text-xl font-bold text-purple-400">{metrics.accuracyRate}%</p>
              <p className="text-xs text-gray-500">Getting smarter</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Tasks Automated</p>
              <p className="text-xl font-bold text-orange-400">{metrics.transactionsCategorized}</p>
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Active AI Tasks</h3>
            <span className="text-xs bg-brand-cyan/20 text-brand-cyan px-2 py-1 rounded-full">
              {activeTasks.filter(t => t.status === 'running').length} Running
            </span>
          </div>
          
          <div className="space-y-3">
            {activeTasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 p-3 bg-dark-secondary/50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="font-medium text-white text-sm">{task.name}</span>
                </div>
                
                <div className="flex-1">
                  {task.status === 'running' && (
                    <div className="w-full bg-dark-tertiary rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-brand-cyan to-nigerian-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{task.details}</p>
                </div>
                
                <div className="text-right text-xs text-gray-500">
                  <p>Last: {task.lastRun}</p>
                  {task.nextRun && <p>Next: {task.nextRun}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Real-time Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Live Activity</h3>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            {realTimeActivity.length > 0 ? realTimeActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-gray-300">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-400 py-8">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Automation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Transaction Processing</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Auto-categorized</span>
              <span className="text-brand-cyan font-medium">{metrics.transactionsCategorized}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Duplicates caught</span>
              <span className="text-yellow-400 font-medium">{metrics.duplicatesDetected}</span>
            </div>
            <div className="w-full bg-dark-tertiary rounded-full h-2">
              <div className="bg-gradient-to-r from-brand-cyan to-nigerian-green h-2 rounded-full" style={{ width: `${metrics.accuracyRate}%` }}></div>
            </div>
            <p className="text-xs text-gray-400">Accuracy: {metrics.accuracyRate}%</p>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Payment Automation</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Reminders sent</span>
              <span className="text-blue-400 font-medium">{metrics.invoiceReminders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Expenses approved</span>
              <span className="text-green-400 font-medium">{metrics.expensesApproved}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>₦{(metrics.expensesApproved * 8500).toLocaleString()} auto-processed</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Intelligence Features</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Tax optimizations</span>
              <span className="text-purple-400 font-medium">{metrics.taxOptimizations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Forecasts generated</span>
              <span className="text-orange-400 font-medium">{metrics.cashFlowForecasts}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>₦{metrics.moneySaved.toLocaleString()} potential savings identified</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">AI Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-dark-secondary/50 hover:bg-dark-secondary rounded-lg border border-gray-700 hover:border-brand-cyan/50 transition-all text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔄</span>
              <span className="font-medium text-white">Retrain AI</span>
            </div>
            <p className="text-xs text-gray-400">Update AI models with recent data</p>
          </button>

          <button className="p-4 bg-dark-secondary/50 hover:bg-dark-secondary rounded-lg border border-gray-700 hover:border-brand-cyan/50 transition-all text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📊</span>
              <span className="font-medium text-white">Generate Report</span>
            </div>
            <p className="text-xs text-gray-400">AI automation performance report</p>
          </button>

          <button className="p-4 bg-dark-secondary/50 hover:bg-dark-secondary rounded-lg border border-gray-700 hover:border-brand-cyan/50 transition-all text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎯</span>
              <span className="font-medium text-white">Optimize Settings</span>
            </div>
            <p className="text-xs text-gray-400">AI-recommended setting adjustments</p>
          </button>

          <button className="p-4 bg-dark-secondary/50 hover:bg-dark-secondary rounded-lg border border-gray-700 hover:border-brand-cyan/50 transition-all text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔍</span>
              <span className="font-medium text-white">Audit AI Decisions</span>
            </div>
            <p className="text-xs text-gray-400">Review recent AI categorizations</p>
          </button>
        </div>
      </Card>
    </div>
  );
};