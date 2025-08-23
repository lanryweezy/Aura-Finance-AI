
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { getFinancialInsights } from '../services/geminiService';
import type { CategorizedTransaction, FinancialInsight, Invoice, Bill, BankConnection } from '../types';

interface DashboardProps {
  transactions: CategorizedTransaction[];
  connections: BankConnection[];
  bills: Bill[];
  invoices: Invoice[];
}

const InsightCard: React.FC<{ insight: FinancialInsight }> = ({ insight }) => {
    const priorityColor = {
        High: 'border-red-500',
        Medium: 'border-yellow-500',
        Low: 'border-blue-500'
    };

    return (
        <div className={`bg-dark-secondary p-4 rounded-lg border-l-4 ${priorityColor[insight.priority]}`}>
            <h4 className="font-bold text-white">{insight.title}</h4>
            <p className="text-sm text-gray-300 mt-1">{insight.description}</p>
        </div>
    )
}

const RecentActivity: React.FC<{ transactions: CategorizedTransaction[], bills: Bill[], invoices: Invoice[] }> = ({ transactions, bills, invoices }) => {
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
        transaction: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M17 8l-5 5-5-5" /><path d="M7 16l5-5 5 5" /></svg>,
        bill: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2Z"/><path d="M12 4v7"/><path d="m15 8-3-3-3 3"/></svg>,
        invoice: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/><path d="M12 11v7"/><path d="m15 15-3 3-3-3"/></svg>,
    };

    const colorMap: { [key: string]: string } = {
        transaction: 'text-gray-400',
        bill: 'text-red-400',
        invoice: 'text-green-400',
    }

    return (
        <Card className="lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {combinedActivity.length > 0 ? combinedActivity.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center gap-4">
                        <div className={`p-2 bg-dark-secondary rounded-full ${colorMap[item.type]}`}>
                            {iconMap[item.type]}
                        </div>
                        <div className="flex-grow">
                            <p className="text-white font-medium truncate" title={item.description}>{item.description}</p>
                            <p className="text-xs text-gray-500">{item.date.toLocaleDateString()}</p>
                        </div>
                        <div className={`font-mono text-sm ${item.isCredit ? 'text-green-400' : 'text-red-400'}`}>
                            {item.isCredit ? '+' : '-'}{formatNaira(item.amount)}
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-gray-400">No recent activity to show.</p>
                    </div>
                )}
            </div>
        </Card>
    )
}

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
    <div className="space-y-8">
      <div className="flex justify-end">
        {lastSyncTime && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                <span>Last Synced: Today at {lastSyncTime}</span>
            </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Total Income</h3>
          <p className="text-3xl font-bold text-brand-cyan mt-2">{formatNaira(summary.income)}</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Total Expenses</h3>
          <p className="text-3xl font-bold text-brand-pink mt-2">{formatNaira(summary.expenses)}</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 text-sm font-medium">Net Flow</h3>
          <p className={`text-3xl font-bold mt-2 ${summary.income - summary.expenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatNaira(summary.income - summary.expenses)}
          </p>
        </Card>
         <TaxLiabilityEstimator transactions={transactions} invoices={invoices} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
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
                <p className="text-gray-400">No transaction data available.</p>
                <p className="text-gray-500 text-sm">Link a bank account to see your cash flow.</p>
            </div>
          )}
        </Card>
        <Card className="lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-4">AI Financial Advisor</h3>
            {loadingInsights ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <Spinner />
                    <p className="mt-2 text-sm text-gray-400">Analyzing your data...</p>
                </div>
            ) : (
                <div className="space-y-4">
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
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity transactions={transactions} bills={bills} invoices={invoices} />
      </div>
    </div>
  );
};
