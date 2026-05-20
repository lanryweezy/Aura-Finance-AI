
import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import { useCurrency } from './ui/CurrencyProvider';
import { reportService, FinancialSummary } from '../services/reportService';
import { reportSharingService } from '../services/reportSharingService';
import { useToast } from './ui/Toast';
import type { CategorizedTransaction, Bill, Invoice, InventoryItem, Project, Account } from '../types';
import { Spinner } from './ui/Spinner';
import { getFinancialReportAnalysis } from '../services/geminiService';
import { calculateReportData } from '../services/reportService';
import { ReportHeader } from './reports/ReportHeader';
import { ProfitAndLossReport } from './reports/ProfitAndLossReport';
import { BalanceSheetReport } from './reports/BalanceSheetReport';
import { CashFlowStatement } from './reports/CashFlowStatement';
import { TrialBalanceReport } from './reports/TrialBalanceReport';
import { reportSharingService } from '../services/reportSharingService';
import { useToast } from './ui/Toast';
import { AICFOInsights } from './reports/AICFOInsights';
import { DrillDownModal } from './reports/DrillDownModal';
import { CashFlowForecast } from './reports/CashFlowForecast';

import type { CategorizedTransaction, PayrollSummary, Bill, Invoice, ReportData, ReportPeriod, InventoryItem, Project, Account } from '../types';

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
const TABS = [
    { id: 'p&l', label: 'P&L Statement' },
    { id: 'balance_sheet', label: 'Balance Sheet' },
    { id: 'cash_flow', label: 'Cash Flow' },
    { id: 'trial_balance', label: 'Trial Balance' },
    { id: 'forecast', label: 'Forecast' },
] as const;

const getDefaultPeriod = (): ReportPeriod => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    return { start, end };
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({ transactions, payrollSummary, bills, invoices, inventory, projects, chartOfAccounts }) => {
    const { showToast } = useToast();
    const [reportPeriod, setReportPeriod] = useState<ReportPeriod>(getDefaultPeriod());
    const [comparePeriod, setComparePeriod] = useState<ReportPeriod | null>(null);
    const [activeReport, setActiveReport] = useState<'p&l' | 'balance_sheet' | 'cash_flow' | 'trial_balance' | 'forecast'>('p&l');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    
    const [drillDown, setDrillDown] = useState<{title: string, transactions: CategorizedTransaction[]} | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [sharedLink, setSharedLink] = useState<string | null>(null);

    const printRef = useRef<HTMLDivElement>(null);

    const filteredTransactions = useMemo(() => {
        if (projectFilter === 'all') return transactions;
        return transactions.filter(t => t.projectId === projectFilter);
    }, [transactions, projectFilter]);

    const reportData: ReportData | null = useMemo(() => {
        if (filteredTransactions.length === 0 && projectFilter !== 'all' && activeReport !== 'trial_balance') return calculateReportData(reportPeriod, [], [], [], {totalGross:0, totalPAYE: 0, totalNHF: 0, totalNet: 0, totalPension: 0, employeeCount: 0}, []);
        if (transactions.length === 0 && activeReport !== 'trial_balance') return null;
        return calculateReportData(reportPeriod, filteredTransactions, invoices, bills, payrollSummary, inventory);
    }, [reportPeriod, filteredTransactions, invoices, bills, payrollSummary, inventory, transactions.length, projectFilter, activeReport]);

    const comparisonReportData: ReportData | null = useMemo(() => {
        if (!comparePeriod || transactions.length === 0) return null;
        // Note: comparison doesn't use project filter for simplicity now
        return calculateReportData(comparePeriod, transactions, invoices, bills, payrollSummary, inventory);
    }, [comparePeriod, transactions, invoices, bills, payrollSummary, inventory]);

    const handleDrillDown = useCallback((title: string, type: 'credit' | 'debit' | 'all', categories: string[]) => {
        const filtered = filteredTransactions.filter(t => {
            const txDate = new Date(t.date);
            const inPeriod = txDate >= reportPeriod.start && txDate <= reportPeriod.end;
            if (!inPeriod) return false;
            
            const isTypeMatch = type === 'all' || t.type === type;
            const isCategoryMatch = categories.includes(t.category) || categories.includes('All');

            return isTypeMatch && isCategoryMatch;
        });
        setDrillDown({ title: `${title} (${reportPeriod.start.toLocaleDateString()} - ${reportPeriod.end.toLocaleDateString()})`, transactions: filtered });
    }, [filteredTransactions, reportPeriod]);

    useEffect(() => {
        const generateAnalysis = async () => {
            if (!reportData) {
                setAiAnalysis("Generate a report by selecting a date range to see AI analysis.");
                return;
            };
            setIsLoadingAnalysis(true);
            try {
                const analysis = await getFinancialReportAnalysis(
                    reportData,
                    comparisonReportData ?? undefined
                );
                setAiAnalysis(analysis);
            } catch(e) {
                setAiAnalysis("Failed to generate AI analysis.");
            } finally {
                setIsLoadingAnalysis(false);
            }
        };
        generateAnalysis();
    }, [reportData, comparisonReportData]);
    
    const handleShare = async () => {
        setIsSharing(true);
        try {
            const reportName = TABS.find(t => t.id === activeReport)?.label || 'Financial Report';
            const link = await reportSharingService.generateLink(reportName);
            const fullUrl = `${window.location.origin}/shared/report?token=${link.token}`;
            setSharedLink(fullUrl);
            showToast('Secure link generated successfully', 'success');
        } catch (e) {
            showToast('Failed to generate sharing link', 'error');
        } finally {
            setIsSharing(false);
        }
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=1200');
            printWindow?.document.write('<html><head><title>Financial Report</title>');
            printWindow?.document.write(`
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #fff; color: #000; margin: 2rem; }
                    h1, h2, h3 { color: #111; border-bottom: 2px solid #333; padding-bottom: 0.5rem; }
                    .print-container { }
                    .print-main { }
                    .ai-analysis-print { page-break-before: always; }
                    .report-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
                    table { width: 100%; border-collapse: collapse; margin-top: 1rem; page-break-inside: avoid; }
                    td, th { padding: 0.75rem 0.5rem; border-bottom: 1px solid #eee; text-align: left; }
                    .section-header { font-weight: bold; font-size: 1.1em; padding-top: 1rem; color: #000; }
                    .section-item td { padding-left: 2rem; }
                    .section-total, .trial-balance-total { font-weight: bold; border-top: 1px solid #999; border-bottom: 2px solid #000; }
                    .no-print { display: none; }
                    .recharts-wrapper { display: none; } /* Hide charts for printing */
                </style>
            `);
            printWindow?.document.write('</head><body>');
            printWindow?.document.write(printContent.innerHTML);
            printWindow?.document.write('</body></html>');
            printWindow?.document.close();
            printWindow?.focus();
            printWindow?.print();
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
            <div className="space-y-6">
                <ReportHeader
                    activeReport={activeReport}
                    setActiveReport={setActiveReport}
                    reportPeriod={reportPeriod}
                    setReportPeriod={setReportPeriod}
                    comparePeriod={comparePeriod}
                    setComparePeriod={setComparePeriod}
                    onPrint={handlePrint}
                    onShare={handleShare}
                    projects={projects}
                    projectFilter={projectFilter}
                    setProjectFilter={setProjectFilter}
                />

                {sharedLink && (
                    <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl p-6 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-brand-cyan font-bold uppercase tracking-widest text-xs">Secure Shareable Link</h4>
                            <button onClick={() => setSharedLink(null)} className="text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <input
                                readOnly
                                value={sharedLink}
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm font-mono text-brand-cyan outline-none"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(sharedLink);
                                    showToast('Copied to clipboard', 'success');
                                }}
                                className="bg-brand-cyan text-black font-black px-6 rounded-xl hover:bg-brand-cyan/80 transition-all active:scale-95"
                            >
                                COPY
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-3 font-bold uppercase tracking-tighter italic">This link is secure, encrypted, and will expire in 7 days.</p>
                    </div>
                )}

                <div ref={printRef} className="print-container">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 print-main">
                            {reportData || activeReport === 'trial_balance' ? (
                                <>
                                    {activeReport === 'p&l' && reportData && <ProfitAndLossReport data={reportData.pAndL} onDrillDown={handleDrillDown}/>}
                                    {activeReport === 'balance_sheet' && reportData && <BalanceSheetReport data={reportData.balanceSheet} onDrillDown={handleDrillDown}/>}
                                    {activeReport === 'cash_flow' && reportData && <CashFlowStatement data={reportData.cashFlow} onDrillDown={handleDrillDown}/>}
                                    {activeReport === 'trial_balance' && <TrialBalanceReport accounts={chartOfAccounts} transactions={filteredTransactions} period={reportPeriod} />}
                                    {activeReport === 'forecast' && <CashFlowForecast />}
                                </>
                            ) : (
                                <Card className="flex items-center justify-center h-96">
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-white">No Transaction Data</h3>
                                        <p className="text-gray-400 mt-2">Link a bank account and sync transactions to generate reports.</p>
                                    </div>
                                </Card>
                            )}
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
