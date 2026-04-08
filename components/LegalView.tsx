
import React from 'react';

export const LegalView: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-4xl font-bold mb-8">
                {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
            <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
                <p>Last Updated: October 2023</p>
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                    <p>Welcome to Aura Finance AI. We are committed to protecting your personal information and your right to privacy.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                    <p>We collect information that you provide to us when you register for the Services, express an interest in obtaining information about us or our products and Services, or otherwise when you contact us.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                    <p>We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Sharing Your Information</h2>
                    <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
                </section>
                {type === 'privacy' ? (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
                        <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law.</p>
                    </section>
                ) : (
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. User Obligations</h2>
                        <p>As a user of our Services, you agree to provide true, accurate, current, and complete information and to maintain the security of your password and identification.</p>
                    </section>
                )}
            </div>
        </div>
    );
};
