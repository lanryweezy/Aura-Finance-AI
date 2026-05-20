
import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import type { AuditLog } from '../types';

interface AuditTrailViewProps {
    logs: AuditLog[];
}

const DiffTable: React.FC<{ before: any; after: any }> = ({ before, after }) => {
    const allKeys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]))
        .filter(k => k !== 'id' && k !== 'joinedAt' && k !== 'lastUpdated');

    const changes = allKeys.filter(k => JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k]));

    if (changes.length === 0) return <span className="text-gray-500 italic">Metadata update only</span>;

    return (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/5 bg-black/20">
            <table className="w-full text-left text-[10px]">
                <thead className="bg-white/5">
                    <tr>
                        <th className="p-2 text-gray-400 uppercase font-black">Field</th>
                        <th className="p-2 text-gray-400 uppercase font-black">Original</th>
                        <th className="p-2 text-gray-400 uppercase font-black">Changed To</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {changes.map(key => (
                        <tr key={key} className="group hover:bg-white/5 transition-colors">
                            <td className="p-2 font-black text-gray-500 uppercase tracking-tighter">{key.replace(/([A-Z])/g, ' $1')}</td>
                            <td className="p-2 text-red-400/80 font-medium italic line-through decoration-red-500/50">
                                {typeof before?.[key] === 'object' ? '...' : String(before?.[key] ?? 'None')}
                            </td>
                            <td className="p-2 text-green-400 font-bold">
                                {typeof after?.[key] === 'object' ? '...' : String(after?.[key] ?? 'None')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
    const [filterModule, setFilterModule] = useState<string>('All');

    const modules = useMemo(() => {
        const uniqueModules = new Set(logs.map(log => log.module || 'General'));
        return ['All', ...Array.from(uniqueModules).sort()];
    }, [logs]);

    const filteredLogs = useMemo(() => {
        if (filterModule === 'All') return logs;
        return logs.filter(log => (log.module || 'General') === filterModule);
    }, [logs, filterModule]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Trail</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">A complete, unchangeable history of all activities.</p>
                </div>
                 <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Module:</span>
                    <select 
                        value={filterModule} 
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-2.5 text-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all"
                    >
                        {modules.map(mod => (
                            <option key={mod} value={mod}>{mod}</option>
                        ))}
                    </select>
                </div>
            </div>
            <Card className="overflow-hidden border-gray-100 dark:border-white/5 shadow-xl">
                <div className="overflow-x-auto max-h-[calc(100vh-300px)]">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-dark-tertiary">
                            <tr>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Timestamp</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Module</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">User</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-dark-secondary/50 transition-colors">
                                    <td className="p-4 text-gray-500 dark:text-gray-400 text-xs font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                                            log.module === 'Payroll' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                            log.module === 'Transactions' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' :
                                            log.module === 'Receivables' ? 'bg-brand-cyan/10 text-cyan-600 dark:text-brand-cyan border-brand-cyan/20' :
                                            log.module === 'Payables' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
                                            'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
                                        }`}>
                                            {log.module || 'General'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-900 dark:text-white font-bold text-sm">{log.user}</td>
                                    <td className="p-4">
                                        <div className="text-gray-900 dark:text-white text-sm font-bold">{log.action}</div>
                                        {(log.before || log.after) && (
                                            <DiffTable before={log.before} after={log.after} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center p-12 text-gray-400 font-medium">No activity found for this filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
