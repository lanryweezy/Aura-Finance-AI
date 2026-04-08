
import React from 'react';

export const ComingSoon: React.FC<{ featureName: string }> = ({ featureName }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-dark-tertiary/20 rounded-3xl border border-dashed border-gray-700">
        <div className="w-16 h-16 bg-brand-cyan/10 rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00F5D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="m16 8-4 4-4-4"/><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/></svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{featureName} is coming soon!</h3>
        <p className="text-gray-400 max-w-md">We're working hard to bring this feature to you. Join our newsletter to get notified when it's ready.</p>
        <button className="mt-6 px-6 py-2 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-colors">
            Notify Me
        </button>
    </div>
);
