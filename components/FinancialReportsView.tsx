
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { useCurrency } from './ui/CurrencyProvider';
import { reportService, FinancialSummary } from '../services/reportService';
import { reportSharingService } from '../services/reportSharingService';
import { useToast } from './ui/Toast';
import { Spinner } from './ui/Spinner';
import { getFinancialReportAnalysis } from '../services/geminiService';
import { calculateReportData } from '../services/reportService';
import { ReportHeader } from './reports/ReportHeader';
import { ProfitAndLossReport } from './reports/ProfitAndLossReport';
import { BalanceSheetReport } from './reports/BalanceSheetReport';
import { CashFlowStatement } from './reports/CashFlowStatement';
import { TrialBalanceReport } from './reports/TrialBalanceReport';
import { authService } from '../services/authService';
import { AICFOInsights } from './reports/AICFOInsights';
import { DrillDownModal } from './reports/DrillDownModal';
import { CashFlowForecast } from './reports/CashFlowForecast';
import type { CategorizedTransaction, PayrollSummary, Bill, Invoice, ReportData, ReportPeriod, InventoryItem, Project, Account } from '../types';

interface FinancialReportsViewProps {
    transactions: CategorizedTransaction[];
    payrollSummary: PayrollSummary;
    bills: Bill[];
    invoices: Invoice[];
    inventory: InventoryItem[];
    projects: Project[];
    chartOfAccounts: Account[];
}

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
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
    transactions,
    payrollSummary,
    bills,
    invoices,
    inventory,
    projects,
    chartOfAccounts
}) => {
    const { showToast } = useToast();
    const { formatAmount } = useCurrency();
    const [reportPeriod, setReportPeriod] = useState<ReportPeriod>(getDefaultPeriod());
    const [comparePeriod, setComparePeriod] = useState<ReportPeriod | null>(null);
    const [activeReport, setActiveReport] = useState<'p&l' | 'balance_sheet' | 'cash_flow' | 'trial_balance' | 'forecast'>('p&l');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    
    const [drillDown, setDrillDown] = useState<{title: string, transactions: CategorizedTransaction[]} | null>(null);
    const [sharedLink, setSharedLink] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    const filteredTransactions = useMemo(() => {
        if (projectFilter === 'all') return transactions;
        return transactions.filter(t => t.projectId === projectFilter);
    }, [transactions, projectFilter]);

    const reportData: ReportData | null = useMemo(() => {
        if (filteredTransactions.length === 0 && projectFilter !== 'all' && activeReport !== 'trial_balance') {
            return calculateReportData(reportPeriod, [], [], [], {totalGross:0, totalPAYE: 0, totalNHF: 0, totalNet: 0, totalPension: 0, employeeCount: 0, totalBonuses: 0, totalDeductions: 0}, []);
        }
        if (transactions.length === 0 && activeReport !== 'trial_balance') return null;
        return calculateReportData(reportPeriod, filteredTransactions, invoices, bills, payrollSummary, inventory);
    }, [reportPeriod, filteredTransactions, invoices, bills, payrollSummary, inventory, transactions.length, projectFilter, activeReport]);

    const comparisonReportData: ReportData | null = useMemo(() => {
        if (!comparePeriod || transactions.length === 0) return null;
        return calculateReportData(comparePeriod, transactions, invoices, bills, payrollSummary, inventory);
    }, [comparePeriod, transactions, invoices, bills, payrollSummary, inventory]);

    const summary: FinancialSummary = useMemo(() =>
        reportService.getFinancialSummary(transactions, bills, invoices, inventory, chartOfAccounts),
    [transactions, bills, invoices, inventory, chartOfAccounts]);

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
            const org = authService.getCurrentUser()?.org;
            const orgName = org?.name || 'Aura Customer';
            const link = reportSharingService.generateLink(orgName, summary);
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
                    .recharts-wrapper { display: none; }
                </style>
            `);
            printWindow?.document.write('</head><body>');
            printWindow?.document.write(printContent.innerHTML);
            printWindow?.document.write('</body></html>');
            printWindow?.document.close();
            printWindow?.focus();
            setTimeout(() => {
                printWindow?.print();
            }, 500);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-aura-gray-900 dark:text-white tracking-tight">Financial Intelligence</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Accrual-basis reporting for professional insights.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95 disabled:opacity-50"
                    >
                        {isSharing ? <Spinner size="sm" color="black" /> : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
                        )}
                        Share Link
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-aura-gray-600 dark:text-gray-300 font-bold py-2.5 px-6 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-2 transition-all active:scale-95 shadow-sm dark:shadow-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Print Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', val: summary.revenue, color: 'text-brand-cyan' },
                    { label: 'Net Profit', val: summary.netProfit, color: summary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400' },
                    { label: 'Operating Expenses', val: summary.expenses, color: 'text-orange-600 dark:text-orange-400' },
                    { label: 'Cash Margin', val: ((summary.netProfit / (summary.revenue || 1)) * 100).toFixed(1) + '%', color: 'text-brand-purple', isRaw: true }
                ].map((stat, i) => (
                    <Card key={i} className="p-6 border-gray-100 dark:border-white/5 bg-gradient-to-br from-aura-gray-50 dark:from-white/[0.02] to-transparent">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>
                            {stat.isRaw ? stat.val : formatAmount(Number(stat.val))}
                        </p>
                    </Card>
                ))}
            </div>

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
                    <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl p-6 animate-in zoom-in duration-300 shadow-lg shadow-brand-cyan/10">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-brand-cyan font-bold uppercase tracking-widest text-xs">Secure Shareable Link</h4>
                            <button onClick={() => setSharedLink(null)} aria-label="Close share link" className="text-gray-500 dark:text-gray-400 hover:text-aura-gray-900 dark:hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <input
                                readOnly
                                value={sharedLink}
                                className="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-mono text-brand-cyan outline-none"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(sharedLink);
                                    showToast('Copied to clipboard', 'success');
                                }}
                                className="bg-brand-cyan text-black font-black px-6 rounded-xl hover:bg-brand-cyan/80 transition-all active:scale-95 shadow-md shadow-brand-cyan/20"
                            >
                                COPY
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-3 font-bold uppercase tracking-tighter italic">This link is secure, encrypted, and will expire in 7 days.</p>
                    </div>
                )}

                <div ref={printRef} className="print-container">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 print-main">
                            {reportData || activeReport === 'trial_balance' ? (
                                <div className="space-y-6">
                                    {activeReport === 'p&l' && reportData && <ProfitAndLossReport data={reportData.pAndL} onDrillDown={handleDrillDown}/>}
                                    {activeReport === 'balance_sheet' && reportData && <BalanceSheetReport data={reportData.balanceSheet} onDrillDown={handleDrillDown}/>}
                                    {activeReport === 'cash_flow' && reportData && <CashFlowStatement data={reportData.cashFlow} onDrillDown={handleDrillDown}/>}
                                    {activeReport === 'trial_balance' && <TrialBalanceReport accounts={chartOfAccounts} transactions={filteredTransactions} period={reportPeriod} />}
                                    {activeReport === 'forecast' && <CashFlowForecast />}
                                </div>
                            ) : (
                                <Card className="flex items-center justify-center h-96">
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-aura-gray-900 dark:text-white">No Transaction Data</h3>
                                        <p className="text-gray-500 dark:text-gray-400 mt-2">Link a bank account and sync transactions to generate reports.</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <AICFOInsights analysis={aiAnalysis} isLoading={isLoadingAnalysis} />

                            <Card className="p-6 border-gray-100 dark:border-white/5 bg-aura-gray-50 dark:bg-white/5 backdrop-blur-sm">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-aura-gray-900 dark:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-purple"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                                    Balance Sheet Summary
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400">Total Assets</span>
                                        <span className="font-mono font-bold text-aura-gray-900 dark:text-white">{formatAmount(summary.totalAssets)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400">Total Liabilities</span>
                                        <span className="font-mono font-bold text-red-600 dark:text-red-400">({formatAmount(summary.totalLiabilities)})</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                                        <span className="font-bold text-brand-cyan">Net Equity</span>
                                        <span className="font-mono font-bold text-lg text-aura-gray-900 dark:text-white">{formatAmount(summary.totalAssets - summary.totalLiabilities)}</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 border-gray-100 dark:border-white/5 bg-aura-gray-50 dark:bg-white/5 backdrop-blur-sm">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-aura-gray-900 dark:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 7-3 5 3 5"/><path d="m19 7 3 5-3 5"/></svg>
                                    Cash Position
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-gray-400">Operating Cash</span>
                                        <span className={`font-mono font-bold ${summary.cashFlow.operating >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatAmount(summary.cashFlow.operating)}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 italic">Net cash generated from daily business operations.</div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {drillDown && (
                <DrillDownModal
                    isOpen={!!drillDown}
                    onClose={() => setDrillDown(null)}
                    data={drillDown}
                />
            )}
        </div>
    );
};
