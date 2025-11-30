
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { billingService } from '../services/billingService';
import type { SubscriptionTier } from '../types';

export const SubscriptionView: React.FC = () => {
    const plans = billingService.getPlans();
    const [currentPlan, setCurrentPlan] = useState('Free');
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleUpgrade = async (planId: string) => {
        setIsLoading(planId);
        await billingService.upgradePlan(planId);
        setCurrentPlan(planId);
        setIsLoading(null);
        alert(`Successfully switched to ${planId} plan!`);
    };

    const formatNaira = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
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
                            onClick={() => handleUpgrade(plan.id)}
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
