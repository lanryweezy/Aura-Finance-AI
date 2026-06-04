
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
        <div style={style} className="flex hover:bg-dark-secondary/50 border-b border-gray-800 items-center">
            <div className="w-[25%] p-4 text-gray-400 text-sm whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</div>
            <div className="w-[15%] p-4">
                <span className={`text-xs px-2 py-1 rounded-full border ${
                    log.module === 'Payroll' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    log.module === 'Transactions' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    log.module === 'Receivables' ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20' :
                    log.module === 'Payables' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                }`}>
                    {log.module || 'General'}
                </span>
            </div>
            <div className="w-[20%] p-4 text-white font-medium truncate">{log.user}</div>
            <div className="w-[40%] p-4 text-gray-300 truncate">{log.action}</div>
        </div>
    );
});

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
            <Card className="flex-grow p-0 overflow-hidden flex flex-col">
                <div className="flex bg-dark-tertiary border-b border-gray-700 font-semibold text-gray-400 text-sm flex-shrink-0">
                    <div className="w-[25%] p-4">Timestamp</div>
                    <div className="w-[15%] p-4">Module</div>
                    <div className="w-[20%] p-4">User</div>
                    <div className="w-[40%] p-4">Action</div>
                </div>
                <div className="flex-grow relative">
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                height={height}
                                itemCount={filteredLogs.length}
                                itemSize={56}
                                width={width}
                                className="scrollbar-thin"
                            >
                                {Row}
                            </List>
                        )}
                    </AutoSizer>
                    {filteredLogs.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            No activity found for this filter.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
