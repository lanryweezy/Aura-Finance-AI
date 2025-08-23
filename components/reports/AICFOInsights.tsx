
import React from 'react';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';

interface AICFOInsightsProps {
    analysis: string;
    isLoading: boolean;
}

export const AICFOInsights: React.FC<AICFOInsightsProps> = ({ analysis, isLoading }) => {
    return (
        <Card className="bg-dark-primary h-full">
            <h3 className="text-lg font-bold text-white mb-4">AI Executive Summary</h3>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                    <Spinner />
                    <p className="mt-2 text-sm text-gray-400">Analyzing performance...</p>
                </div>
            ) : (
               <div className="text-gray-300 space-y-4 whitespace-pre-wrap text-sm leading-relaxed">{analysis}</div>
            )}
        </Card>
    );
};
