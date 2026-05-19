
import React, { useState } from 'react';
import { Spinner } from '../ui/Spinner';

interface ConfigProps {
    onConnect: (config: any) => void;
    isConnecting: boolean;
}

export const SlackConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => {
    const [webhook, setWebhook] = useState('');
    return (
        <div className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Incoming Webhook URL</label>
                <input type="text" value={webhook} onChange={e => setWebhook(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" />
            </div>
            <button onClick={() => onConnect({ webhook })} disabled={isConnecting || !webhook} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Add to Slack'}</button>
        </div>
    );
};

export const TeamsConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => (
    <div className="space-y-4 text-center">
        <p className="text-gray-400 text-sm">Integrate Aura with Microsoft Teams to receive real-time approvals.</p>
        <button onClick={() => onConnect({})} disabled={isConnecting} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Install Teams App'}</button>
    </div>
);

export const ClickUpConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => {
    const [token, setToken] = useState('');
    return (
        <div className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Personal API Token</label>
                <input type="password" value={token} onChange={e => setToken(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" placeholder="pk_..." />
            </div>
            <button onClick={() => onConnect({ token })} disabled={isConnecting || !token} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Connect ClickUp'}</button>
        </div>
    );
};

export const UberConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => (
    <div className="space-y-4 text-center">
        <p className="text-gray-400 text-sm">Link your Uber for Business account to automate trip receipt ingestion.</p>
        <button onClick={() => onConnect({})} disabled={isConnecting} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Link Uber Account'}</button>
    </div>
);
