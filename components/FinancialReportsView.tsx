
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
import { AICFOInsights } from './reports/AICFOInsights';
import { DrillDownModal } from './reports/DrillDownModal';

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

const getDefaultPeriod = (): ReportPeriod => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    return { start, end };
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({ transactions, payrollSummary, bills, invoices, inventory, projects, chartOfAccounts }) => {
    const [reportPeriod, setReportPeriod] = useState<ReportPeriod>(getDefaultPeriod());
    const [comparePeriod, setComparePeriod] = useState<ReportPeriod | null>(null);
    const [activeReport, setActiveReport] = useState<'p&l' | 'balance_sheet' | 'cash_flow' | 'trial_balance'>('p&l');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    
    const [drillDown, setDrillDown] = useState<{title: string, transactions: CategorizedTransaction[]} | null>(null);

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
                    projects={projects}
                    projectFilter={projectFilter}
                    setProjectFilter={setProjectFilter}
                />

                <div ref={printRef} className="print-container">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 print-main">
                            {reportData || activeReport === 'trial_balance' ? (
                                <>
                                    {activeReport === 'p&l' && reportData && <ProfitAndLossReport data={reportData.pAndL} onDrillDown={handleDrillDown}/>}
                                    {activeReport === 'balance_sheet' && reportData && <BalanceSheetReport data={reportData.balanceSheet} onDrillDown={handleDrillDown}/>}
                                    {activeReport === 'cash_flow' && reportData && <CashFlowStatement data={reportData.cashFlow} onDrillDown={handleDrillDown}/>}
                                    {activeReport === 'trial_balance' && <TrialBalanceReport accounts={chartOfAccounts} transactions={filteredTransactions} period={reportPeriod} />}
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
