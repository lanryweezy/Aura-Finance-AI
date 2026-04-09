
import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';

interface TourStep {
    target: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
    {
        target: 'dashboard-welcome',
        title: 'Welcome to Aura!',
        content: 'Your financial nerve center. View real-time cash flow, net flow, and tax estimates here.',
        position: 'bottom'
    },
    {
        target: 'ai-advisor-panel',
        title: 'AI Advisor',
        content: 'Powered by Gemini, this panel provides personalized strategic insights to grow your business.',
        position: 'left'
    },
    {
        target: 'quick-actions-bar',
        title: 'Efficiency Tools',
        content: 'Scan receipts with AI, create invoices, and run payroll in just a few clicks.',
        position: 'bottom'
    },
    {
        target: 'sidebar-nav',
        title: 'Seamless Navigation',
        content: 'Access your CRM, projects, and detailed reports from this intuitive sidebar.',
        position: 'right'
    }
];

export const OnboardingTour: React.FC = () => {
    const [stepIndex, setStepIndex] = useState(-1);
    const { showToast } = useToast();

    useEffect(() => {
        const hasCompletedTour = localStorage.getItem('aura_tour_completed');
        if (!hasCompletedTour) {
            setTimeout(() => setStepIndex(0), 2000);
        }
    }, []);

    const handleNext = () => {
        if (stepIndex < TOUR_STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setStepIndex(-1);
        localStorage.setItem('aura_tour_completed', 'true');
        showToast('Onboarding complete! Enjoy Aura.', 'success');
    };

    if (stepIndex === -1) return null;

    const currentStep = TOUR_STEPS[stepIndex];

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Dark Overlay with Hole (Conceptual for demo, simplified implementation) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <div className="bg-dark-tertiary border border-brand-cyan/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,245,212,0.2)] max-w-sm w-full animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] uppercase font-bold text-brand-cyan tracking-widest">Step {stepIndex + 1} of {TOUR_STEPS.length}</span>
                         <button onClick={handleComplete} className="text-gray-500 hover:text-white text-xs">Skip Tour</button>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {currentStep.content}
                    </p>
                    <div className="flex gap-3">
                        {stepIndex > 0 && (
                            <button
                                onClick={() => setStepIndex(stepIndex - 1)}
                                className="flex-1 py-2 rounded-xl border border-gray-700 text-gray-300 font-semibold hover:bg-white/5 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex-1 py-2 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80 transition-all shadow-lg shadow-brand-cyan/10"
                        >
                            {stepIndex === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next Step'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Spotlight Pointer Effect (Visual cue) */}
            <div className="absolute top-4 left-4 text-brand-cyan animate-bounce hidden lg:block">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            </div>
        </div>
    );
};
