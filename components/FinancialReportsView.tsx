
import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import { useCurrency } from './ui/CurrencyProvider';
import { reportService, FinancialSummary } from '../services/reportService';
import { reportSharingService } from '../services/reportSharingService';
import { useToast } from './ui/Toast';
import type { CategorizedTransaction, Bill, Invoice, InventoryItem, Project, Account } from '../types';

interface FinancialReportsViewProps {
    transactions: CategorizedTransaction[];
    payrollSummary: any;
    bills: Bill[];
    invoices: Invoice[];
    inventory: InventoryItem[];
    projects: Project[];
    chartOfAccounts: Account[];
}

const ShareLinkModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    orgName: string;
    summary: FinancialSummary;
}> = ({ isOpen, onClose, orgName, summary }) => {
    const { showToast } = useToast();
    const [link, setLink] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            const generatedLink = reportSharingService.generateLink(orgName, summary);
            setLink(generatedLink);
        }
    }, [isOpen, orgName, summary]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link);
        showToast('Link copied to clipboard!', 'success');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share Financial Report</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                    This link provides a secure, read-only snapshot of your current financial statements.
                    The link will expire in 7 days and contains a data snapshot for offline viewing.
                </p>

                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        readOnly
                        value={link}
                        className="flex-1 bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-mono outline-none"
                    />
                    <button
                        onClick={copyToClipboard}
                        className="bg-brand-cyan text-black font-bold px-4 rounded-xl hover:bg-brand-cyan/90 transition-all active:scale-95"
                    >
                        Copy
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-dark-secondary transition-all"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
    transactions, bills, invoices, inventory, chartOfAccounts
}) => {
    const { formatAmount } = useCurrency();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const summary = useMemo(() =>
        reportService.getFinancialSummary(transactions, bills, invoices, inventory, chartOfAccounts),
    [transactions, bills, invoices, inventory, chartOfAccounts]);

    return (
        <div className="space-y-8 pb-12">
            <ShareLinkModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                orgName="Aura Demo Corp" // In a real app, get from context
                summary={summary}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Financial Intelligence</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium italic">Accrual-basis reporting for professional insights.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
                        Share Link
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2.5 px-6 rounded-xl border border-white/10 flex items-center gap-2 transition-all active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', val: summary.revenue, color: 'text-brand-cyan' },
                    { label: 'Net Profit', val: summary.netProfit, color: summary.netProfit >= 0 ? 'text-green-400' : 'text-red-400' },
                    { label: 'Operating Expenses', val: summary.expenses, color: 'text-orange-400' },
                    { label: 'Cash Margin', val: ((summary.netProfit / (summary.revenue || 1)) * 100).toFixed(1) + '%', color: 'text-brand-purple', isRaw: true }
                ].map((stat, i) => (
                    <Card key={i} className="p-6 border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>
                            {stat.isRaw ? stat.val : formatAmount(Number(stat.val))}
                        </p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profit & Loss */}
                <Card className="lg:col-span-2 p-8 border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-brand-purple rounded-full"></span>
                            Profit & Loss Statement
                        </h3>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">Accrual Basis</span>
                    </div>
                    <div className="space-y-6 relative z-10">
                        <section>
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-tighter mb-4 border-b border-white/5 pb-2">Operating Revenue</h4>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-400 font-medium">Sales Revenue</span>
                                <span className="font-mono font-bold text-lg">{formatAmount(summary.revenue)}</span>
                            </div>
                        </section>
                        <section>
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-tighter mb-4 border-b border-white/5 pb-2">Cost of Sales & Expenses</h4>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-400 font-medium">Operating Expenses</span>
                                <span className="font-mono font-bold text-red-400">({formatAmount(summary.expenses)})</span>
                            </div>
                        </section>
                        <div className="pt-6 mt-6 border-t-2 border-brand-purple/20 flex justify-between items-center">
                            <span className="text-lg font-black uppercase tracking-widest text-brand-purple">Net Income</span>
                            <span className={`text-2xl font-black font-mono ${summary.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatAmount(summary.netProfit)}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Balance Sheet Summary */}
                <Card className="p-8 border-white/5 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-3xl -mr-16 -mb-16"></div>
                    <div className="mb-8 relative z-10">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-brand-cyan rounded-full"></span>
                            Balance Sheet
                        </h3>
                    </div>
                    <div className="space-y-8 relative z-10">
                        <section>
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-tighter mb-4 border-b border-white/5 pb-2">Assets</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Current & Fixed Assets</span>
                                <span className="font-mono font-bold">{formatAmount(summary.totalAssets)}</span>
                            </div>
                        </section>
                        <section>
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-tighter mb-4 border-b border-white/5 pb-2">Liabilities</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Total Liabilities</span>
                                <span className="font-mono font-bold text-red-400">({formatAmount(summary.totalLiabilities)})</span>
                            </div>
                        </section>
                        <div className="pt-6 mt-6 border-t-2 border-brand-cyan/20 flex justify-between items-center">
                            <span className="font-black uppercase tracking-widest text-brand-cyan">Total Equity</span>
                            <span className="text-xl font-black font-mono text-white">
                                {formatAmount(summary.totalAssets - summary.totalLiabilities)}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Cash Flow Statement */}
            <Card className="p-8 border-white/5">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                        Statement of Cash Flows (Direct Method)
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { label: 'Operating Activities', amount: summary.cashFlow.operating, desc: 'Cash from daily ops' },
                        { label: 'Investing Activities', amount: summary.cashFlow.investing, desc: 'Asset acquisitions' },
                        { label: 'Financing Activities', amount: summary.cashFlow.financing, desc: 'Capital & Loans' }
                    ].map((cf, i) => (
                        <div key={i} className="space-y-2">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{cf.label}</p>
                            <p className={`text-2xl font-mono font-black ${cf.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatAmount(cf.amount)}
                            </p>
                            <p className="text-xs text-gray-500 italic font-medium">{cf.desc}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
