
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { whatsappService, WhatsAppMessage } from '../services/whatsappService';
import { useToast } from './ui/Toast';
import { useAppStore } from '../store/useAppStore';

export const WhatsAppInboxView: React.FC = () => {
    const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
    const { showToast } = useToast();
    const { setActiveView } = useAppStore();

    useEffect(() => {
        setMessages(whatsappService.getMessages());
    }, []);

    const handleProcess = async (id: string) => {
        const success = await whatsappService.processMessage(id);
        if (success) {
            showToast("Transaction extracted and sent to AI Chat for final review", "success");
            setMessages([...whatsappService.getMessages()]);
            // Simulate navigation to chat to finish processing
            setTimeout(() => setActiveView('chat'), 1500);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.1" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">WhatsApp Finance Inbox</h2>
                    <p className="text-gray-400">Aura is monitoring your WhatsApp business chat for payments and receipts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {messages.map(msg => (
                        <Card key={msg.id} className={`border-l-4 ${msg.status === 'processed' ? 'border-l-gray-600 opacity-50' : 'border-l-green-500'} hover:translate-x-1 transition-all`}>
                            <div className="flex gap-4">
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-green-400">{msg.sender}</span>
                                        <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-gray-200 mb-4">{msg.text}</p>

                                    {msg.imageUrl && (
                                        <div className="mb-4 rounded-xl overflow-hidden border border-white/5 bg-black/20 p-2">
                                            <img src={msg.imageUrl} alt="WhatsApp attachment" className="max-h-64 rounded-lg mx-auto" />
                                        </div>
                                    )}

                                    {msg.status === 'unprocessed' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleProcess(msg.id)}
                                                className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                                AI Bookkeeping
                                            </button>
                                            <button className="px-4 py-2 bg-dark-tertiary text-gray-400 text-xs font-bold rounded-lg hover:text-white transition-colors">Ignore</button>
                                        </div>
                                    )}
                                    {msg.status === 'processed' && (
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            AI Processed
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                        <h3 className="text-lg font-bold text-white mb-4">WhatsApp Moat</h3>
                        <div className="space-y-4 text-sm text-gray-400">
                            <p>Aura uses **Vision AI** to understand bank transfer screenshots and WhatsApp payment receipts.</p>
                            <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                                <p className="text-xs font-mono text-green-400 mb-1">Status:</p>
                                <p className="text-xs">Monitoring +234 WhatsApp Gateway...</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Integrations</h3>
                        <div className="flex items-center gap-3 p-3 bg-dark-secondary rounded-xl border border-white/5">
                            <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.1" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            </div>
                            <div className="flex-grow">
                                <p className="text-xs font-bold text-white">WhatsApp Business</p>
                                <p className="text-[10px] text-gray-500">Connected</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
