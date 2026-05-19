import { monitoringService } from '../services/monitoringService';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { fetchConnections, simulateConnect, unlinkConnection, syncConnection, connectPlaid, processBankStatement } from '../services/connectionService';
import type { BankConnection } from '../types';
import { useToast } from './ui/Toast';

interface ConnectionsViewProps {
    onConnectionsUpdated: () => void;
}

const StatementUploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, password?: string) => Promise<void>;
    isUploading: boolean;
}> = ({ isOpen, onClose, onUpload, isUploading }) => {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-white mb-2 text-center">Upload Bank Statement</h3>
                <p className="text-gray-400 mb-6 text-center text-sm">Upload your PDF or CSV statement for automated ingestion. We support password-protected statements from all major Nigerian banks.</p>

                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-brand-cyan transition-colors cursor-pointer" onClick={() => document.getElementById('statement-upload')?.click()}>
                        <input
                            type="file"
                            id="statement-upload"
                            className="hidden"
                            accept=".pdf,.csv"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        {file ? (
                            <div className="flex items-center justify-center gap-2 text-brand-cyan">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                <span className="font-medium text-xs truncate max-w-[200px]">{file.name}</span>
                            </div>
                        ) : (
                            <div className="text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                <p className="text-sm">Click or drag to upload statement</p>
                                <p className="text-[10px] mt-1">PDF or CSV formats supported</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Statement Password (Optional)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password if PDF is protected"
                            className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2 text-white text-xs"
                        />
                    </div>

                    <button
                        onClick={() => file && onUpload(file, password)}
                        disabled={!file || isUploading}
                        className="w-full bg-brand-cyan text-black font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm"
                    >
                        {isUploading ? <Spinner /> : 'Process Statement'}
                    </button>
                    <button onClick={onClose} className="w-full text-gray-500 text-xs hover:text-white">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const ConnectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConnect: (provider: 'mono' | 'okra' | 'plaid') => Promise<void>;
    isConnecting: boolean;
}> = ({ isOpen, onClose, onConnect, isConnecting }) => {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-2xl shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-white mb-2">Link a New Bank Account</h3>
                <p className="text-gray-400 mb-8 text-sm">Securely connect your bank account using one of our trusted partners.</p>
                
                {isConnecting ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <Spinner />
                        <p className="mt-4 text-brand-cyan animate-pulse">Initializing secure widget...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onClick={() => onConnect('mono')} className="p-6 border-2 border-gray-700 rounded-xl hover:border-brand-cyan hover:bg-dark-secondary transition-all flex flex-col items-center justify-center gap-2">
                            <img src="https://mono.co/images/mono-logo.svg" alt="Mono Logo" className="h-6" />
                            <p className="text-white text-xs font-semibold">Mono (Nigeria)</p>
                        </button>
                        <button onClick={() => onConnect('okra')} className="p-6 border-2 border-gray-700 rounded-xl hover:border-brand-pink hover:bg-dark-secondary transition-all flex flex-col items-center justify-center gap-2">
                             <img src="https://global-uploads.webflow.com/6242c1d04a62705a1e6878b6/6242c1d04a6270380c687910_Okra-logo.svg" alt="Okra Logo" className="h-4"/>
                             <p className="text-white text-xs font-semibold">Okra (Nigeria)</p>
                        </button>
                        <button onClick={() => onConnect('plaid')} className="p-6 border-2 border-gray-700 rounded-xl hover:border-brand-purple hover:bg-dark-secondary transition-all flex flex-col items-center justify-center gap-2">
                             <img src="https://logo.clearbit.com/plaid.com" alt="Plaid Logo" className="h-6 rounded"/>
                             <p className="text-white text-xs font-semibold">Plaid (US/Global)</p>
                        </button>
                    </div>
                )}
                 <button onClick={onClose} className="mt-8 text-gray-500 hover:text-white text-xs">Cancel</button>
            </div>
        </div>
    );
}

const ConnectionHealthBadge: React.FC<{ lastSynced: string }> = ({ lastSynced }) => {
    const hoursAgo = (new Date().getTime() - new Date(lastSynced).getTime()) / (1000 * 60 * 60);
    
    let status: { text: string; color: string; dotColor: string };

    if (hoursAgo <= 24) {
        status = { text: 'Healthy', color: 'text-green-400', dotColor: 'bg-green-400' };
    } else if (hoursAgo <= 72) {
        status = { text: 'Sync Delayed', color: 'text-yellow-400', dotColor: 'bg-yellow-400' };
    } else {
        status = { text: 'Action Required', color: 'text-red-400', dotColor: 'bg-red-400' };
    }

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.dotColor}`}></div>
            <span className={`text-xs ${status.color}`}>{status.text}</span>
        </div>
    );
};


export const ConnectionsView: React.FC<ConnectionsViewProps> = ({ onConnectionsUpdated }) => {
    const { showToast } = useToast();
    const [connections, setConnections] = useState<BankConnection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const loadConnections = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchConnections();
            setConnections(data);
        } catch (error) {
            monitoringService.trackError('UI', error, { message: "Failed to fetch connections:" });
            // Handle error UI
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConnections();
    }, [loadConnections]);
    
    const handleConnect = async (provider: 'mono' | 'okra' | 'plaid') => {
        setIsConnecting(true);
        try {
            if (provider === 'plaid') {
                await connectPlaid();
            } else {
                await simulateConnect(provider);
            }
            onConnectionsUpdated(); // Notify App.tsx to reload all data
            setIsModalOpen(false); // Close modal on success
            await loadConnections(); // Refresh local list
            showToast('Account linked successfully!', 'success');
        } catch (error) {
            showToast((error as Error).message, 'error');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleUploadStatement = async (file: File, password?: string) => {
        setIsUploading(true);
        try {
            await processBankStatement(file, password);
            onConnectionsUpdated();
            setIsUploadModalOpen(false);
            showToast(`Successfully processed statement: ${file.name}`, 'success');
        } catch (error) {
            showToast((error as Error).message, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUnlink = async (id: string) => {
        if(window.confirm("Are you sure you want to unlink this account? This will remove all associated transaction data.")){
            await unlinkConnection(id);
            onConnectionsUpdated(); // Reload all data
            await loadConnections(); // Refresh local list
        }
    };
    
    const handleSync = async (id: string) => {
        setSyncingId(id);
        try {
            await syncConnection(id);
            onConnectionsUpdated();
            await loadConnections();
            showToast('Account synced successfully!', 'success');
        } catch (error) {
            showToast('Sync failed. Please try again.', 'error');
        } finally {
            setSyncingId(null);
        }
    }


    return (
        <>
            <ConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConnect={handleConnect} isConnecting={isConnecting}/>
            <StatementUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUploadStatement} isUploading={isUploading} />
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Bank Connections</h2>
                        <p className="text-gray-400 mt-1">Manage your linked bank accounts and statements for automatic syncing.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsUploadModalOpen(true)} className="bg-dark-secondary hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg border border-gray-700 flex items-center gap-2 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            Upload Statement
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            Link New Account
                        </button>
                    </div>
                </div>

                <Card>
                   {isLoading ? (
                        <div className="text-center p-8"><Spinner /></div>
                   ) : connections.length === 0 ? (
                        <div className="text-center p-12">
                            <h3 className="text-xl font-semibold text-white">No Accounts Linked</h3>
                            <p className="text-gray-400 mt-2">Link your first bank account to start automatically syncing your transactions.</p>
                        </div>
                   ) : (
                        <ul className="divide-y divide-gray-800">
                           {connections.map(conn => (
                               <li key={conn.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                   <div className="flex items-center gap-4 flex-1">
                                       <div className={`p-3 rounded-full ${conn.provider === 'mono' ? 'bg-blue-900/50' : 'bg-pink-900/50'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={conn.provider === 'mono' ? 'text-blue-300' : 'text-pink-300'}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                       </div>
                                       <div>
                                            <p className="font-bold text-white">{conn.bankName}</p>
                                            <p className="text-sm text-gray-400">{conn.accountName} - {conn.accountNumber}</p>
                                            <p className="text-xs text-gray-500 mt-1">Last synced: {new Date(conn.lastSynced).toLocaleString()}</p>
                                       </div>
                                   </div>
                                   <div className="flex items-center gap-4">
                                        <ConnectionHealthBadge lastSynced={conn.lastSynced} />
                                        <button 
                                            onClick={() => handleSync(conn.id)}
                                            disabled={syncingId === conn.id}
                                            className="flex items-center gap-1 text-sm text-brand-cyan hover:text-white disabled:text-gray-500 disabled:cursor-wait"
                                        >
                                           {syncingId === conn.id ? <Spinner/> :  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>}
                                            Sync Now
                                       </button>
                                       <button onClick={() => handleUnlink(conn.id)} className="text-sm text-red-500 hover:text-red-400">Unlink</button>
                                   </div>
                               </li>
                           ))}
                        </ul>
                   )}
                </Card>
            </div>
        </>
    );
};
