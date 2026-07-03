import React from 'react';
import { Bot, Calculator, Users, Receipt } from 'lucide-react';

export const AISection: React.FC = () => (
  <section className="py-32 relative bg-dark-secondary/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-cyan mb-4">AI Workforce</h2>
        <p className="text-4xl font-black tracking-tight">Your AI CFO team</p>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">Four specialized AI agents that understand Nigerian business finance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'O-Heidi', role: 'Chief Financial Officer', color: 'from-brand-cyan to-brand-purple', desc: 'Cash flow forecasting, growth strategy, investment analysis', icon: <Bot size={24} /> },
          { name: 'TaxPro AI', role: 'Tax & Compliance Expert', color: 'from-orange-400 to-red-500', desc: 'VAT (7.5%), WHT, CIT, PAYE — full Nigerian tax law', icon: <Calculator size={24} /> },
          { name: 'PayMaster AI', role: 'Payroll & HR Agent', color: 'from-green-400 to-blue-500', desc: 'PAYE, Pension (10%), NHF (2.5%), salary disbursements', icon: <Users size={24} /> },
          { name: 'OpsBot AI', role: 'Finance Operations', color: 'from-pink-400 to-brand-purple', desc: 'Bills, invoices, vendor payments, transaction management', icon: <Receipt size={24} /> },
        ].map((agent, i) => (
          <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-brand-cyan/30 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform`}>
                {agent.icon}
              </div>
              <div>
                <h3 className="font-black text-lg">{agent.name}</h3>
                <p className="text-sm text-gray-400">{agent.role}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{agent.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
