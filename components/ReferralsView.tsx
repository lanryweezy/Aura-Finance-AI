import React, { useState, useEffect } from 'react';
import { referralService, ReferralSummary, REFERRAL_CONFIG } from '../services/referralService';
import { useToast } from './ui/Toast';
import { Card } from './ui/Card';

export const ReferralsView: React.FC = () => {
    const { showToast } = useToast();
    const [summary, setSummary] = useState<ReferralSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await referralService.getReferralSummary();
            setSummary(data);
            setLoading(false);
        };
        load();
    }, []);

    const handleCopy = () => {
        if (summary) {
            navigator.clipboard.writeText(summary.referralUrl);
            showToast('Referral link copied to clipboard!', 'success');
        }
    };

    const handleShareWhatsApp = () => {
        if (summary) {
            const text = `Hey! I've been using Aura Finance AI to create and build with AI. Join using my link: ${summary.referralUrl}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        }
    };

    if (loading) {
        return <div className="p-8 animate-pulse"><div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div></div>;
    }

    if (!summary) return <div className="p-8 text-center text-gray-500">Could not load referral data.</div>;

    const limitReached = summary.qualifiedCount >= REFERRAL_CONFIG.limit;

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-4">
                    <span className="bg-gradient-to-r from-brand-cyan to-brand-purple text-transparent bg-clip-text">Invite Friends.</span> Earn More AI Credits.
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    Share your link with friends. When they join and qualify, you earn extra AI credits.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-gray-100 dark:border-white/5 shadow-xl bg-gradient-to-br from-brand-cyan/5 to-transparent">
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Qualified Referrals</h3>
                                <div className="text-4xl font-black text-gray-900 dark:text-white mt-1">
                                    {summary.qualifiedCount} <span className="text-xl text-gray-400">/ {REFERRAL_CONFIG.limit}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Pending</h3>
                                <div className="text-2xl font-bold text-brand-purple mt-1">{summary.pendingCount}</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-cyan transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (summary.qualifiedCount / REFERRAL_CONFIG.limit) * 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-bold text-center">
                                {limitReached
                                    ? "You've invited 5 friends and unlocked all your referral rewards. Thanks for helping us grow!"
                                    : `${summary.remainingSlots} remaining referral opportunities.`}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="border-gray-100 dark:border-white/5 shadow-xl bg-gradient-to-br from-brand-purple/5 to-transparent flex flex-col justify-center items-center p-6 text-center">
                     <div className="p-4 bg-brand-purple/10 rounded-2xl mb-4 text-brand-purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                     </div>
                     <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Bonus Credits</h3>
                     <div className="text-4xl font-black text-gray-900 dark:text-white mt-2">
                        +{summary.creditsEarned.toLocaleString()}
                     </div>
                     <p className="text-xs text-gray-500 mt-2 font-medium">Credits earned from successful invites</p>
                </Card>
            </div>

            <Card className="border-gray-100 dark:border-white/5 shadow-xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Referral Link</h3>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            readOnly
                            value={summary.referralUrl}
                            className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white font-mono font-medium focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleCopy}
                        className="py-4 px-8 bg-brand-cyan text-black font-black rounded-xl hover:bg-brand-cyan/90 transition-all shadow-lg active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        Copy Link
                    </button>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: 'Join Aura Finance AI',
                                    text: `Hey! I've been using Aura Finance AI. Join using my link!`,
                                    url: summary.referralUrl,
                                });
                            } else {
                                handleCopy();
                            }
                        }}
                        className="flex-1 py-3 px-6 bg-gray-100 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                        Share Invite
                    </button>
                    <button
                        onClick={handleShareWhatsApp}
                        className="flex-1 py-3 px-6 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 active:scale-[0.98]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Invite on WhatsApp
                    </button>
                </div>
            </Card>
        </div>
    );
};
