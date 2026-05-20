
import React from 'react';
import { Spinner } from '../ui/Spinner';

interface ConfigProps {
    onConnect: (config: any) => void;
    isConnecting: boolean;
}

export const HubSpotConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => (
    <div className="space-y-4 text-center">
        <p className="text-gray-400 text-sm">Connect HubSpot to sync your contacts and sales pipeline with Aura.</p>
        <button onClick={() => onConnect({})} disabled={isConnecting} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Authorize HubSpot'}</button>
    </div>
);

export const SalesforceConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => (
    <div className="space-y-4 text-center">
        <p className="text-gray-400 text-sm">Integrate Salesforce to automate high-volume invoicing workflows.</p>
        <button onClick={() => onConnect({})} disabled={isConnecting} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Authorize Salesforce'}</button>
    </div>
);
