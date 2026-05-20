
import React, { useState } from 'react';
import { Spinner } from '../ui/Spinner';

interface ConfigProps {
    onConnect: (config: any) => void;
    isConnecting: boolean;
}

export const SeamlessHRConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => {
    const [subdomain, setSubdomain] = useState('');
    const [apiKey, setApiKey] = useState('');
    return (
        <div className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Subdomain</label>
                <input type="text" value={subdomain} onChange={e => setSubdomain(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" placeholder="company" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">API Key</label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" />
            </div>
            <button onClick={() => onConnect({ subdomain, apiKey })} disabled={isConnecting || !apiKey} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Connect SeamlessHR'}</button>
        </div>
    );
};

export const BentoConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => {
    const [apiKey, setApiKey] = useState('');
    return (
        <div className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Bento API Key</label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" />
            </div>
            <button onClick={() => onConnect({ apiKey })} disabled={isConnecting || !apiKey} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Connect Bento'}</button>
        </div>
    );
};

export const GustoConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => (
    <div className="space-y-4 text-center">
        <p className="text-gray-400 text-sm">Automate your US payroll entries by connecting Gusto.</p>
        <button onClick={() => onConnect({})} disabled={isConnecting} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Authorize Gusto'}</button>
    </div>
);

export const DeelConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => (
    <div className="space-y-4 text-center">
        <p className="text-gray-400 text-sm">Sync international payroll and contractor payments from Deel.</p>
        <button onClick={() => onConnect({})} disabled={isConnecting} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Authorize Deel'}</button>
    </div>
);
