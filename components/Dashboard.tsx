
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { getFinancialInsights } from '../services/geminiService';
import { NIGERIAN_TAX_RATES, COMPLIANCE_DEADLINES } from '../constants';
import type { CategorizedTransaction, FinancialInsight, Invoice, Bill, BankConnection } from '../types';

interface DashboardProps {
  transactions: CategorizedTransaction[];
  connections: BankConnection[];
  bills: Bill[];
  invoices: Invoice[];
}

const InsightCard: React.FC<{ insight: FinancialInsight }> = ({ insight }) => {
    const priorityConfig = {
        High: { color: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
        Medium: { color: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
        Low: { color: 'border-brand-cyan', bg: 'bg-brand-cyan/10', text: 'text-brand-cyan' }
    };

    const config = priorityConfig[insight.priority];

    return (
        <div className={`${config.bg} p-4 rounded-xl border-l-4 ${config.color} transition-all duration-200 hover:shadow-lg hover:scale-105`}>
            <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full ${config.color.replace('border-', 'bg-')} mt-2 flex-shrink-0`}></div>
                <div className="flex-1">
                    <h4 className="font-bold text-white text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{insight.description}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${config.bg} ${config.text}`}>
                        {insight.priority} Priority
                    </span>
                </div>
            </div>
        </div>
    );
};

const ComplianceWidget: React.FC = () => {
    const formatNaira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    
    const getNextDeadline = () => {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        
        // Calculate next VAT/WHT deadline (21st of following month)
        let nextDeadline = new Date(today.getFullYear(), currentMonth + 1, 21);
        if (currentDay > 21) {
            nextDeadline = new Date(today.getFullYear(), currentMonth + 2, 21);
        }
        
        const daysUntil = Math.ceil((nextDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { date: nextDeadline, daysUntil };
    };

    const { date, daysUntil } = getNextDeadline();
    const isUrgent = daysUntil <= 7;

    return (
        <Card className="bg-gradient-to-br from-nigerian-green/20 to-brand-cyan/20 border-nigerian-green/30">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-nigerian-green/20 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-nigerian-green">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Tax Compliance</h3>
            </div>
            
            <div className={`p-3 rounded-lg mb-3 ${isUrgent ? 'bg-red-500/20 border border-red-500/30' : 'bg-dark-secondary'}`}>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Next VAT/WHT Filing</span>
                    <span className={`text-sm font-medium ${isUrgent ? 'text-red-400' : 'text-brand-cyan'}`}>
                        {daysUntil} days
                    </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    Due: {date.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-300">VAT Rate (Current)</span>
                    <span className="text-white font-medium">{(NIGERIAN_TAX_RATES.VAT * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-300">WHT (Professional)</span>
                    <span className="text-white font-medium">{(NIGERIAN_TAX_RATES.WHT_SERVICES * 100)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Company Tax</span>
                    <span className="text-white font-medium">{(NIGERIAN_TAX_RATES.COMPANY_INCOME_TAX * 100)}%</span>
                </div>
            </div>
        </Card>
    );
};

const QuickStatsGrid: React.FC<{ transactions: CategorizedTransaction[], bills: Bill[], invoices: Invoice[] }> = ({ transactions, bills, invoices }) => {
    const formatNaira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
    
    const stats = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
        const pendingBills = bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue').reduce((sum, b) => sum + b.amount, 0);
        const pendingInvoices = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.total, 0);
        const vatCollected = totalIncome * NIGERIAN_TAX_RATES.VAT;
        
        return {
            netIncome: totalIncome - totalExpenses,
            totalIncome,
            totalExpenses,
            pendingBills,
            pendingInvoices,
            vatCollected,
            cashFlow: totalIncome - totalExpenses - pendingBills
        };
    }, [transactions, bills, invoices]);

    const statCards = [
        {
            title: 'Net Income',
            value: stats.netIncome,
            icon: <path d="M12 3v18" />,
            color: stats.netIncome >= 0 ? 'text-green-400' : 'text-red-400',
            bgColor: stats.netIncome >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
        },
        {
            title: 'Total Income',
            value: stats.totalIncome,
            icon: <path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/>,
            color: 'text-brand-cyan',
            bgColor: 'bg-brand-cyan/10'
        },
        {
            title: 'Pending Invoices',
            value: stats.pendingInvoices,
            icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10'
        },
        {
            title: 'VAT Collected',
            value: stats.vatCollected,
            icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
            color: 'text-nigerian-green',
            bgColor: 'bg-nigerian-green/10'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, index) => (
                <Card key={stat.title} className={`${stat.bgColor} border-none hover:scale-105 transition-all duration-200`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={stat.color}>
                                {stat.icon}
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.title}</p>
                            <p className={`text-lg font-bold ${stat.color} truncate`}>{formatNaira(stat.value)}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

const RecentActivity: React.FC<{ transactions: CategorizedTransaction[], bills: Bill[], invoices: Invoice[] }> = ({ transactions, bills, invoices }) => {
    const formatNaira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

    const combinedActivity = useMemo(() => {
        const transactionActivity = transactions.slice(0, 3).map(t => ({
            id: t.id,
            type: 'transaction',
            date: new Date(t.date),
            description: t.narration || 'Bank Transaction',
            amount: t.amount,
            isCredit: t.type === 'credit',
            category: t.category
        }));
        
        const billActivity = bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue').slice(0, 2).map(b => ({
            id: b.id,
            type: 'bill',
            date: new Date(b.issueDate),
            description: `Bill from ${b.vendor}`,
            amount: b.amount,
            isCredit: false,
            status: b.status
        }));
        
        const invoiceActivity = invoices.filter(i => i.status !== 'Paid').slice(0, 2).map(i => ({
            id: i.id,
            type: 'invoice',
            date: new Date(i.issueDate),
            description: `Invoice to ${i.customer}`,
            amount: i.total,
            isCredit: true,
            status: i.status
        }));

        return [...transactionActivity, ...billActivity, ...invoiceActivity]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 8);
    }, [transactions, bills, invoices]);

    const iconMap: { [key: string]: React.ReactNode } = {
        transaction: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 21h10" />
                <path d="M10 21v-8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8" />
            </svg>
        ),
        bill: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 17a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2Z"/>
            </svg>
        ),
        invoice: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/>
            </svg>
        ),
    };

    const colorMap: { [key: string]: string } = {
        transaction: 'text-gray-400',
        bill: 'text-red-400',
        invoice: 'text-green-400',
    };

    return (
        <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {combinedActivity.length > 0 ? combinedActivity.map((item, index) => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-3 bg-dark-secondary/50 rounded-lg hover:bg-dark-secondary transition-colors">
                        <div className={`p-2 bg-dark-tertiary rounded-lg ${colorMap[item.type]} flex-shrink-0`}>
                            {iconMap[item.type]}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-white font-medium text-sm truncate" title={item.description}>
                                {item.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">
                                    {item.date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                                </p>
                                {('category' in item) && item.category && (
                                    <span className="text-xs bg-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded-full">
                                        {item.category}
                                    </span>
                                )}
                                {('status' in item) && item.status && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        item.status === 'Overdue' ? 'bg-red-500/20 text-red-400' :
                                        item.status === 'Unpaid' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-green-500/20 text-green-400'
                                    }`}>
                                        {item.status}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={`font-mono text-sm font-medium ${item.isCredit ? 'text-green-400' : 'text-red-400'} flex-shrink-0`}>
                            {item.isCredit ? '+' : '-'}{formatNaira(item.amount)}
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                        <div className="w-12 h-12 bg-dark-secondary rounded-full flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                                <path d="M3 3v18h18" />
                                <path d="m19 9-5 5-4-4-3 3" />
                            </svg>
                        </div>
                        <p className="text-gray-400 text-sm">No recent activity</p>
                        <p className="text-gray-500 text-xs mt-1">Start by connecting your bank or adding transactions</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

const TaxLiabilityEstimator: React.FC<{ transactions: CategorizedTransaction[], invoices: Invoice[] }> = ({ transactions, invoices }) => {
    const formatNaira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

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

    if(transactions.length === 0){
        return (
            <Card className="bg-dark-secondary flex items-center justify-center text-center">
                <p className="text-gray-400">Tax estimator requires transaction data. Please link a bank account.</p>
            </Card>
        )
    }

    return (
        <Card className="bg-dark-secondary">
          <h3 className="text-gray-400 text-sm font-medium mb-3">Tax Liability Estimator</h3>
          <div className="space-y-3">
             <div title="Companies Income Tax: Calculated based on your projected annual turnover.">
                <p className="text-sm text-orange-300 flex justify-between items-center">
                    <span>Est. CIT ({taxCalculations.citRate}%)</span>
                    <InfoIcon />
                </p>
                <p className="text-xl font-bold text-orange-400">{formatNaira(taxCalculations.estimatedCIT)}</p>
            </div>
             <div title="Tertiary Education Tax: 3% of your current profit.">
                <p className="text-sm text-cyan-300 flex justify-between items-center">
                    <span>Est. TET (3%)</span>
                    <InfoIcon />
                </p>
                <p className="text-xl font-bold text-cyan-400">{formatNaira(taxCalculations.estimatedTET)}</p>
            </div>
            <div>
              <p className="text-sm text-blue-300">Est. VAT Payable</p>
              <p className="text-xl font-bold text-blue-400">{formatNaira(taxCalculations.vatPayable)}</p>
            </div>
             <div>
              <p className="text-sm text-purple-300">Est. WHT Receivable</p>
              <p className="text-xl font-bold text-purple-400">{formatNaira(taxCalculations.whtReceivable)}</p>
            </div>
          </div>
        </Card>
    );
};

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);


export const Dashboard: React.FC<DashboardProps> = ({ transactions, connections, bills, invoices }) => {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoadingInsights(true);
      if (transactions.length > 0) {
        const fetchedInsights = await getFinancialInsights(transactions);
        setInsights(fetchedInsights);
      } else {
        setInsights([]);
      }
      setLoadingInsights(false);
    };
    fetchAllData();
  }, [transactions]);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'credit') {
          acc.income += t.amount;
        } else {
          acc.expenses += t.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
  }, [transactions]);
  
  const chartData = [
    { name: 'Total Income', value: summary.income, color: '#00F5D4' },
    { name: 'Total Expenses', value: summary.expenses, color: '#F15BB5' },
  ];
  
  const lastSyncTime = useMemo(() => {
    if (connections.length === 0) return null;
    const latestSync = connections.reduce((latest, conn) => {
        const connDate = new Date(conn.lastSynced);
        return connDate > latest ? connDate : latest;
    }, new Date(0));
    return latestSync.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }, [connections]);


  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header with sync status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Business Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor your Nigerian business performance</p>
        </div>
        {lastSyncTime && (
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-dark-secondary px-3 py-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            <span>Last Synced: Today at {lastSyncTime}</span>
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <QuickStatsGrid transactions={transactions} bills={bills} invoices={invoices} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4">Cash Flow Overview</h3>
          {transactions.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                <XAxis type="number" stroke="#888888" tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#888888" width={100} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  contentStyle={{ backgroundColor: '#1C203F', border: '1px solid #333' }}
                  formatter={(value: number) => formatNaira(value)}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <div className="w-16 h-16 bg-dark-secondary rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-cyan">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">No transaction data available</p>
              <p className="text-gray-500 text-sm">Connect your bank account to see cash flow insights</p>
            </div>
          )}
        </Card>

        {/* Tax Compliance */}
        <ComplianceWidget />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activity */}
        <RecentActivity transactions={transactions} bills={bills} invoices={invoices} />
        
        {/* AI Insights */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4">AI Financial Insights</h3>
          {loadingInsights ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Spinner />
              <p className="mt-3 text-sm text-gray-400">Analyzing your financial data...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {insights.length > 0 ? insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              )) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-12 h-12 bg-brand-cyan/20 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-cyan">
                      <path d="M12 8V4H8" />
                      <rect width="16" height="12" x="4" y="8" rx="2" />
                    </svg>
                  </div>
                  <p className="text-gray-400 font-medium">No insights available</p>
                  <p className="text-gray-500 text-sm">Add transactions to get AI-powered financial advice</p>
                </div>
              )}
            </div>
          )}
        </Card>
        
        {/* Tax Estimator */}
        <TaxLiabilityEstimator transactions={transactions} invoices={invoices} />
      </div>
    </div>
  );
};
