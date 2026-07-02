
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie
} from 'recharts';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { Tooltip } from './ui/Tooltip';
import { ContextualHelp } from './ui/ContextualHelp';
import { getFinancialInsights } from '../services/geminiService';
import { ReceiptScannerModal } from './ui/ReceiptScannerModal';
import { AIAlerts } from './AIAlerts';
import { NLSearch } from './NLSearch';
import { SavingsInsightsWidget } from './SavingsInsightsWidget';
import { CloseCheckWidget } from './CloseCheckWidget';
import { SpendPolicyWidget } from './SpendPolicyWidget';
import { ForecastingDashboard } from './ForecastingDashboard';
import { useCurrency } from './ui/CurrencyProvider';
import { useAppStore } from '../store/useAppStore';
import type { CategorizedTransaction, FinancialInsight, Invoice, Bill, BankConnection, View } from '../types';

const DashboardChart = React.lazy(() => import('./reports/DashboardChart'));

interface DashboardProps {
  user: { name: string } | null;
  transactions: CategorizedTransaction[];
  connections: BankConnection[];
  bills: Bill[];
  invoices: Invoice[];
  onQuickAction?: (view: View) => void;
  onAddTransaction?: (transaction: Omit<CategorizedTransaction, 'id' | 'balance'>) => void;
}

const InsightCard = React.memo<{ insight: FinancialInsight }>(({ insight }) => {
    const priorityColor = {
        High: 'border-red-500 from-red-500/10 to-transparent',
        Medium: 'border-yellow-500 from-yellow-500/10 to-transparent',
        Low: 'border-blue-500 from-blue-500/10 to-transparent'
    };

    return (
        <div className={`bg-gradient-to-r ${priorityColor[insight.priority]} p-4 rounded-xl border-l-4 mb-3 last:mb-0 backdrop-blur-sm`}>
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{insight.title}</h4>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    insight.priority === 'High' ? 'border-red-500 text-red-500' : 
                    insight.priority === 'Medium' ? 'border-yellow-500 text-yellow-500' : 
                    'border-blue-500 text-blue-500'
                }`}>{insight.priority}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{insight.description}</p>
        </div>
    )
});

const QuickActionCard = React.memo<{
    title: string; 
    icon: React.ReactNode; 
    color: string;
    onClick: () => void 
}>(({ title, icon, color, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-dark-tertiary/40 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-2xl hover:bg-aura-gray-50 dark:hover:bg-white/5 hover:border-brand-cyan/30 hover:-translate-y-1 transition-all duration-300 group shadow-xl shadow-aura-gray-200/50 dark:shadow-none">
        <div className={`p-3 rounded-full bg-opacity-20 mb-3 ${color} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        <span className="text-xs font-semibold text-aura-gray-600 dark:text-gray-300 group-hover:text-brand-cyan dark:group-hover:text-white">{title}</span>
    </button>
));

const OnboardingWidget = React.memo<{ connections: BankConnection[], invoices: Invoice[] }>(({ connections, invoices }) => {
    const steps = [
        { id: 1, label: 'Create Account', completed: true },
        { id: 2, label: 'Link Bank Account', completed: connections.length > 0 },
        { id: 3, label: 'Send First Invoice', completed: invoices.some(i => i.status !== 'Draft') },
        { id: 4, label: 'Complete Profile', completed: false }, // Mocked
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;

    if (progress === 100) return null;

    return (
        <div className="bg-gradient-to-r from-brand-purple/10 to-brand-cyan/5 dark:from-brand-purple/20 dark:to-brand-cyan/10 rounded-2xl p-6 border border-brand-purple/10 dark:border-white/10 mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Get Started with Aura</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Complete these steps to fully automate your finances.</p>
                    </div>
                    <span className="text-2xl font-bold text-brand-cyan">{Math.round(progress)}%</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-purple to-brand-cyan h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {steps.map((step, idx) => (
                        <div key={step.id} className={`flex items-center gap-3 p-3 rounded-xl border ${step.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-white/50 dark:bg-dark-secondary/50 border-gray-200 dark:border-gray-700'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-green-500 text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                {step.completed ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <span className="text-xs font-bold">{idx + 1}</span>}
                            </div>
                            <span className={`text-xs font-medium ${step.completed ? 'text-green-600 dark:text-green-300' : 'text-aura-gray-600 dark:text-gray-300'}`}>{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

const RecentActivity = React.memo<{ transactions: CategorizedTransaction[], bills: Bill[], invoices: Invoice[] }>(({ transactions, bills, invoices }) => {
    const { formatAmount } = useCurrency();

    const combinedActivity = useMemo(() => {
        const transactionActivity = transactions.map(t => ({
            id: t.id,
            type: 'transaction',
            date: new Date(t.date),
            description: t.narration,
            amount: t.amount,
            isCredit: t.type === 'credit'
        }));
        const billActivity = bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue').map(b => ({
            id: b.id,
            type: 'bill',
            date: new Date(b.issueDate),
            description: `Bill from ${b.vendor}`,
            amount: b.amount,
            isCredit: false
        }));
        const invoiceActivity = invoices.filter(i => i.status !== 'Paid').map(i => ({
            id: i.id,
            type: 'invoice',
            date: new Date(i.issueDate),
            description: `Invoice to ${i.customer}`,
            amount: i.total,
            isCredit: true
        }));

        return [...transactionActivity, ...billActivity, ...invoiceActivity]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 6);
    }, [transactions, bills, invoices]);

    const iconMap: { [key: string]: React.ReactNode } = {
        transaction: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M17 8l-5 5-5-5" /><path d="M7 16l5-5 5 5" /></svg>,
        bill: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 17a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2Z"/><path d="M12 4v7"/><path d="m15 8-3-3-3 3"/></svg>,
        invoice: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/><path d="M12 11v7"/><path d="m15 15-3 3-3-3"/></svg>,
    };

    const colorMap: { [key: string]: string } = {
        transaction: 'bg-gray-500/20 text-gray-300',
        bill: 'bg-red-500/20 text-red-400',
        invoice: 'bg-green-500/20 text-green-400',
    }

    return (
        <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                <button className="text-xs text-brand-cyan hover:underline">View All</button>
            </div>
            <div className="space-y-4">
                {combinedActivity.length > 0 ? combinedActivity.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-aura-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/5">
                        <div className={`p-2.5 rounded-full ${colorMap[item.type]}`}>
                            {iconMap[item.type]}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-aura-gray-900 dark:text-white font-medium truncate text-sm" title={item.description}>{item.description}</p>
                            <p className="text-xs text-gray-500">{item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                        </div>
                        <div className={`font-mono text-sm font-semibold ${item.isCredit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {item.isCredit ? '+' : '-'}{formatAmount(item.amount)}
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <div className="bg-gray-100 dark:bg-dark-secondary p-4 rounded-full mb-3">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </div>
                        <p className="text-gray-400">No recent activity.</p>
                    </div>
                )}
            </div>
        </Card>
    )
});

const TaxLiabilityEstimator = React.memo<{ transactions: CategorizedTransaction[], invoices: Invoice[] }>(({ transactions, invoices }) => {
    const { formatAmount } = useCurrency();

    const taxCalculations = useMemo(() => {
        const summary = transactions.reduce((acc, t) => {
            if (t.type === 'credit') acc.income += t.amount;
            else acc.expenses += t.amount;
            return acc;
        }, { income: 0, expenses: 0 });

        const daysInYear = 365;
        const firstTxDate = transactions.length > 0 ? new Date(transactions[transactions.length - 1].date) : new Date();
        const lastTxDate = transactions.length > 0 ? new Date(transactions[0].date) : new Date();
        const daysOfData = Math.max(1, (lastTxDate.getTime() - firstTxDate.getTime()) / (1000 * 3600 * 24));
        const annualizedTurnover = (summary.income / daysOfData) * daysInYear;
        const assessableProfit = summary.income - summary.expenses;

        let estimatedCIT = 0;
        let citRate = 0;
        if (annualizedTurnover > 100000000) {
            estimatedCIT = assessableProfit * 0.30;
            citRate = 30;
        } else if (annualizedTurnover > 25000000) {
            estimatedCIT = assessableProfit * 0.20;
            citRate = 20;
        }
        
        const estimatedTET = assessableProfit > 0 ? assessableProfit * 0.03 : 0;
        
        const WHT_RATE = 0.05;
        const invoiceTaxes = invoices.reduce((acc, inv) => {
            if (inv.status !== 'Draft') {
                acc.vatPayable += inv.vat;
                if (inv.whtApplied) {
                    acc.whtReceivable += inv.amount * WHT_RATE;
                }
            }
            return acc;
        }, { vatPayable: 0, whtReceivable: 0 });

        return {
            ...invoiceTaxes,
            estimatedCIT: Math.max(0, estimatedCIT),
            estimatedTET: Math.max(0, estimatedTET),
            citRate
        };
    }, [transactions, invoices]);

    return (
        <Card className={transactions.length === 0 ? "opacity-60" : ""}>
          <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h3 className="text-gray-900 dark:text-white font-bold text-lg">Tax Estimates</h3>
                <ContextualHelp
                    topic="Tax Estimates"
                    content="Provisional tax liabilities based on current turnover and expenses. Includes CIT, TET, and VAT estimates."
                />
              </div>
              <span className="text-xs bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">Provisional</span>
          </div>
          <div className="space-y-4">
             <div className="bg-aura-gray-50 dark:bg-dark-primary/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                <p className="text-xs text-orange-600 dark:text-orange-400 flex justify-between items-center mb-1">
                    <Tooltip content="Companies Income Tax estimated based on annualized turnover and assessable profit.">
                        <span>Est. CIT ({taxCalculations.citRate}%)</span>
                    </Tooltip>
                </p>
                <p className="text-xl font-bold text-aura-gray-900 dark:text-white">{formatAmount(taxCalculations.estimatedCIT)}</p>
            </div>
             <div className="bg-aura-gray-50 dark:bg-dark-primary/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                <p className="text-xs text-cyan-600 dark:text-cyan-400 flex justify-between items-center mb-1">
                    <Tooltip content="Tertiary Education Tax estimated at 3% of assessable profit.">
                        <span>Est. TET (3%)</span>
                    </Tooltip>
                </p>
                <p className="text-xl font-bold text-aura-gray-900 dark:text-white">{formatAmount(taxCalculations.estimatedTET)}</p>
            </div>
            {transactions.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-xs text-gray-500 font-medium italic">Link a bank account to see real-time tax estimates.</p>
                </div>
            ) : (
                <>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-aura-gray-50 dark:bg-dark-primary/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase">VAT Payable</p>
                        <p className="text-lg font-bold text-aura-gray-900 dark:text-white">{formatAmount(taxCalculations.vatPayable)}</p>
                    </div>
                    <div className="bg-aura-gray-50 dark:bg-dark-primary/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase">WHT Credit</p>
                        <p className="text-lg font-bold text-aura-gray-900 dark:text-white">{formatAmount(taxCalculations.whtReceivable)}</p>
                    </div>
                </div>
                </>
            )}
          </div>
        </Card>
    );
});

export const Dashboard = React.memo<DashboardProps>(({ user, transactions, connections, bills: propsBills, invoices: propsInvoices, onQuickAction, onAddTransaction }) => {
  const { formatAmount } = useCurrency();
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const { bills, invoices, payrollHistory, theme } = useAppStore();

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      if (!isMounted) return;
      setLoadingInsights(true);
      try {
          if (transactions.length > 0 || bills.length > 0 || invoices.length > 0) {
            const fetchedInsights = await getFinancialInsights(transactions, bills, invoices, payrollHistory);
            if (isMounted) setInsights(fetchedInsights);
          } else {
            if (isMounted) setInsights([]);
          }
      } finally {
          if (isMounted) setLoadingInsights(false);
      }
    }, 1000); // Debounce AI requests to prevent redundant calls during data load

    return () => {
        isMounted = false;
        clearTimeout(timer);
    };
  }, [transactions.length, bills.length, invoices.length, payrollHistory.length]);


  const { summary, trendData } = useMemo(() => {
    const summaryResult = { income: 0, expenses: 0 };
    const months: Record<string, { income: number, expenses: number, sortKey: number }> = {};

    // Single pass through transactions for both summary and trend data (O(N))
    for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i];
        const amt = t.amount;

        // Update Summary
        if (t.type === 'credit') summaryResult.income += amt;
        else summaryResult.expenses += amt;

        // Update Trend Groups
        const dateObj = new Date(t.date);
        const monthLabel = dateObj.toLocaleDateString(undefined, { month: 'short' });
        const yearLabel = dateObj.getFullYear();
        const key = `${monthLabel} ${yearLabel}`;

        if (!months[key]) {
            months[key] = { income: 0, expenses: 0, sortKey: dateObj.getTime() };
        }
        if (t.type === 'credit') months[key].income += amt;
        else months[key].expenses += amt;
    }

    const sortedTrend = Object.entries(months)
        .sort(([, a], [, b]) => a.sortKey - b.sortKey)
        .map(([name, data]) => ({ name: name.split(' ')[0], income: data.income, expenses: data.expenses }))
        .slice(-6); // Only show last 6 months for dashboard clarity

    return { summary: summaryResult, trendData: sortedTrend };
  }, [transactions]);
  
  const chartData = useMemo(() => [
    { name: 'Total Income', value: summary.income, color: '#00F5D4' },
    { name: 'Total Expenses', value: summary.expenses, color: '#F15BB5' },
  ], [summary]);

  const invoiceDistribution = useMemo(() => {
    const distribution: Record<string, number> = { Paid: 0, Unpaid: 0, Overdue: 0, Draft: 0 };
    invoices.forEach(i => {
        distribution[i.status] = (distribution[i.status] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  const COLORS = {
    Paid: '#00F5D4',
    Unpaid: '#7000FF',
    Overdue: '#F15BB5',
    Draft: '#94A3B8'
  };
  
  const lastSyncTime = useMemo(() => {
    if (connections.length === 0) return null;
    const latestSync = connections.reduce((latest, conn) => {
        const connDate = new Date(conn.lastSynced);
        return connDate > latest ? connDate : latest;
    }, new Date(0));
    return latestSync.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }, [connections]);

  const handleQuickAction = useCallback((view: View) => {
    onQuickAction?.(view);
  }, [onQuickAction]);

  const handleScanOpen = useCallback(() => setIsScannerOpen(true), []);
  const handleScanClose = useCallback(() => setIsScannerOpen(false), []);
  const handleAddTransaction = useCallback((data: Omit<CategorizedTransaction, 'id' | 'balance'>) => {
    onAddTransaction?.(data);
  }, [onAddTransaction]);

  return (
    <>
    <ReceiptScannerModal 
        isOpen={isScannerOpen} 
        onClose={handleScanClose}
        onSave={handleAddTransaction}
    />

    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div id="dashboard-welcome">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name || 'Tunde'}. Here's your financial overview.</p>
          </div>
          {lastSyncTime && (
            <div className="flex items-center gap-2 text-sm text-aura-gray-600 dark:text-gray-400 bg-white dark:bg-dark-tertiary/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Synced: {lastSyncTime}</span>
            </div>
          )}
      </div>

      <OnboardingWidget connections={connections} invoices={invoices} />

      <AIAlerts />

      <NLSearch />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SavingsInsightsWidget />
        <CloseCheckWidget />
        <SpendPolicyWidget />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ForecastingDashboard />
      </div>

      {/* Quick Actions Bar */}
      <div id="quick-actions-bar" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard 
            title="Scan Receipt" 
            color="bg-brand-cyan text-brand-cyan" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><line x1="21" y1="5" x2="10" y2="5"/><line x1="21" y1="2" x2="21" y2="8"/><line x1="24" y1="5" x2="18" y2="5"/></svg>}
            onClick={handleScanOpen}
        />
        <QuickActionCard 
            title="Create Invoice" 
            color="bg-brand-purple text-brand-purple" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>}
            onClick={() => handleQuickAction('receivables')}
        />
        <QuickActionCard 
            title="Record Bill" 
            color="bg-brand-pink text-brand-pink" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>}
            onClick={() => handleQuickAction('payables')}
        />
        <QuickActionCard 
            title="Add Employee" 
            color="bg-blue-400 text-blue-400" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>}
            onClick={() => handleQuickAction('payroll')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aura-gray-300 dark:text-white/20"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <Tooltip content="Sum of all credit transactions in the current period.">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest">Total Income</h3>
          </Tooltip>
          <p className="text-3xl font-black text-aura-gray-900 dark:text-white mt-2">{formatAmount(summary.income)}</p>
          <div className="mt-4 flex items-center text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-tighter bg-green-500/10 w-fit px-2.5 py-1 rounded-lg border border-green-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
             +12.5% vs last month
          </div>
        </Card>
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aura-gray-300 dark:text-white/20"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
          </div>
          <Tooltip content="Sum of all debit transactions in the current period.">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest">Total Expenses</h3>
          </Tooltip>
          <p className="text-3xl font-black text-aura-gray-900 dark:text-white mt-2">{formatAmount(summary.expenses)}</p>
          <div className="mt-4 flex items-center text-[10px] text-red-600 dark:text-red-400 font-black uppercase tracking-tighter bg-red-500/10 w-fit px-2.5 py-1 rounded-lg border border-red-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
             +5.2% vs last month
          </div>
        </Card>
        <Card className="relative overflow-hidden group">
          <Tooltip content="Net difference between your Income and Expenses.">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest">Net Flow</h3>
          </Tooltip>
          <p className={`text-3xl font-black mt-2 ${summary.income - summary.expenses >= 0 ? 'text-brand-cyan' : 'text-red-600 dark:text-red-400'}`}>
            {formatAmount(summary.income - summary.expenses)}
          </p>
          <div className="mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
             Cash availability metric
          </div>
        </Card>
         <TaxLiabilityEstimator transactions={transactions} invoices={invoices} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Trends</h3>
                <p className="text-xs text-gray-500">Monthly income vs expenses performance</p>
            </div>
            <select className="bg-white dark:bg-dark-primary/50 border border-gray-200 dark:border-gray-700 text-xs rounded-lg px-2 py-1 text-aura-gray-600 dark:text-gray-300 outline-none focus:ring-1 focus:ring-brand-cyan transition-all">
                <option>Last 6 Months</option>
                <option>Last Year</option>
            </select>
          </div>
          {transactions.length > 0 ? (
               <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00F5D4" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F15BB5" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#F15BB5" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#ffffff1a" : "#0000000a"} vertical={false} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#888888" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => formatAmount(v, { compact: true })} />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1C203F' : '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Area type="monotone" dataKey="income" stroke="#00F5D4" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expenses" stroke="#F15BB5" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-[300px]">
                <p className="text-gray-400">No transaction data available.</p>
                <p className="text-gray-500 text-sm">Link a bank account to see your cash flow.</p>
            </div>
          )}
        </Card>
        <Card id="ai-advisor-panel" className="lg:col-span-2 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-gradient-to-br from-brand-cyan to-brand-purple rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                 </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Advisor</h3>
            </div>
            <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
                {loadingInsights ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Spinner />
                        <p className="mt-2 text-sm text-gray-400 animate-pulse">Analyzing financials...</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {insights.length > 0 ? insights.map((insight, index) => (
                            <InsightCard key={index} insight={insight} />
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <p className="text-gray-400">No insights to show.</p>
                                <p className="text-gray-500 text-sm">Link a bank account and get AI-powered advice.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity transactions={transactions} bills={bills} invoices={invoices} />

        <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Invoice Status</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={invoiceDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {invoiceDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
                {invoiceDistribution.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}></div>
                        <span className="text-xs text-gray-500">{item.name}: {item.value}</span>
                    </div>
                ))}
            </div>
        </Card>

        <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Cash Outflow</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.filter(d => d.name === 'Total Expenses')}>
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#F15BB5" radius={[10, 10, 10, 10]} barSize={60} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4 font-medium italic">Highest spending in "Operating Expenses"</p>
        </Card>
      </div>
    </div>
    </>
  );
});
