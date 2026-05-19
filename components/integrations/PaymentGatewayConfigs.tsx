
import React, { useState } from 'react';
import { Spinner } from '../ui/Spinner';

interface ConfigProps {
    onConnect: (config: any) => void;
    isConnecting: boolean;
}

export const PaystackConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => {
    const [sk, setSk] = useState('');
    return (
        <div className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Secret Key (sk_live_...)</label>
                <input type="password" value={sk} onChange={e => setSk(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" placeholder="sk_live_..." />
            </div>
            <button onClick={() => onConnect({ sk })} disabled={isConnecting || !sk} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Connect Paystack'}</button>
        </div>
    );
};

export const FlutterwaveConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => {
    const [sk, setSk] = useState('');
    return (
        <div className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Secret Key (FLWSECK-...)</label>
                <input type="password" value={sk} onChange={e => setSk(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" placeholder="FLWSECK-..." />
            </div>
            <button onClick={() => onConnect({ sk })} disabled={isConnecting || !sk} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Connect Flutterwave'}</button>
        </div>
    );
};

export const PagaConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => {
    const [clientId, setClientId] = useState('');
    const [apiKey, setApiKey] = useState('');
    return (
        <div className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Client ID</label>
                <input type="text" value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">API Key</label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" />
            </div>
            <button onClick={() => onConnect({ clientId, apiKey })} disabled={isConnecting || !apiKey} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Connect Paga'}</button>
        </div>
    );
};
