
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { billingService } from '../services/billingService';
import { usageService } from '../services/usageService';
import type { SubscriptionTier } from '../types';

import { useToast } from './ui/Toast';

export const SubscriptionView: React.FC = () => {
    const { showToast } = useToast();
    const plans = billingService.getPlans();
    const [currentPlan, setCurrentPlan] = useState(billingService.getCurrentPlan());
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const usageStats = usageService.getUsageStats();

    const handleUpgrade = async (plan: SubscriptionTier) => {
        if (plan.price === 0) {
            setIsLoading(plan.id);
            await billingService.upgradePlan(plan.id);
            setCurrentPlan(plan.id);
            setIsLoading(null);
            return;
        }

        // Randomly pick a gateway for demo, or show a selector
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

    const formatNaira = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
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
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Usage Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                {usageStats.map(stat => (
                    <Card key={stat.type} className="bg-dark-secondary/40 border-white/5">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">{getUsageLabel(stat.type)}</p>
                        <div className="flex justify-between items-end">
                            <h4 className="text-2xl font-bold text-white">{stat.used} <span className="text-sm text-gray-500">/ {stat.limit > 10000 ? '∞' : stat.limit}</span></h4>
                            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full ${stat.used >= stat.limit ? 'bg-red-500' : 'bg-brand-cyan'}`}
                                    style={{ width: `${Math.min(100, (stat.used / stat.limit) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl font-bold text-white mb-4">Choose the right plan for your business</h2>
                <p className="text-gray-400 text-lg">Scale your financial operations with Aura. Upgrade or downgrade at any time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-start">
                {plans.map((plan) => (
                    <div 
                        key={plan.id} 
                        className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                            plan.highlighted 
                            ? 'bg-dark-secondary/80 border-brand-cyan shadow-[0_0_30px_rgba(0,245,212,0.15)] scale-105 z-10' 
                            : 'bg-dark-tertiary/50 border-gray-700 hover:border-gray-500'
                        }`}
                    >
                        {plan.highlighted && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-cyan text-black text-xs font-bold uppercase tracking-wider rounded-full">
                                Most Popular
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        <div className="my-6">
                            <span className="text-4xl font-bold text-white">{formatNaira(plan.price)}</span>
                            <span className="text-gray-400">/month</span>
                        </div>
                        
                        <button
                            onClick={() => handleUpgrade(plan)}
                            disabled={currentPlan === plan.id || !!isLoading}
                            className={`w-full py-3 rounded-xl font-bold transition-all mb-8 ${
                                currentPlan === plan.id
                                ? 'bg-gray-700 text-gray-400 cursor-default'
                                : plan.highlighted
                                    ? 'bg-brand-cyan text-black hover:bg-brand-cyan/80 shadow-lg shadow-brand-cyan/20'
                                    : 'bg-white text-black hover:bg-gray-200'
                            }`}
                        >
                            {isLoading === plan.id ? 'Processing...' : (currentPlan === plan.id ? 'Current Plan' : 'Choose Plan')}
                        </button>

                        <div className="space-y-4">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={`mt-1 flex-shrink-0 ${plan.highlighted ? 'text-brand-cyan' : 'text-gray-400'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                    <span className="text-sm text-gray-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Card className="mt-12 bg-gradient-to-r from-brand-purple/10 to-transparent border-brand-purple/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Need a custom enterprise solution?</h3>
                        <p className="text-gray-400">For large organizations requiring dedicated servers, audit logs, and custom SLA.</p>
                    </div>
                    <button className="px-6 py-3 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-purple/80 transition-colors">
                        Contact Sales
                    </button>
                </div>
            </Card>
        </div>
    );
};
