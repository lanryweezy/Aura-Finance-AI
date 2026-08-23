import React from 'react';
import { Tooltip } from './Tooltip';

interface ContextualHelpProps {
    topic: string;
    content: string;
    helpLink?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ topic, content, helpLink }) => {
    return (
        <Tooltip content={content} position="top">
            <button
                className="ml-2 text-gray-400 hover:text-brand-cyan transition-colors context-help-trigger"
                onClick={() => helpLink && window.open(helpLink, '_blank', 'noopener,noreferrer')}
                aria-label={`Help about ${topic}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
            </button>
        </Tooltip>
    );
};
