import React, { useState } from 'react';

interface LandingViewProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigate: (view: string) => void;
}

const features = [
  { icon: '🤖', title: 'AI CFO Assistant', desc: '4 specialized AI agents for financial analysis, tax, payroll, and operations' },
  { icon: '📄', title: 'Smart Invoicing', desc: 'Create, send, and track invoices with AI-powered extraction and NRS compliance' },
  { icon: '💰', title: 'Expense Management', desc: 'Track team spending with corporate cards, policies, and auto-categorization' },
  { icon: '🏦', title: 'Bank Sync', desc: 'Connect your Nigerian bank accounts via Mono for automatic transaction feeds' },
  { icon: '📊', title: 'Financial Reports', desc: 'P&L, Balance Sheet, Cash Flow reports with AI-generated insights' },
  { icon: '💳', title: 'Corporate Cards', desc: 'Virtual and physical cards with spend limits and category controls' },
  { icon: '✅', title: 'Approval Workflows', desc: 'Multi-level approvals for invoices, bills, and purchase orders' },
  { icon: '📱', title: 'Mobile App', desc: 'Full-featured mobile app for iOS and Android via Capacitor' },
  { icon: '🔒', title: 'NRS E-Invoicing', desc: 'Nigeria Revenue Service compliant e-invoicing with digital stamps' },
];

const stats = [
  { value: '50+', label: 'Features' },
  { value: '4', label: 'AI Agents' },
  { value: '₦0', label: 'Starting Price' },
  { value: '99.9%', label: 'Uptime' },
];

const testimonials = [
  { name: 'Adaeze O.', role: 'CEO, TechFlow Lagos', text: 'Aura replaced 4 tools we were paying for. The AI CFO alone saves us 10 hours/month.' },
  { name: 'Tunde K.', role: 'Finance Director, GreenLeaf', text: 'NRS e-invoicing was a nightmare until Aura. Now it\'s one click. Compliance has never been easier.' },
  { name: 'Funke A.', role: 'Founder, StyleHub', text: 'The WhatsApp sharing feature is genius. Our clients pay 3x faster when we send invoices via WhatsApp.' },
];

export const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-dark-primary/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
            <span className="text-2xl font-black tracking-tight">AURA</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => onNavigate('about')} className="text-sm text-gray-400 hover:text-white transition-colors">About</button>
            <button onClick={() => onNavigate('blog')} className="text-sm text-gray-400 hover:text-white transition-colors">Blog</button>
            <button onClick={() => onNavigate('contact')} className="text-sm text-gray-400 hover:text-white transition-colors">Contact</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Log In</button>
            <button onClick={onGetStarted} className="px-5 py-2.5 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all text-sm">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/20 rounded-full blur-[128px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-cyan/10 rounded-full blur-[128px] -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full text-brand-cyan text-xs font-bold mb-8">
            <span className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" />
            AI-Powered Accounting for Nigerian SMEs
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
            Run your business<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-purple">
              with an AI CFO
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Invoicing, expenses, payroll, tax compliance, and financial intelligence — all powered by AI. Built for Nigerian businesses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onGetStarted} className="px-8 py-4 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all text-lg shadow-lg shadow-brand-cyan/20">
              Start Free →
            </button>
            <button onClick={() => onNavigate('about')} className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-lg border border-white/10">
              Watch Demo
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">No credit card required • Free tier included</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-brand-cyan">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Everything you need to run your finances</h2>
            <p className="text-gray-400 max-w-xl mx-auto">One platform replaces your invoicing software, expense tracker, payroll system, and accounting tool.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-dark-secondary border border-white/5 rounded-2xl p-6 hover:border-brand-cyan/30 transition-all group">
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="font-bold text-lg mb-2 group-hover:text-brand-cyan transition-colors">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 px-4 bg-dark-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6">Meet your AI CFO team</h2>
              <p className="text-gray-400 mb-8">Four specialized AI agents that understand Nigerian business finance — from PAYE calculations to NRS compliance.</p>

              <div className="space-y-4">
                {[
                  { name: 'O-Heidi', role: 'Chief Financial Officer', desc: 'Cash flow forecasting, growth strategy, investment analysis' },
                  { name: 'TaxPro AI', role: 'Tax & Compliance Expert', desc: 'VAT, WHT, CIT, PAYE — all Nigerian tax law' },
                  { name: 'PayMaster AI', role: 'Payroll & HR Agent', desc: 'PAYE, Pension, NHF, salary disbursements' },
                  { name: 'OpsBot AI', role: 'Finance Operations', desc: 'Bills, invoices, vendor payments, transactions' },
                ].map((agent, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-dark-primary rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center text-sm font-bold text-black">
                      {agent.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{agent.name} <span className="text-gray-500 font-normal">— {agent.role}</span></p>
                      <p className="text-xs text-gray-500">{agent.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-primary border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center text-xs font-bold text-black">O</div>
                <span className="text-sm font-bold">O-Heidi (CFO)</span>
              </div>
              <div className="space-y-3">
                <div className="bg-brand-purple/20 text-white p-3 rounded-xl rounded-br-sm text-sm ml-8">
                  What's my burn rate this month?
                </div>
                <div className="bg-dark-secondary p-3 rounded-xl rounded-bl-sm text-sm mr-8">
                  <p className="mb-2">Your current burn rate is <span className="text-brand-cyan font-bold">₦2.4M/month</span>.</p>
                  <p className="mb-2">Key findings:</p>
                  <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                    <li>Software subscriptions increased 15% — review 3 unused licenses</li>
                    <li>Travel expenses are within budget</li>
                    <li>Cash runway: <span className="text-yellow-400 font-bold">87 days</span> at current rate</li>
                  </ul>
                  <p className="mt-2 text-xs text-brand-cyan">💡 Recommendation: Cancel unused subscriptions to extend runway by 12 days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16">Loved by Nigerian businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-dark-secondary border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center text-sm font-bold text-black">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-dark-secondary/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: '₦0', period: '/month', features: ['50 transactions/mo', '10 invoices/mo', '1 bank connection', 'AI assistant (10 msgs)', 'Receipt scanning (3)', 'Basic reports'], cta: 'Start Free', highlight: false },
              { name: 'Growth', price: '₦15,000', period: '/month', features: ['5,000 transactions/mo', 'Unlimited invoices', '5 bank connections', 'Pro AI (500 msgs)', 'Inventory & Payroll', 'Tax filing & compliance'], cta: 'Start Growth', highlight: true },
              { name: 'Enterprise', price: '₦45,000', period: '/month', features: ['Unlimited everything', 'Multi-entity support', 'Fixed assets & audit trail', 'Unlimited AI CFO', 'Priority support', 'Custom integrations'], cta: 'Contact Sales', highlight: false },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 ${plan.highlight ? 'bg-gradient-to-b from-brand-cyan/10 to-transparent border-2 border-brand-cyan/50 relative' : 'bg-dark-primary border border-white/10'}`}>
                {plan.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-cyan text-black text-xs font-bold rounded-full">Most Popular</span>}
                <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
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
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${plan.highlight ? 'bg-brand-cyan text-black hover:bg-brand-cyan/80' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6">Ready to transform your finances?</h2>
          <p className="text-gray-400 mb-8">Join hundreds of Nigerian businesses using AI to manage their finances smarter.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-6 py-4 bg-dark-secondary border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan flex-1 max-w-sm"
            />
            <button onClick={onGetStarted} className="px-8 py-4 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all whitespace-nowrap">
              Get Started Free →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-1.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </div>
              <span className="font-black">AURA</span>
            </div>
            <p className="text-xs text-gray-500">AI-powered accounting for Nigerian businesses.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Product</h4>
            <div className="space-y-2 text-xs text-gray-500">
              <p>Features</p><p>Pricing</p><p>API</p><p>MCP Server</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Company</h4>
            <div className="space-y-2 text-xs text-gray-500">
              <p onClick={() => onNavigate('about')} className="cursor-pointer hover:text-white">About</p>
              <p onClick={() => onNavigate('blog')} className="cursor-pointer hover:text-white">Blog</p>
              <p onClick={() => onNavigate('careers')} className="cursor-pointer hover:text-white">Careers</p>
              <p onClick={() => onNavigate('contact')} className="cursor-pointer hover:text-white">Contact</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Legal</h4>
            <div className="space-y-2 text-xs text-gray-500">
              <p onClick={() => onNavigate('privacy')} className="cursor-pointer hover:text-white">Privacy</p>
              <p onClick={() => onNavigate('terms')} className="cursor-pointer hover:text-white">Terms</p>
              <p onClick={() => onNavigate('security')} className="cursor-pointer hover:text-white">Security</p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
          © 2026 Aura Finance AI. All rights reserved. Built in Lagos, Nigeria.
        </div>
      </footer>
    </div>
  );
};
