import { useCurrency } from "../ui/CurrencyProvider";

import React from 'react';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';

interface AICFOInsightsProps {
    analysis: string;
    isLoading: boolean;
}

export const AICFOInsights: React.FC<AICFOInsightsProps> = ({ analysis, isLoading }) => {
    return (
        <Card className="bg-white dark:bg-dark-primary h-full border-gray-100 dark:border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-cyan/20 rounded-lg text-brand-cyan shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
                </div>
                <h3 className="text-lg font-bold text-aura-gray-900 dark:text-white">AI Executive Summary</h3>
            </div>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-aura-gray-50 dark:bg-dark-secondary/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 shadow-inner">
                    <Spinner />
                    <p className="mt-4 text-sm font-bold text-aura-gray-400 dark:text-gray-400 animate-pulse">O-Heidi is analyzing performance...</p>
                </div>
            ) : (
               <div className="text-aura-gray-900 dark:text-gray-300 space-y-4 whitespace-pre-wrap text-sm leading-relaxed bg-aura-gray-50 dark:bg-dark-secondary/30 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner">
                {analysis}
               </div>
            )}
        </Card>
    );
};
