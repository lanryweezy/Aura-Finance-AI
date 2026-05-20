
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { billingService } from '../services/billingService';
import { usageService } from '../services/usageService';
import { monitoringService } from '../services/monitoringService';
import type { SubscriptionTier } from '../types';
import { useCurrency } from './ui/CurrencyProvider';

import { useToast } from './ui/Toast';

export const SubscriptionView: React.FC = () => {
    const { formatAmount } = useCurrency();
    const { showToast } = useToast();
    const plans = billingService.getPlans();
    const [currentPlan, setCurrentPlan] = useState(billingService.getCurrentPlan());
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [usageStats, setUsageStats] = useState<any[]>([]);

    useEffect(() => {
        usageService.getUsageStats().then(setUsageStats);
    }, []);

    const handleUpgrade = async (plan: SubscriptionTier) => {
        if (plan.price === 0) {
            setIsLoading(plan.id);
            await billingService.upgradePlan(plan.id);
            setCurrentPlan(plan.id);
            setIsLoading(null);
            return;
        }

        // Randomly pick a gateway for demo
        const gateway = Math.random() > 0.5 ? 'Paystack' : 'Flutterwave';
        setIsLoading(plan.id);

        const callback = async (ref: string) => {
            monitoringService.log('info', 'BILLING', 'Payment successful', { reference: ref, plan: plan.id });
            await billingService.upgradePlan(plan.id);
            setCurrentPlan(plan.id);
            setIsLoading(null);
            showToast(`Welcome to ${plan.name} plan!`, 'success');
        };

        if (gateway === 'Paystack') {
            billingService.initializePaystack(plan, 'demo@aura.ai', callback);
        } else {
            billingService.initializeFlutterwave(plan, 'demo@aura.ai', callback);
        }
    };

    const getUsageLabel = (type: string) => {
        switch(type) {
            case 'ai_insight': return 'AI Insights';
            case 'ai_chat': return 'AI Chat & Gen';
            case 'ocr_scan': return 'Receipt Scans';
            case 'bank_sync': return 'Bank Syncs';
            case 'invoices_sent': return 'Invoices Sent';
            case 'txn_volume': return 'Monthly Txns';
            default: return type;
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Usage Metrics Section */}
            <div className="bg-white dark:bg-dark-tertiary/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-right hidden md:block">
                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Billing Period</p>
                     <p className="text-sm font-bold text-gray-900 dark:text-white">Ends {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
                    </div>
                    Consumption Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {usageStats.map(stat => (
                        <div key={stat.type} className="space-y-3">
                            <div className="flex justify-between items-end">
                                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest">{getUsageLabel(stat.type)}</p>
                                <span className={`text-[9px] font-black ${stat.used >= stat.limit ? 'text-red-500' : 'text-gray-400'}`}>
                                    {Math.round((stat.used / stat.limit) * 100)}%
                                </span>
                            </div>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white leading-none">
                                {stat.used.toLocaleString()}
                                <span className="text-[10px] text-gray-400 font-bold ml-1">/ {stat.limit > 100000 ? '∞' : stat.limit.toLocaleString()}</span>
                            </h4>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${stat.used >= stat.limit ? 'bg-red-500' : 'bg-brand-cyan'}`}
                                    style={{ width: `${Math.min(100, (stat.used / stat.limit) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Choose the right plan for your business</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed">Scale your financial operations with Aura AI. Upgrade or downgrade as your team grows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 items-start">
                {plans.map((plan) => (
                    <div 
                        key={plan.id} 
                        className={`relative p-8 rounded-[2rem] border transition-all duration-500 ${
                            plan.highlighted 
                            ? 'bg-white dark:bg-dark-secondary/80 border-brand-cyan shadow-2xl shadow-brand-cyan/20 scale-105 z-10'
                            : 'bg-white dark:bg-dark-tertiary/50 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-xl'
                        }`}
                    >
                        {plan.highlighted && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-brand-cyan text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                Most Popular
                            </div>
                        )}
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{plan.name}</h3>
                        <div className="my-8">
                            <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{formatAmount(plan.price, { maximumFractionDigits: 0 })}</span>
                            <span className="text-gray-500 dark:text-gray-400 font-bold ml-1">/mo</span>
                        </div>
                        
                        <button
                            onClick={() => handleUpgrade(plan)}
                            disabled={currentPlan === plan.id || !!isLoading}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all mb-10 active:scale-[0.98] ${
                                currentPlan === plan.id
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-default'
                                : plan.highlighted
                                    ? 'bg-brand-cyan text-black hover:bg-brand-cyan/90 shadow-xl shadow-brand-cyan/20'
                                    : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-xl'
                            }`}
                        >
                            {isLoading === plan.id ? 'Processing...' : (currentPlan === plan.id ? 'Current Plan' : 'Select Plan')}
                        </button>

                        <div className="space-y-5">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-brand-cyan' : 'text-gray-400 dark:text-gray-500'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300 leading-tight">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                <Card className="bg-white dark:bg-dark-tertiary/30 border-gray-100 dark:border-white/5 p-8 rounded-[2rem]">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-purple"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                         Billing Inquiries
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                        Have questions about your invoice or need to update your payment method? Our billing team is ready to help.
                    </p>
                    <button className="text-brand-cyan font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                        Message Billing Support
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </button>
                </Card>

                <Card className="bg-gradient-to-br from-brand-purple/10 via-brand-purple/5 to-transparent border-brand-purple/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-purple/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 tracking-tight">Enterprise Scale</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                        Dedicated support, on-prem AI, and custom compliance for large-scale operations.
                    </p>
                    <button className="px-8 py-3 bg-brand-purple text-white font-black rounded-xl hover:bg-brand-purple/90 transition-all shadow-xl shadow-brand-purple/20 active:scale-95 uppercase tracking-widest text-[10px]">
                        Talk to Sales
                    </button>
                </Card>
            </div>

            <div className="mt-16 text-center">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Secure payments processed by</p>
                 <div className="flex items-center justify-center gap-8 mt-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Paystack_logo.png" alt="Paystack" className="h-6 object-contain" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Flutterwave_Logo.png" alt="Flutterwave" className="h-4 object-contain" />
                 </div>
            </div>
        </div>
    );
};
