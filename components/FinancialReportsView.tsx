
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Card } from './ui/Card';
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
    };

    return (
        <>
            <DrillDownModal 
                isOpen={!!drillDown} 
                onClose={() => setDrillDown(null)} 
                data={drillDown} 
            />
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
                        <div className="lg:col-span-2 ai-analysis-print">
                            <AICFOInsights analysis={aiAnalysis} isLoading={isLoadingAnalysis} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
