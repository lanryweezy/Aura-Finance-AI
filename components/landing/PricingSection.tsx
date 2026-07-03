import React from 'react';

export const PricingSection: React.FC = () => (
  <section id="pricing" className="py-32 relative">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-purple mb-4">Pricing</h2>
        <p className="text-4xl font-black tracking-tight">Simple, transparent</p>
        <p className="text-gray-400 mt-4">Start free. Upgrade when you're ready.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: "Starter", price: "₦0", period: "/month", features: ["50 transactions/mo", "10 invoices/mo", "1 bank connection", "AI assistant (10 msgs)", "Basic reports"], cta: "Start Free", highlighted: false },
          { name: "Growth", price: "₦15,000", period: "/month", features: ["5,000 transactions/mo", "Unlimited invoices", "5 bank connections", "Pro AI (500 msgs)", "Inventory & Payroll", "Tax filing"], cta: "Start Growth", highlighted: true },
          { name: "Enterprise", price: "₦45,000", period: "/month", features: ["Unlimited everything", "Multi-entity support", "Fixed assets & audit trail", "Unlimited AI CFO", "Priority support", "Custom integrations"], cta: "Contact Sales", highlighted: false },
        ].map((plan, i) => (
          <div key={i} className={`rounded-3xl p-8 ${plan.highlighted ? 'bg-gradient-to-b from-brand-cyan/10 to-transparent border-2 border-brand-cyan/50 relative scale-105' : 'bg-white/5 border border-white/10'}`}>
            {plan.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-cyan text-black text-xs font-bold rounded-full">Most Popular</span>}
            <h3 className="font-black text-lg mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black">{plan.price}</span>
              <span className="text-sm text-gray-500">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm">
                  <span className="text-brand-cyan">✓</span>
                  <span className="text-gray-300">{f}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.highlighted ? 'bg-brand-cyan text-black hover:bg-brand-cyan/80' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);
