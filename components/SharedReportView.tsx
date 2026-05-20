
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
