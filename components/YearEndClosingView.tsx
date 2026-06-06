
import React from 'react';
import { Card } from './ui/Card';
import type { ClosingPeriod } from '../types';

interface YearEndClosingViewProps {
    history: ClosingPeriod[];
    onCloseYear: (year: number) => void;
}

export const YearEndClosingView: React.FC<YearEndClosingViewProps> = ({ history, onCloseYear }) => {
    const currentYear = new Date().getFullYear();
    const isYearClosed = history.some(h => h.year === currentYear && h.status === 'Closed');

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Year-End Closing Wizard</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Guided workflow to lock books and roll over balances to the next fiscal year.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { step: 1, title: 'Reconciliation', desc: 'Ensure all bank accounts are matched.', status: 'complete' },
                    { step: 2, title: 'Adjustments', desc: 'Post depreciation and accrual entries.', status: 'current' },
                    { step: 3, title: 'Final Review', desc: 'Verify P&L and Balance Sheet accuracy.', status: 'pending' },
                ].map(s => (
                    <Card key={s.step} className={`p-6 border-l-4 ${s.status === 'complete' ? 'border-green-500' : s.status === 'current' ? 'border-brand-cyan' : 'border-gray-200'}`}>
                        <span className="text-[10px] font-black uppercase text-gray-400">Step {s.step}</span>
                        <h4 className="font-bold text-gray-900 dark:text-white mt-1">{s.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                    </Card>
                ))}
            </div>

            <Card className="p-8 border-dashed border-2 border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-dark-tertiary/20">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-brand-cyan/10 rounded-full flex items-center justify-center text-brand-cyan">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Close Books for {currentYear}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                            Once closed, you will no longer be able to add or modify transactions for this fiscal year. Retained earnings will be automatically calculated.
                        </p>
                    </div>
                    <button
                        disabled={isYearClosed}
                        onClick={() => {
                            if (window.confirm(`Are you absolutely sure you want to close the books for ${currentYear}?`)) {
                                onCloseYear(currentYear);
                            }
                        }}
                        className={`px-12 py-4 rounded-2xl font-black text-lg transition-all ${isYearClosed ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-cyan text-black shadow-xl shadow-brand-cyan/30 hover:scale-105 active:scale-95'}`}
                    >
                        {isYearClosed ? 'Year is Closed' : `Close Fiscal Year ${currentYear}`}
                    </button>
                </div>
            </Card>

            <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-widest">Closing History</h4>
                <div className="space-y-2">
                    {history.map(h => (
                        <div key={h.id} className="flex justify-between items-center p-4 bg-white dark:bg-dark-tertiary rounded-xl border border-gray-100 dark:border-white/5">
                            <div>
                                <span className="font-bold text-gray-900 dark:text-white">Fiscal Year {h.year}</span>
                                <p className="text-[10px] text-gray-400 font-mono">Closed on {h.closedAt} by {h.closedBy}</p>
                            </div>
                            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded-full border border-green-500/20">
                                {h.status}
                            </span>
                        </div>
                    ))}
                    {history.length === 0 && <p className="text-center text-gray-400 py-8 italic">No closing records found.</p>}
                </div>
            </div>
        </div>
    );
};
