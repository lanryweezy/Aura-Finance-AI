
import React, { useState } from 'react';
import { View } from '../types';
import { HeroSection } from './landing/HeroSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { SolutionsSection } from './landing/SolutionsSection';
import { AISection } from './landing/AISection';
import { PricingSection } from './landing/PricingSection';
import { TestimonialsSection } from './landing/TestimonialsSection';
import { TrustBadges, PressLogos, ComparisonTable } from './landing/TrustSection';
import { FooterSection } from './landing/FooterSection';
import { Plus, Minus } from 'lucide-react';

interface LandingViewProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigate: (view: View) => void;
  onDemo?: () => void;
}

const faqs = [
  { q: "Is my financial data secure?", a: "Yes. We use bank-grade AES-256 encryption and follow strict Nigerian data protection regulations. Your data is isolated at the tenant level." },
  { q: "How does the AI handle Nigerian taxes?", a: "Aura is pre-configured with FIRS and LIRS rules for VAT (7.5%), WHT, CIT, and NSITF. It generates FIRS-ready reports automatically." },
  { q: "Can I connect multiple bank accounts?", a: "Absolutely. Depending on your plan, you can connect multiple accounts from Zenith, GTBank, Kuda, and many others." },
  { q: "What happens if I go offline?", a: "Aura is a Progressive Web App (PWA) with full offline support. Your changes are queued and synced automatically when you're back online." },
];

export const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onLogin, onNavigate, onDemo }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-dark-primary text-white font-sans selection:bg-brand-cyan selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-dark-primary/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-xl shadow-[0_0_20px_rgba(0,245,212,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
            <span className="text-xl font-black tracking-tight">Aura Finance</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-gray-400 hover:text-brand-cyan transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-bold text-gray-400 hover:text-brand-cyan transition-colors">Pricing</a>
            <button onClick={() => onNavigate('blog')} className="text-sm font-bold text-gray-400 hover:text-brand-cyan transition-colors">Blog</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Sign In</button>
            <button onClick={onGetStarted} className="px-6 py-2.5 bg-white text-black font-black text-sm rounded-xl hover:bg-brand-cyan transition-all active:scale-95 shadow-lg shadow-white/5">Get Started</button>
          </div>
        </div>
      </nav>

      <HeroSection onGetStarted={onGetStarted} onDemo={onDemo} />
      <FeaturesSection />
      <SolutionsSection />
      <AISection />
      <PricingSection />
      <TestimonialsSection />

      {/* FAQ Section */}
      <section className="py-32 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-cyan mb-4">FAQ</h2>
            <p className="text-4xl font-black tracking-tight">Common Questions</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer" open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)}>
                <summary className="flex items-center justify-between font-black text-lg list-none">
                  {faq.q}
                  <span className="text-brand-cyan group-open:rotate-45 transition-transform">
                    {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                  </span>
                </summary>
                <p className="mt-4 text-gray-400 font-medium leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <FooterSection onNavigate={onNavigate} />
    </div>
  );
};
