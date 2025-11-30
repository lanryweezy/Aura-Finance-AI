
import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import type { AuditLog } from '../types';

interface AuditTrailViewProps {
    logs: AuditLog[];
}

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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Audit Trail</h2>
                    <p className="text-gray-400 mt-1">A complete, unchangeable history of all activities.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Filter by Module:</span>
                    <select 
                        value={filterModule} 
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                    >
                        {modules.map(mod => (
                            <option key={mod} value={mod}>{mod}</option>
                        ))}
                    </select>
                </div>
            </div>
            <Card>
                <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-dark-tertiary">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-400">Timestamp</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Module</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">User</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-dark-secondary/50">
                                    <td className="p-4 text-gray-400 text-sm whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${
                                            log.module === 'Payroll' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            log.module === 'Transactions' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            log.module === 'Receivables' ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20' :
                                            log.module === 'Payables' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>
                                            {log.module || 'General'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white font-medium">{log.user}</td>
                                    <td className="p-4 text-gray-300">{log.action}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-gray-500">No activity found for this filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
