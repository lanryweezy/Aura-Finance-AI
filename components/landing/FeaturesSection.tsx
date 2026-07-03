import React from 'react';
import { Bot, Receipt, Calculator, LayoutDashboard, Smartphone, Cpu } from 'lucide-react';

const features = [
  { icon: <Bot size={32} />, title: "AI CFO Assistant", description: "4 specialized AI agents that understand Nigerian business finance — from PAYE calculations to NRS compliance.", accent: "cyan" },
  { icon: <Receipt size={32} />, title: "Smart Invoicing", description: "Create, send, and track invoices with AI-powered extraction and NRS compliance.", accent: "purple" },
  { icon: <Calculator size={32} />, title: "Payroll & Tax", description: "Automated PAYE, Pension, NHF calculations with multi-state support across Nigeria.", accent: "pink" },
  { icon: <LayoutDashboard size={32} />, title: "Financial Intelligence", description: "Real-time dashboards, cash flow forecasting, and anomaly detection powered by Google's TabFM and TimesFM.", accent: "cyan" },
  { icon: <Smartphone size={32} />, title: "Mobile First", description: "Full-featured mobile app for iOS and Android. Manage your finances anywhere.", accent: "purple" },
  { icon: <Cpu size={32} />, title: "ML-Powered", description: "Google's foundation models for transaction categorization, fraud detection, and forecasting.", accent: "pink" },
];

export const FeaturesSection: React.FC = () => (
  <section id="features" className="py-32 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-cyan mb-4">Features</h2>
        <p className="text-4xl font-black tracking-tight">Everything you need</p>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">One platform replaces your invoicing software, expense tracker, payroll system, and accounting tool.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-brand-cyan/30 transition-all group">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-${feature.accent} to-brand-${feature.accent === 'cyan' ? 'purple' : 'cyan'} flex items-center justify-center text-black mb-6 group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h3 className="font-black text-lg mb-3">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
