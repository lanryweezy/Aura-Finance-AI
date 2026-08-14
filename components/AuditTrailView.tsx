import React, { useState, useMemo, useCallback } from 'react';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { Card } from './ui/Card';
import type { AuditLog } from '../types';

interface AuditTrailViewProps {
    logs: AuditLog[];
}

const AuditLogRow = React.memo<{
    log: AuditLog;
    style: React.CSSProperties;
}>(({ log, style }) => {
    return (
        <div style={style} className="flex hover:bg-aura-gray-50/50 dark:hover:bg-dark-secondary/50 transition-colors group border-b border-gray-100 dark:border-gray-800 items-start py-2">
            <div className="w-[25%] p-4 text-aura-gray-500 dark:text-gray-400 text-xs font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</div>
            <div className="w-[15%] p-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                    log.module === 'Payroll' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                    log.module === 'Transactions' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' :
                    log.module === 'Receivables' ? 'bg-brand-cyan/10 text-cyan-600 dark:text-brand-cyan border-brand-cyan/20' :
                    log.module === 'Payables' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' :
                    'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
                }`}>
                    {log.module || 'General'}
                </span>
            </div>
            <div className="w-[20%] p-4 text-aura-gray-900 dark:text-white font-bold text-sm truncate">{log.user}</div>
            <div className="w-[40%] p-4">
                <div className="text-aura-gray-900 dark:text-white text-sm font-bold truncate">{log.action}</div>
                {(log.before || log.after) && (
                    <DiffTable before={log.before} after={log.after} />
                )}
            </div>
        </div>
    );
});
const DiffTable: React.FC<{ before: any; after: any }> = ({ before, after }) => {
    const allKeys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]))
        .filter(k => k !== 'id' && k !== 'joinedAt' && k !== 'lastUpdated');

    const changes = allKeys.filter(k => JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k]));

    if (changes.length === 0) return <span className="text-aura-gray-500 dark:text-gray-500 italic">Metadata update only</span>;

    return (
        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-white/5 bg-aura-gray-50/50 dark:bg-black/20">
            <table className="w-full text-left text-[10px]">
                <thead className="bg-aura-gray-100/50 dark:bg-white/5">
                    <tr>
                        <th className="p-2 text-aura-gray-500 dark:text-gray-400 uppercase font-black">Field</th>
                        <th className="p-2 text-aura-gray-500 dark:text-gray-400 uppercase font-black">Original</th>
                        <th className="p-2 text-aura-gray-500 dark:text-gray-400 uppercase font-black">Changed To</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-aura-gray-200/50 dark:divide-white/5">
                    {changes.map(key => (
                        <tr key={key} className="group hover:bg-aura-gray-200/20 dark:hover:bg-white/5 transition-colors">
                            <td className="p-2 font-black text-aura-gray-500 dark:text-gray-500 uppercase tracking-tighter">{key.replace(/([A-Z])/g, ' $1')}</td>
                            <td className="p-2 text-red-500 dark:text-red-400/80 font-medium italic line-through decoration-red-500/50">
                                {typeof before?.[key] === 'object' ? '...' : String(before?.[key] ?? 'None')}
                            </td>
                            <td className="p-2 text-green-600 dark:text-green-400 font-bold">
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

    const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
        return <AuditLogRow log={filteredLogs[index]} style={style} />;
    }, [filteredLogs]);

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-aura-gray-900 dark:text-white">Audit Trail</h2>
                    <p className="text-aura-gray-500 dark:text-gray-400 mt-1 font-medium italic">A complete, unchangeable history of all activities.</p>
                </div>
                 <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-aura-gray-500 dark:text-gray-400 uppercase tracking-wider">Module:</span>
                    <select 
                        value={filterModule} 
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="bg-aura-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-aura-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all shadow-sm"
                    >
                        {modules.map(mod => (
                            <option key={mod} value={mod}>{mod}</option>
                        ))}
                    </select>
                </div>
            </div>
            <Card className="overflow-hidden border-gray-100 dark:border-white/5 shadow-xl h-full flex flex-col">
                <div className="overflow-x-auto flex flex-col flex-grow relative min-h-[400px]">
                    <div className="flex bg-aura-gray-50 dark:bg-dark-tertiary border-b border-gray-100 dark:border-gray-800 min-w-[800px] flex-shrink-0">
                        <div className="w-[25%] p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400">Timestamp</div>
                        <div className="w-[15%] p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400">Module</div>
                        <div className="w-[20%] p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400">User</div>
                        <div className="w-[40%] p-4 text-xs font-bold uppercase tracking-wider text-aura-gray-500 dark:text-gray-400">Action</div>
                    </div>
                    <div className="flex-grow relative min-w-[800px]">
                        {filteredLogs.length > 0 ? (
                            <AutoSizer>
                                {({ height, width }) => (
                                    <List
                                        height={height}
                                        itemCount={filteredLogs.length}
                                        itemSize={120} // Estimate size due to DiffTable, real apps might need VariableSizeList
                                        width={width}
                                    >
                                        {Row}
                                    </List>
                                )}
                            </AutoSizer>
                        ) : (
                            <div className="flex justify-center items-center h-full text-gray-400 font-medium">
                                No activity found for this filter.
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};
