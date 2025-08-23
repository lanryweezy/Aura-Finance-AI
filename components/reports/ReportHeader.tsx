
import React from 'react';
import type { ReportPeriod, Project } from '../../types';

interface ReportHeaderProps {
    activeReport: 'p&l' | 'balance_sheet' | 'cash_flow' | 'trial_balance';
    setActiveReport: (report: 'p&l' | 'balance_sheet' | 'cash_flow' | 'trial_balance') => void;
    reportPeriod: ReportPeriod;
    setReportPeriod: (period: ReportPeriod) => void;
    comparePeriod: ReportPeriod | null;
    setComparePeriod: (period: ReportPeriod | null) => void;
    onPrint: () => void;
    projects: Project[];
    projectFilter: string;
    setProjectFilter: (id: string) => void;
}

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const ReportHeader: React.FC<ReportHeaderProps> = ({ 
    activeReport, setActiveReport, reportPeriod, setReportPeriod, onPrint, projects, projectFilter, setProjectFilter 
}) => {

    const handlePresetChange = (preset: string) => {
        const now = new Date();
        let start, end;

        switch(preset) {
            case 'this_month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last_month':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'this_quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), quarter * 3, 1);
                end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
                break;
            case 'year_to_date':
                 start = new Date(now.getFullYear(), 0, 1);
                 end = now;
                 break;
            default:
                return;
        }
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        setReportPeriod({ start, end });
    };

    const handleDateChange = (field: 'start' | 'end', value: string) => {
        setReportPeriod({
            ...reportPeriod,
            [field]: new Date(value),
        });
    };

    const TABS = [
        { id: 'p&l', label: 'P&L Statement' },
        { id: 'balance_sheet', label: 'Balance Sheet' },
        { id: 'cash_flow', label: 'Cash Flow' },
        { id: 'trial_balance', label: 'Trial Balance' },
    ] as const;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Financial Reports</h2>
                    <p className="text-gray-400 mt-1">Analyze your performance and financial health.</p>
                </div>
                 <button onClick={onPrint} className="no-print bg-brand-cyan text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors hover:bg-brand-cyan/80 disabled:bg-gray-600">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Print Report
                </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 p-4 bg-dark-tertiary rounded-xl">
                 <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-gray-400">Start Date</label>
                    <input type="date" value={formatDateForInput(reportPeriod.start)} onChange={(e) => handleDateChange('start', e.target.value)} className="w-full mt-1 bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white" />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-gray-400">End Date</label>
                    <input type="date" value={formatDateForInput(reportPeriod.end)} onChange={(e) => handleDateChange('end', e.target.value)} className="w-full mt-1 bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white" />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-gray-400">Presets</label>
                    <select onChange={(e) => handlePresetChange(e.target.value)} className="w-full mt-1 bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white">
                        <option>Custom Range</option>
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="this_quarter">This Quarter</option>
                        <option value="year_to_date">Year to Date</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-gray-400">Project</label>
                    <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="w-full mt-1 bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white">
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4 border-b-2 border-gray-800 flex items-center gap-2">
                {TABS.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveReport(tab.id)}
                        className={`py-2 px-4 text-sm font-semibold transition-colors ${activeReport === tab.id ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-gray-400 hover:text-white'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
