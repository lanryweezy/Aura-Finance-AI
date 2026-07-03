import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onDemo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onDemo }) => (
  <section className="relative pt-40 pb-20 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-purple/20 rounded-full blur-[120px] -z-10 opacity-50"></div>
    <div className="absolute -bottom-20 left-0 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[100px] -z-10"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
        <span className="flex h-2 w-2 rounded-full bg-brand-cyan animate-pulse"></span>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">Now Powered by Gemini 2.0</span>
      </div>

      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
        The Operating System for <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink">
          Autonomous Finance.
        </span>
      </h1>

      <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-medium mb-12 leading-relaxed">
        Stop doing manual bookkeeping. Aura automates your inventory, payroll, and Nigerian tax compliance with agentic AI that works while you sleep.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <button
          onClick={onGetStarted}
          className="group w-full sm:w-auto px-10 py-5 bg-brand-cyan text-black font-black text-lg rounded-2xl hover:bg-brand-cyan/90 transition-all shadow-2xl shadow-brand-cyan/20 flex items-center justify-center gap-3 active:scale-95"
        >
          Start Your Free Trial
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={onDemo}
          className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-lg rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
        >
          Try Demo — No Signup
        </button>
      </div>
    </div>
  </section>
);
