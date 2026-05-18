
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
            default: return type;
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Usage Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                {usageStats.map(stat => (
                    <Card key={stat.type} className="bg-white dark:bg-dark-secondary/40 border-gray-100 dark:border-white/5 shadow-md">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-2">{getUsageLabel(stat.type)}</p>
                        <div className="flex justify-between items-end">
                            <h4 className="text-2xl font-black text-gray-900 dark:text-white">{stat.used} <span className="text-sm text-gray-400 font-bold">/ {stat.limit > 10000 ? '∞' : stat.limit}</span></h4>
                            <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full transition-all duration-1000 ${stat.used >= stat.limit ? 'bg-red-500' : 'bg-brand-cyan'}`}
                                    style={{ width: `${Math.min(100, (stat.used / stat.limit) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Choose the right plan for your business</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed">Scale your financial operations with O-Heidi AI. Upgrade or downgrade as your team grows.</p>
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

            <Card className="mt-16 bg-gradient-to-br from-brand-purple/10 via-brand-purple/5 to-transparent border-brand-purple/20 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 relative z-10">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Need a custom enterprise solution?</h3>
                        <p className="text-gray-600 dark:text-gray-400 font-medium max-w-xl">For large organizations requiring dedicated support, audit logs, on-prem AI, and custom integration workflows.</p>
                    </div>
                    <button className="px-8 py-4 bg-brand-purple text-white font-black rounded-2xl hover:bg-brand-purple/90 transition-all shadow-xl shadow-brand-purple/20 active:scale-95 uppercase tracking-widest text-xs whitespace-nowrap">
                        Contact Sales
                    </button>
                </div>
            </Card>
        </div>
    );
};
