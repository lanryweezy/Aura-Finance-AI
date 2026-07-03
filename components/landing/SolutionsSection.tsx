import React from 'react';
import { ShieldCheck, Zap, BarChart3, Users } from 'lucide-react';

export const SolutionsSection: React.FC = () => (
  <section id="solutions" className="py-32 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-purple mb-4">Solutions</h2>
        <p className="text-4xl font-black tracking-tight">Built for your industry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { icon: <Zap size={24} />, title: "Tech Startups", items: ["SaaS Revenue Tracking", "VC-Ready Financials", "R&D Credit Optimization"] },
          { icon: <Users size={24} />, title: "Professional Services", items: ["Project-Based Invoicing", "Time Tracking Integration", "Client Retainer Management"] },
          { icon: <BarChart3 size={24} />, title: "E-Commerce", items: ["Multi-Channel Reconciliation", "Inventory Management", "Sales Tax Automation"] },
          { icon: <ShieldCheck size={24} />, title: "Enterprise", items: ["Multi-Entity Consolidation", "Advanced Audit Trail", "Custom Compliance Rules"] },
        ].map((item, i) => (
          <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl">
            <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple mb-4">
              {item.icon}
            </div>
            <h3 className="font-black text-lg mb-4">{item.title}</h3>
            <ul className="space-y-2">
              {item.features?.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full"></span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);
