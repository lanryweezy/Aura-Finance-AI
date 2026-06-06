
import React from 'react';
import { Target, Users, Zap, Globe } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-black mb-6 text-gray-900 dark:text-white tracking-tight">Our Mission</h1>
        <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
          We're building the <span className="text-brand-cyan">Autonomous Financial Brain</span> that empowers every SME in Africa to thrive without the burden of manual bookkeeping.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">The Aura Story</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            Founded in Lagos in 2024, Aura Finance was born out of a simple frustration: why does business finance still feel like it's stuck in 1995?
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            Founders spend more time chasing receipts and fighting with spreadsheets than they do growing their businesses. We decided to change that by leveraging agentic AI to handle the "boring stuff" autonomously.
          </p>
        </div>
        <div className="bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 rounded-[3rem] p-1 shadow-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <Users size={64} className="text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
        {[
          { icon: <Target className="text-brand-cyan" />, label: "Integrity", desc: "Your trust is our most valuable asset." },
          { icon: <Zap className="text-brand-purple" />, label: "Innovation", desc: "Pushing the boundaries of what's possible with AI." },
          { icon: <Users className="text-brand-pink" />, label: "Community", desc: "Empowering the next generation of African founders." },
          { icon: <Globe className="text-brand-cyan" />, label: "Inclusion", desc: "Financial tools accessible to every size of business." }
        ].map((item, i) => (
          <div key={i} className="p-8 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl text-center">
            <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              {item.icon}
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{item.label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
