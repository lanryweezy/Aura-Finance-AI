
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from './ui/Card';
import { useCurrency } from './ui/CurrencyProvider';
import { reportSharingService, SharedReportPayload } from '../services/reportSharingService';
import { Spinner } from './ui/Spinner';

// Simple router hook simulation since we don't have a real router setup in this specific sandbox environment
// (assuming App.tsx handles the path and this component is rendered)
const useQuery = () => {
    return new URLSearchParams(window.location.search);
};

export const SharedReportView: React.FC = () => {
    const { formatAmount } = useCurrency();
    const query = useQuery();
    const dataParam = query.get('data');

    const payload = useMemo(() => {
        if (!dataParam) return null;
        return reportSharingService.decodePayload(dataParam);
    }, [dataParam]);

    if (!dataParam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-primary p-4">
                <Card className="max-w-md w-full p-8 text-center border-red-500/30">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
                    <p className="text-gray-400">The shareable link is missing or corrupted.</p>
                </Card>
            </div>
        );
    }

    if (!payload) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-primary p-4">
                <Card className="max-w-md w-full p-8 text-center border-yellow-500/30">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Link Expired</h2>
                    <p className="text-gray-400">This financial report link has expired or is no longer valid.</p>
                </Card>
            </div>
        );
    }

    const { summary, orgName, generatedAt } = payload;

    return (
        <div className="min-h-screen bg-dark-primary text-white p-4 md:p-12">
            <div className="max-w-5xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan to-white">Aura Financial</h1>
                        </div>
                        <p className="text-gray-400 font-medium">External Shareable Financial Package</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <h2 className="text-xl font-bold">{orgName}</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Snapshot Generated: {new Date(generatedAt).toLocaleDateString()} {new Date(generatedAt).toLocaleTimeString()}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    {/* Executive Summary */}
                    <Card className="p-8 border-brand-cyan/20 bg-gradient-to-br from-brand-cyan/5 to-transparent">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-cyan mb-6">Financial Performance Snapshot</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <p className="text-gray-500 text-sm mb-1 font-medium">Total Revenue</p>
                                <p className="text-3xl font-black text-white">{formatAmount(summary.revenue)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm mb-1 font-medium">Net Profit</p>
                                <p className={`text-3xl font-black ${summary.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatAmount(summary.netProfit)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm mb-1 font-medium">Cash On Hand</p>
                                <p className="text-3xl font-black text-brand-cyan">{formatAmount(summary.totalAssets - summary.totalLiabilities)}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Detailed Statements */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* P&L */}
                         <Card className="p-8 border-white/5">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-purple"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                                Profit & Loss Statement
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">Operating Revenue</span>
                                    <span className="font-mono font-bold">{formatAmount(summary.revenue)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">Operating Expenses</span>
                                    <span className="font-mono font-bold text-red-400">({formatAmount(summary.expenses)})</span>
                                </div>
                                <div className="flex justify-between items-center py-4 text-lg">
                                    <span className="font-bold">Net Income</span>
                                    <span className={`font-mono font-black ${summary.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatAmount(summary.netProfit)}</span>
                                </div>
                            </div>
                         </Card>

                         {/* Balance Sheet */}
                         <Card className="p-8 border-white/5">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-cyan"><path d="M12 3v19"/><path d="M5 8h14"/><path d="M15 13a3 3 0 1 1-3 3"/><path d="M7 16a3 3 0 1 1-3-3"/></svg>
                                Balance Sheet
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">Total Assets</span>
                                    <span className="font-mono font-bold">{formatAmount(summary.totalAssets)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">Total Liabilities</span>
                                    <span className="font-mono font-bold text-red-400">({formatAmount(summary.totalLiabilities)})</span>
                                </div>
                                <div className="flex justify-between items-center py-4 text-lg">
                                    <span className="font-bold">Total Equity</span>
                                    <span className="font-mono font-black text-brand-cyan">{formatAmount(summary.totalAssets - summary.totalLiabilities)}</span>
                                </div>
                            </div>
                         </Card>
                    </div>

                    {/* Cash Flow */}
                    <Card className="p-8 border-white/5">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Statement of Cash Flows
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                             <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Operating Activities</p>
                                <div className="flex justify-between font-mono">
                                    <span>Net Cash</span>
                                    <span className={summary.cashFlow.operating >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {formatAmount(summary.cashFlow.operating)}
                                    </span>
                                </div>
                             </div>
                             <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Investing Activities</p>
                                <div className="flex justify-between font-mono">
                                    <span>Net Cash</span>
                                    <span className={summary.cashFlow.investing >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {formatAmount(summary.cashFlow.investing)}
                                    </span>
                                </div>
                             </div>
                             <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Financing Activities</p>
                                <div className="flex justify-between font-mono">
                                    <span>Net Cash</span>
                                    <span className={summary.cashFlow.financing >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {formatAmount(summary.cashFlow.financing)}
                                    </span>
                                </div>
                             </div>
                        </div>
                    </Card>
                </div>

                <footer className="mt-12 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} {orgName}. All financial reports generated by Aura.</p>
                    <p className="mt-2 italic">This is a read-only snapshot for information purposes only.</p>
                </footer>
import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { reportSharingService, SharedReportLink } from '../services/reportSharingService';
import { ProfitAndLossReport } from './reports/ProfitAndLossReport';
import { calculateReportData } from '../services/reportService';

export const SharedReportView: React.FC = () => {
    const [link, setLink] = useState<SharedReportLink | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any>(null);

    useEffect(() => {
        const verify = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (!token) {
                setError('Invalid or missing report token.');
                setIsLoading(false);
                return;
            }

            const verifiedLink = await reportSharingService.verifyToken(token);
            if (!verifiedLink) {
                setError('This report link has expired or is invalid.');
                setIsLoading(false);
                return;
            }

            setLink(verifiedLink);

            // In a real app, we'd fetch the specific snapshot.
            // Here we simulate loading data for the P&L statement.
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Mock data for the shared view
            const mockData = calculateReportData({ start, end }, [], [], [], {totalGross:0, totalPAYE: 0, totalNHF: 0, totalNet: 0, totalPension: 0, employeeCount: 0}, []);
            setReportData(mockData);
            setIsLoading(false);
        };
        verify();
    }, []);

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center bg-dark-primary">
            <Spinner />
        </div>
    );

    if (error) return (
        <div className="h-screen flex items-center justify-center bg-dark-primary p-4">
            <Card className="max-w-md text-center p-12 border-red-500/30">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-gray-400 font-medium">{error}</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all font-bold"
                >
                    Back to Home
                </button>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-primary text-white p-4 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center">
                                <span className="text-black font-black text-xs">A</span>
                            </div>
                            <h1 className="text-xl font-black uppercase tracking-[0.2em] text-brand-cyan">Aura Financial</h1>
                        </div>
                        <h2 className="text-3xl font-bold">{link?.reportType}</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                            Shared Securely • Expires {link && new Date(link.expiresAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all font-bold text-sm flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                            Print Report
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {reportData && <ProfitAndLossReport data={reportData.pAndL} onDrillDown={() => {}} />}
                </div>

                <div className="pt-12 border-t border-white/5 text-center">
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">
                        Powered by Aura Autonomous Financial Brain
                    </p>
                </div>
            </div>
        </div>
    );
};
