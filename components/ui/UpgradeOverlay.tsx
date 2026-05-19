
import React from 'react';

interface UpgradeOverlayProps {
    title: string;
    description: string;
    requiredPlan: 'Growth' | 'Enterprise';
    onUpgrade: () => void;
}

export const UpgradeOverlay: React.FC<UpgradeOverlayProps> = ({ title, description, requiredPlan, onUpgrade }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/60 dark:bg-dark-primary/60 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-white/10 m-4">
            <div className="max-w-md w-full bg-white dark:bg-dark-secondary p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-brand-cyan/10 dark:bg-brand-cyan/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-cyan"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <p className="text-[10px] font-black uppercase text-brand-cyan tracking-widest mb-2">Upgrade Required</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-10 leading-relaxed">
                    {description}
                </p>
                <button
                    onClick={onUpgrade}
                    className="w-full py-5 bg-brand-cyan text-black font-black rounded-2xl hover:bg-brand-cyan/90 transition-all shadow-xl shadow-brand-cyan/20 active:scale-95 uppercase tracking-widest text-sm"
                >
                    Upgrade to {requiredPlan}
                </button>
                <p className="mt-6 text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">
                    Unlock professional financial tools
                </p>
            </div>
        </div>
    );
};
