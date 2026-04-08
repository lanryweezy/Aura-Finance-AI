
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { getFinancialInsights } from '../services/geminiService';
import { ReceiptScannerModal } from './ui/ReceiptScannerModal';
import type { CategorizedTransaction, FinancialInsight, Invoice, Bill, BankConnection, View } from '../types';

interface DashboardProps {
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
                <h4 className="font-bold text-white text-sm">{insight.title}</h4>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    insight.priority === 'High' ? 'border-red-500 text-red-500' : 
                    insight.priority === 'Medium' ? 'border-yellow-500 text-yellow-500' : 
                    'border-blue-500 text-blue-500'
                }`}>{insight.priority}</span>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{insight.description}</p>
        </div>
    )
});

const QuickActionCard = React.memo<{
    title: string; 
    icon: React.ReactNode; 
    color: string;
    onClick: () => void 
}>(({ title, icon, color, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-dark-tertiary/40 backdrop-blur-md border border-white/5 rounded-2xl hover:bg-white/5 hover:border-brand-cyan/30 hover:-translate-y-1 transition-all duration-300 group shadow-lg">
        <div className={`p-3 rounded-full bg-opacity-20 mb-3 ${color} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        <span className="text-xs font-semibold text-gray-300 group-hover:text-white">{title}</span>
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
        <div className="bg-gradient-to-r from-brand-purple/20 to-brand-cyan/10 rounded-2xl p-6 border border-white/10 mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Get Started with Aura</h3>
                        <p className="text-gray-400 text-sm">Complete these steps to fully automate your finances.</p>
                    </div>
                    <span className="text-2xl font-bold text-brand-cyan">{Math.round(progress)}%</span>
                </div>
                
                <div className="w-full bg-gray-700 h-2 rounded-full mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-purple to-brand-cyan h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {steps.map((step, idx) => (
                        <div key={step.id} className={`flex items-center gap-3 p-3 rounded-xl border ${step.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-dark-secondary/50 border-gray-700'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-400'}`}>
                                {step.completed ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <span className="text-xs font-bold">{idx + 1}</span>}
                            </div>
                            <span className={`text-xs font-medium ${step.completed ? 'text-green-300' : 'text-gray-300'}`}>{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

const RecentActivity = React.memo<{ transactions: CategorizedTransaction[], bills: Bill[], invoices: Invoice[] }>(({ transactions, bills, invoices }) => {
    const formatNaira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

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
        bill: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2Z"/><path d="M12 4v7"/><path d="m15 8-3-3-3 3"/></svg>,
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
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                <button className="text-xs text-brand-cyan hover:underline">View All</button>
            </div>
            <div className="space-y-4">
                {combinedActivity.length > 0 ? combinedActivity.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                        <div className={`p-2.5 rounded-full ${colorMap[item.type]}`}>
                            {iconMap[item.type]}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-white font-medium truncate text-sm" title={item.description}>{item.description}</p>
                            <p className="text-xs text-gray-500">{item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                        </div>
                        <div className={`font-mono text-sm font-semibold ${item.isCredit ? 'text-green-400' : 'text-red-400'}`}>
                            {item.isCredit ? '+' : '-'}{formatNaira(item.amount)}
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <div className="bg-dark-secondary p-4 rounded-full mb-3">
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
            <Card className="bg-dark-secondary/50 flex items-center justify-center text-center">
                <p className="text-gray-400">Tax estimator requires transaction data. Please link a bank account.</p>
            </Card>
        )
    }

    return (
        <Card>
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Tax Estimates</h3>
              <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">Provisional</span>
          </div>
          <div className="space-y-4">
             <div className="bg-dark-primary/50 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-orange-400 flex justify-between items-center mb-1">
                    <span>Est. CIT ({taxCalculations.citRate}%)</span>
                </p>
                <p className="text-xl font-bold text-white">{formatNaira(taxCalculations.estimatedCIT)}</p>
            </div>
             <div className="bg-dark-primary/50 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-cyan-400 flex justify-between items-center mb-1">
                    <span>Est. TET (3%)</span>
                </p>
                <p className="text-xl font-bold text-white">{formatNaira(taxCalculations.estimatedTET)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-primary/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-blue-400 uppercase">VAT Payable</p>
                    <p className="text-lg font-bold text-white">{formatNaira(taxCalculations.vatPayable)}</p>
                </div>
                <div className="bg-dark-primary/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-purple-400 uppercase">WHT Credit</p>
                    <p className="text-lg font-bold text-white">{formatNaira(taxCalculations.whtReceivable)}</p>
                </div>
            </div>
          </div>
        </Card>
    );
});

export const Dashboard = React.memo<DashboardProps>(({ transactions, connections, bills, invoices, onQuickAction, onAddTransaction }) => {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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
    <>
    <ReceiptScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onSave={(data) => {
            if (onAddTransaction) {
                onAddTransaction(data);
            }
        }} 
    />

    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <p className="text-gray-400">Welcome back, Tunde. Here's your financial overview.</p>
          </div>
          {lastSyncTime && (
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-dark-tertiary/50 px-3 py-1.5 rounded-full border border-white/5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Synced: {lastSyncTime}</span>
            </div>
          )}
      </div>

      <OnboardingWidget connections={connections} invoices={invoices} />

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard 
            title="Scan Receipt" 
            color="bg-brand-cyan text-brand-cyan" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><line x1="21" y1="5" x2="10" y2="5"/><line x1="21" y1="2" x2="21" y2="8"/><line x1="24" y1="5" x2="18" y2="5"/></svg>}
            onClick={() => setIsScannerOpen(true)}
        />
        <QuickActionCard 
            title="Create Invoice" 
            color="bg-brand-purple text-brand-purple" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>}
            onClick={() => onQuickAction?.('receivables')}
        />
        <QuickActionCard 
            title="Record Bill" 
            color="bg-brand-pink text-brand-pink" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>}
            onClick={() => onQuickAction?.('payables')}
        />
        <QuickActionCard 
            title="Add Employee" 
            color="bg-blue-400 text-blue-400" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>}
            onClick={() => onQuickAction?.('payroll')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Total Income</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatNaira(summary.income)}</p>
          <div className="mt-2 flex items-center text-xs text-green-400 font-medium bg-green-500/10 w-fit px-2 py-1 rounded-full border border-green-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
             +12.5% vs last month
          </div>
        </Card>
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Total Expenses</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatNaira(summary.expenses)}</p>
          <div className="mt-2 flex items-center text-xs text-red-400 font-medium bg-red-500/10 w-fit px-2 py-1 rounded-full border border-red-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
             +5.2% vs last month
          </div>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Net Flow</h3>
          <p className={`text-3xl font-bold mt-2 ${summary.income - summary.expenses >= 0 ? 'text-brand-cyan' : 'text-red-400'}`}>
            {formatNaira(summary.income - summary.expenses)}
          </p>
          <div className="mt-2 text-xs text-gray-500">
             Cash availability metric
          </div>
        </Card>
         <TaxLiabilityEstimator transactions={transactions} invoices={invoices} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Cash Flow Overview</h3>
            <select className="bg-dark-primary/50 border border-gray-700 text-xs rounded-lg px-2 py-1 text-gray-300">
                <option>This Month</option>
                <option>Last Quarter</option>
            </select>
          </div>
          {transactions.length > 0 ? (
               <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" horizontal={false} />
                        <XAxis type="number" stroke="#888888" tickFormatter={(value) => `₦${Number(value) / 1000}k`} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" stroke="#888888" width={100} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            contentStyle={{ backgroundColor: '#1C203F', border: '1px solid #333', borderRadius: '8px' }}
                            formatter={(value: number) => formatNaira(value)}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
          ) : (
             <div className="flex flex-col items-center justify-center h-[300px]">
                <p className="text-gray-400">No transaction data available.</p>
                <p className="text-gray-500 text-sm">Link a bank account to see your cash flow.</p>
            </div>
          )}
        </Card>
        <Card className="lg:col-span-2 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-gradient-to-br from-brand-cyan to-brand-purple rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                 </div>
                <h3 className="text-lg font-bold text-white">AI Advisor</h3>
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
      </div>
    </div>
    </>
  );
});
