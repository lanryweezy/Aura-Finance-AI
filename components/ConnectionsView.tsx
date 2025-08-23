
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { fetchConnections, simulateConnect, unlinkConnection, syncConnection } from '../services/connectionService';
import type { BankConnection } from '../types';

interface ConnectionsViewProps {
    onConnectionsUpdated: () => void;
}

const ConnectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConnect: (provider: 'mono' | 'okra') => Promise<void>;
    isConnecting: boolean;
}> = ({ isOpen, onClose, onConnect, isConnecting }) => {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-lg shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-white mb-2">Link a New Bank Account</h3>
                <p className="text-gray-400 mb-8">Securely connect your bank account using one of our trusted partners.</p>
                
                {isConnecting ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <Spinner />
                        <p className="mt-4 text-brand-cyan animate-pulse">Initializing secure widget...</p>
                        <p className="mt-2 text-sm text-gray-500">Please follow the instructions in the popup window.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={() => onConnect('mono')} className="p-8 border-2 border-gray-700 rounded-lg hover:border-brand-cyan hover:bg-dark-secondary transition-all flex flex-col items-center justify-center">
                            <img src="https://mono.co/images/mono-logo.svg" alt="Mono Logo" className="h-10 mb-3" />
                            <p className="text-white font-semibold">Connect with Mono</p>
                        </button>
                        <button onClick={() => onConnect('okra')} className="p-8 border-2 border-gray-700 rounded-lg hover:border-brand-pink hover:bg-dark-secondary transition-all flex flex-col items-center justify-center">
                             <img src="https://global-uploads.webflow.com/6242c1d04a62705a1e6878b6/6242c1d04a6270380c687910_Okra-logo.svg" alt="Okra Logo" className="h-8 mb-4"/>
                             <p className="text-white font-semibold">Connect with Okra</p>
                        </button>
                    </div>
                )}
                 <button onClick={onClose} className="mt-8 text-gray-400 hover:text-white">Cancel</button>
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
    const [connections, setConnections] = useState<BankConnection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadConnections = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchConnections();
            setConnections(data);
        } catch (error) {
            console.error("Failed to fetch connections:", error);
            // Handle error UI
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConnections();
    }, [loadConnections]);
    
    const handleConnect = async (provider: 'mono' | 'okra') => {
        setIsConnecting(true);
        try {
            await simulateConnect(provider);
            onConnectionsUpdated(); // Notify App.tsx to reload all data
            setIsModalOpen(false); // Close modal on success
            await loadConnections(); // Refresh local list
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsConnecting(false);
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
        await syncConnection(id);
        onConnectionsUpdated();
        await loadConnections();
        setSyncingId(null);
    }


    return (
        <>
            <ConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConnect={handleConnect} isConnecting={isConnecting}/>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Bank Connections</h2>
                        <p className="text-gray-400 mt-1">Manage your linked bank accounts for automatic transaction syncing.</p>
                    </div>
                     <button onClick={() => setIsModalOpen(true)} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        Link New Account
                    </button>
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
