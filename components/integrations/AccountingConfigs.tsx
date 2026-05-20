
import React from 'react';
import { Spinner } from '../ui/Spinner';

interface ConfigProps {
    onConnect: (config: any) => void;
    isConnecting: boolean;
}

export const QuickBooksConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => (
    <div className="space-y-4 text-center">
        <p className="text-gray-400 text-sm">Connect your QuickBooks Online account to sync your ledger.</p>
        <button onClick={() => onConnect({})} disabled={isConnecting} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Connect to QuickBooks'}</button>
    </div>
);

export const XeroConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => (
    <div className="space-y-4 text-center">
        <p className="text-gray-400 text-sm">Connect to Xero to keep your financial reports up to date.</p>
        <button onClick={() => onConnect({})} disabled={isConnecting} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Connect to Xero'}</button>
    </div>
);

export const SageConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => (
    <div className="space-y-4 text-center">
        <p className="text-gray-400 text-sm">Connect Sage Accounting for unified financial management.</p>
        <button onClick={() => onConnect({})} disabled={isConnecting} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Connect Sage'}</button>
    </div>
);
