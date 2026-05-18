
import React from 'react';

export const LegalView: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black mb-1 text-gray-900 dark:text-white tracking-tight">
                {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-12">Last Updated: February 2025</p>

            <div className="space-y-12 text-gray-600 dark:text-gray-300">
                <section className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
                    <p className="leading-relaxed font-medium">Welcome to O-Heidi AI (Aura Finance). We are committed to protecting your personal information and your right to privacy. This document outlines how we handle your business data with the highest security standards.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-brand-cyan pl-4">2. Information We Collect</h2>
                    <p className="leading-relaxed font-medium">We collect information that you provide to us when you register for the Services, link bank accounts via Mono/Okra, upload receipts, or otherwise when you contact us. This includes transaction narrations, amounts, and metadata.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-brand-purple pl-4">3. How We Use Your Information</h2>
                    <p className="leading-relaxed font-medium">We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-brand-cyan pl-4">4. Sharing Your Information</h2>
                    <p className="leading-relaxed font-medium">We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your financial data to third parties.</p>
                </section>

                {type === 'privacy' ? (
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-brand-purple pl-4">5. Data Retention</h2>
                        <p className="leading-relaxed font-medium">We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law. You can request account deletion at any time via Settings.</p>
                    </section>
                ) : (
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-brand-purple pl-4">5. User Obligations</h2>
                        <p className="leading-relaxed font-medium">As a user of our Services, you agree to provide true, accurate, current, and complete information and to maintain the security of your password and identification. You are responsible for all activity that occurs under your account.</p>
                    </section>
                )}
            </div>
        </div>
    );
};
