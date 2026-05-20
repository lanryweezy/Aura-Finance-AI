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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-3xl p-8 w-full max-w-lg shadow-2xl text-center border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Link Bank Account</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Securely connect your bank account using one of our trusted partners for automated syncing.</p>
                
                {isConnecting ? (
                    <div className="flex flex-col items-center justify-center h-56 bg-gray-50 dark:bg-dark-secondary/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <Spinner />
                        <p className="mt-6 text-brand-cyan font-bold animate-pulse">Initializing secure widget...</p>
                        <p className="mt-2 text-xs font-medium text-gray-400">Please follow the instructions in the popup window.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => onConnect('mono')} className="p-6 border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-brand-cyan hover:bg-gray-50 dark:hover:bg-dark-secondary transition-all flex flex-col items-center justify-center group shadow-sm hover:shadow-md">
                            <div className="h-12 flex items-center mb-4 transition-transform group-hover:scale-110">
                                <img src="https://mono.co/images/mono-logo.svg" alt="Mono Logo" className="h-8" />
                            </div>
                            <p className="text-gray-900 dark:text-white font-bold text-sm">Connect Mono</p>
                        </button>
                        <button onClick={() => onConnect('okra')} className="p-6 border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-brand-pink hover:bg-gray-50 dark:hover:bg-dark-secondary transition-all flex flex-col items-center justify-center group shadow-sm hover:shadow-md">
                             <div className="h-12 flex items-center mb-4 transition-transform group-hover:scale-110">
                                <img src="https://global-uploads.webflow.com/6242c1d04a62705a1e6878b6/6242c1d04a6270380c687910_Okra-logo.svg" alt="Okra Logo" className="h-6"/>
                             </div>
                             <p className="text-gray-900 dark:text-white font-bold text-sm">Connect Okra</p>
                        </button>
                    </div>
                )}
                 <button onClick={onClose} className="mt-8 text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel Connection</button>
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
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-full border border-gray-100 dark:border-white/10 shadow-inner">
            <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor} animate-pulse`}></div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${status.color}`}>{status.text}</span>
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
        } catch (error: any) {
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
        } catch (error: any) {
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
        } catch (error: any) {
            showToast('Sync failed. Please try again.', 'error');
        } finally {
            setSyncingId(null);
        }
    }


    return (
        <>
            <ConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConnect={handleConnect} isConnecting={isConnecting}/>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Bank Connections</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium leading-relaxed">Manage your linked accounts for automatic transaction syncing.</p>
                    </div>
                     <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        Link New Account
                    </button>
                </div>

                <Card className="border-gray-100 dark:border-white/5 shadow-xl overflow-hidden p-0">
                   {isLoading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4">
                            <Spinner />
                            <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Checking active connections...</p>
                        </div>
                   ) : connections.length === 0 ? (
                        <div className="py-24 px-8 text-center flex flex-col items-center max-w-lg mx-auto">
                            <div className="p-6 bg-gray-50 dark:bg-dark-secondary rounded-3xl mb-6 shadow-inner border border-gray-100 dark:border-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Accounts Linked</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Connect your business bank account to start automatically tracking and categorizing every transaction O-Heidi finds.</p>
                            <button onClick={() => setIsModalOpen(true)} className="mt-8 px-8 py-3 rounded-xl border-2 border-brand-cyan text-brand-cyan hover:bg-brand-cyan hover:text-black transition-all font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-cyan/10">Start Linking Process</button>
                        </div>
                   ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                           {connections.map(conn => (
                               <li key={conn.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                   <div className="flex items-center gap-5 flex-1">
                                       <div className={`p-4 rounded-2xl shadow-sm border ${conn.provider === 'mono' ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-pink-50 border-pink-100 dark:bg-pink-900/30 dark:border-pink-800'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={conn.provider === 'mono' ? 'text-blue-600 dark:text-blue-300' : 'text-pink-600 dark:text-pink-300'}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                       </div>
                                       <div>
                                            <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{conn.bankName}</p>
                                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{conn.accountName} • <span className="font-mono">{conn.accountNumber}</span></p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-2">Sync: {new Date(conn.lastSynced).toLocaleString()}</p>
                                       </div>
                                   </div>
                                   <div className="flex flex-wrap items-center justify-center md:justify-end gap-6">
                                        <ConnectionHealthBadge lastSynced={conn.lastSynced} />
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleSync(conn.id)}
                                                disabled={syncingId === conn.id}
                                                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-cyan hover:opacity-80 disabled:text-gray-400 transition-all border border-brand-cyan/30 px-4 py-2 rounded-lg"
                                            >
                                            {syncingId === conn.id ? <Spinner/> :  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>}
                                                Sync
                                            </button>
                                            <button onClick={() => handleUnlink(conn.id)} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-all px-2">Unlink</button>
                                        </div>
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
