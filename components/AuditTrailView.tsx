
import React from 'react';
import { Card } from './ui/Card';
import type { AuditLog } from '../types';

interface AuditTrailViewProps {
    logs: AuditLog[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Audit Trail</h2>
                <p className="text-gray-400 mt-1">A complete, unchangeable history of all activities.</p>
            </div>
            <Card>
                <div className="overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-dark-tertiary">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-400">Timestamp</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">User</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-dark-secondary/50">
                                    <td className="p-4 text-gray-400 text-sm whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="p-4 text-white font-medium">{log.user}</td>
                                    <td className="p-4 text-gray-300">{log.action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
