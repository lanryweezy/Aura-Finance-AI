
import React, { useState } from 'react';
import { Spinner } from '../ui/Spinner';

interface ConfigProps {
    onConnect: (config: any) => void;
    isConnecting: boolean;
}

export const ShopifyConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => {
    const [shop, setShop] = useState('');
    const [token, setToken] = useState('');
    return (
        <div className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Shop Domain</label>
                <input type="text" value={shop} onChange={e => setShop(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" placeholder="aura-store.myshopify.com" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Admin API Token</label>
                <input type="password" value={token} onChange={e => setToken(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" />
            </div>
            <button onClick={() => onConnect({ shop, token })} disabled={isConnecting || !token} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Connect Shopify'}</button>
        </div>
    );
};

export const AmazonBusinessConfig: React.FC<ConfigProps> = ({ onConnect, isConnecting }) => {
    const [email, setEmail] = useState('');
    return (
        <div className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Account Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white" />
            </div>
            <button onClick={() => onConnect({ email })} disabled={isConnecting || !email} className="w-full bg-brand-cyan text-black font-bold py-3 rounded-xl">{isConnecting ? <Spinner /> : 'Sync Amazon Business'}</button>
        </div>
    );
};
