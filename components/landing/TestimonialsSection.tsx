import React from 'react';

export const TestimonialsSection: React.FC = () => (
  <section className="py-32 relative bg-dark-secondary/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-purple mb-4">Testimonials</h2>
        <p className="text-4xl font-black tracking-tight">Loved by Nigerian businesses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Adaeze O.', role: 'CEO, TechFlow Lagos', text: 'Aura replaced 4 tools we were paying for. The AI CFO alone saves us 10 hours every month.' },
          { name: 'Tunde K.', role: 'Finance Director, GreenLeaf', text: "NRS e-invoicing was a nightmare until Aura. Now it's one click. Compliance has never been easier." },
          { name: 'Funke A.', role: 'Founder, StyleHub', text: 'The WhatsApp sharing feature is genius. Our clients pay 3x faster when we send invoices via WhatsApp.' },
        ].map((t, i) => (
          <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center text-sm font-bold text-black">
                {t.name[0]}
              </div>
              <div>
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">"{t.text}"</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
