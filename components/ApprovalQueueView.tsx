
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { autonomousActionService, AutonomousAction } from '../services/autonomousActionService';
import { useCurrency } from './ui/CurrencyProvider';
import { useToast } from './ui/Toast';

export const ApprovalQueueView: React.FC = () => {
    const [pendingActions, setPendingActions] = useState<AutonomousAction[]>([]);
    const { formatAmount } = useCurrency();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchActions = () => {
            const allActions = autonomousActionService.getHistory();
            setPendingActions(allActions.filter(a => a.status === 'pending'));
        };
        fetchActions();
        const interval = setInterval(fetchActions, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleAuthorize = async (id: string) => {
        const success = await autonomousActionService.authorizeAction(id);
        if (success) {
            showToast('Action authorized successfully', 'success');
            setPendingActions(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleReject = async (id: string) => {
        const success = await autonomousActionService.rejectAction(id);
        if (success) {
            showToast('Action rejected', 'info');
            setPendingActions(prev => prev.filter(a => a.id !== id));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Aura Approval Queue</h2>
                <p className="text-gray-400">Review and authorize autonomous actions proposed by your AI workforce.</p>
            </div>

            {pendingActions.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center bg-dark-secondary/30">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-300">Queue is Empty</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">When Aura's agents identify tasks that require your attention, they will appear here for approval.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {pendingActions.map(action => (
                        <Card key={action.id} className="border-l-4 border-l-brand-cyan hover:border-l-white transition-all">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                            action.priority === 'High' ? 'border-red-500 text-red-500 bg-red-500/10' :
                                            action.priority === 'Medium' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                                            'border-blue-500 text-blue-500 bg-blue-500/10'
                                        }`}>{action.priority} Priority</span>
                                        <span className="text-xs text-gray-500">{new Date(action.timestamp).toLocaleString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{action.description}</h3>
                                    <div className="bg-dark-primary/50 p-4 rounded-xl border border-white/5 mb-4">
                                        <p className="text-xs text-brand-cyan uppercase font-bold mb-1">Aura's Reasoning:</p>
                                        <p className="text-sm text-gray-300 italic">"{action.reasoning}"</p>
                                    </div>
                                    {action.metadata && (
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                            {Object.entries(action.metadata).map(([key, value]) => (
                                                <div key={key} className="bg-dark-tertiary px-3 py-1 rounded-full border border-white/5">
                                                    <span className="capitalize text-gray-500">{key}:</span> <span className="text-gray-300 font-medium">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex md:flex-col gap-3 justify-center">
                                    <button
                                        onClick={() => handleAuthorize(action.id)}
                                        className="flex-grow md:flex-grow-0 px-6 py-2.5 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        Authorize
                                    </button>
                                    <button
                                        onClick={() => handleReject(action.id)}
                                        className="flex-grow md:flex-grow-0 px-6 py-2.5 bg-dark-tertiary text-gray-300 font-bold rounded-xl hover:bg-red-500/20 hover:text-red-500 border border-white/5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
