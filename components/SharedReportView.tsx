
import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { useCurrency } from './ui/CurrencyProvider';
import { reportSharingService } from '../services/reportSharingService';

// Simple router hook simulation
const useQuery = () => {
    return new URLSearchParams(window.location.search);
};

export const SharedReportView: React.FC = () => {
    const { formatAmount } = useCurrency();
    const query = useQuery();
    const dataParam = query.get('data') || query.get('token');

    const payload = useMemo(() => {
        if (!dataParam) return null;
        return reportSharingService.decodePayload(dataParam);
    }, [dataParam]);

    if (!dataParam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-aura-gray-50 dark:bg-dark-primary p-4">
                <Card className="max-w-md w-full p-8 text-center border-red-500/30 bg-white dark:bg-dark-tertiary shadow-xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-aura-gray-900 dark:text-white mb-2">Invalid Link</h2>
                    <p className="text-aura-gray-500 dark:text-gray-400 font-medium">The shareable link is missing or corrupted.</p>
                </Card>
            </div>
        );
    }

    if (!payload) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-aura-gray-50 dark:bg-dark-primary p-4">
                <Card className="max-w-md w-full p-8 text-center border-yellow-500/30 bg-white dark:bg-dark-tertiary shadow-xl">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 dark:text-yellow-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-aura-gray-900 dark:text-white mb-2">Link Expired</h2>
                    <p className="text-aura-gray-500 dark:text-gray-400 font-medium">This financial report link has expired or is no longer valid.</p>
                </Card>
            </div>
        );
    }

    const { summary, orgName, generatedAt } = payload;

    return (
        <div className="min-h-screen bg-aura-gray-50 dark:bg-dark-primary text-aura-gray-900 dark:text-white p-4 md:p-12">
            <div className="max-w-5xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-gray-200 dark:border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-xl shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-aura-gray-900 dark:text-white">Aura Financial</h1>
                        </div>
                        <p className="text-aura-gray-500 dark:text-gray-400 font-bold italic">External Shareable Financial Package</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <h2 className="text-xl font-bold text-aura-gray-900 dark:text-white">{orgName}</h2>
                        <p className="text-xs text-aura-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mt-1">Snapshot Generated: {new Date(generatedAt).toLocaleDateString()} {new Date(generatedAt).toLocaleTimeString()}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    {/* Executive Summary */}
                    <Card className="p-8 border-brand-cyan/20 bg-white dark:bg-dark-tertiary bg-gradient-to-br from-brand-cyan/5 to-transparent shadow-xl">
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-cyan mb-6">Financial Performance Snapshot</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <p className="text-aura-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Revenue</p>
                                <p className="text-3xl font-black text-aura-gray-900 dark:text-white font-mono">{formatAmount(summary.revenue)}</p>
                            </div>
                            <div>
                                <p className="text-aura-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Net Profit</p>
                                <p className={`text-3xl font-black font-mono ${summary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatAmount(summary.netProfit)}
                                </p>
                            </div>
                            <div>
                                <p className="text-aura-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Net Equity</p>
                                <p className="text-3xl font-black text-brand-cyan font-mono">{formatAmount(summary.totalAssets - summary.totalLiabilities)}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Detailed Statements */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* P&L */}
                         <Card className="p-8 border-gray-100 dark:border-white/5 bg-white dark:bg-dark-tertiary shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-aura-gray-900 dark:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-purple"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                                Profit & Loss Statement
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                    <span className="text-aura-gray-600 dark:text-gray-400 font-medium">Operating Revenue</span>
                                    <span className="font-mono font-bold text-aura-gray-900 dark:text-white">{formatAmount(summary.revenue)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                    <span className="text-aura-gray-600 dark:text-gray-400 font-medium">Operating Expenses</span>
                                    <span className="font-mono font-bold text-red-600 dark:text-red-400">({formatAmount(summary.expenses)})</span>
                                </div>
                                <div className="flex justify-between items-center py-4 text-lg">
                                    <span className="font-black text-aura-gray-900 dark:text-white uppercase tracking-tighter">Net Income</span>
                                    <span className={`font-mono font-black ${summary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatAmount(summary.netProfit)}</span>
                                </div>
                            </div>
                         </Card>

                         {/* Balance Sheet */}
                         <Card className="p-8 border-gray-100 dark:border-white/5 bg-white dark:bg-dark-tertiary shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-aura-gray-900 dark:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-cyan"><path d="M12 3v19"/><path d="M5 8h14"/><path d="M15 13a3 3 0 1 1-3 3"/><path d="M7 16a3 3 0 1 1-3-3"/></svg>
                                Balance Sheet
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                    <span className="text-aura-gray-600 dark:text-gray-400 font-medium">Total Assets</span>
                                    <span className="font-mono font-bold text-aura-gray-900 dark:text-white">{formatAmount(summary.totalAssets)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                    <span className="text-aura-gray-600 dark:text-gray-400 font-medium">Total Liabilities</span>
                                    <span className="font-mono font-bold text-red-600 dark:text-red-400">({formatAmount(summary.totalLiabilities)})</span>
                                </div>
                                <div className="flex justify-between items-center py-4 text-lg">
                                    <span className="font-black text-aura-gray-900 dark:text-white uppercase tracking-tighter">Total Equity</span>
                                    <span className="font-mono font-black text-brand-cyan">{formatAmount(summary.totalAssets - summary.totalLiabilities)}</span>
                                </div>
                            </div>
                         </Card>
                    </div>

                    {/* Cash Flow */}
                    <Card className="p-8 border-gray-100 dark:border-white/5 bg-white dark:bg-dark-tertiary shadow-xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-aura-gray-900 dark:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Statement of Cash Flows
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                             <div>
                                <p className="text-[10px] font-black text-aura-gray-500 dark:text-gray-400 uppercase mb-4 tracking-widest">Operating Activities</p>
                                <div className="flex justify-between font-mono font-bold text-sm">
                                    <span className="text-aura-gray-600 dark:text-gray-400">Net Cash</span>
                                    <span className={summary.cashFlow.operating >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                        {formatAmount(summary.cashFlow.operating)}
                                    </span>
                                </div>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-aura-gray-500 dark:text-gray-400 uppercase mb-4 tracking-widest">Investing Activities</p>
                                <div className="flex justify-between font-mono font-bold text-sm">
                                    <span className="text-aura-gray-600 dark:text-gray-400">Net Cash</span>
                                    <span className={summary.cashFlow.investing >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                        {formatAmount(summary.cashFlow.investing)}
                                    </span>
                                </div>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-aura-gray-500 dark:text-gray-400 uppercase mb-4 tracking-widest">Financing Activities</p>
                                <div className="flex justify-between font-mono font-bold text-sm">
                                    <span className="text-aura-gray-600 dark:text-gray-400">Net Cash</span>
                                    <span className={summary.cashFlow.financing >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                        {formatAmount(summary.cashFlow.financing)}
                                    </span>
                                </div>
                             </div>
                        </div>
                    </Card>
                </div>

                <footer className="mt-12 text-center text-aura-gray-500 dark:text-gray-500 text-sm font-medium">
                    <p>&copy; {new Date().getFullYear()} {orgName}. All financial reports generated by Aura AI.</p>
                    <p className="mt-2 italic">This is a read-only snapshot for information purposes only.</p>
                </footer>
            </div>
        </div>
    );
};
