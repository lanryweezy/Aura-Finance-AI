
import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  BarChart3,
  Users,
  Globe,
  Bot,
  Receipt,
  Calculator,
  LayoutDashboard,
  Smartphone,
  Cpu,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';

interface LandingViewProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onLogin }) => {
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
            <a href="#solutions" className="text-sm font-bold text-gray-400 hover:text-brand-cyan transition-colors">Solutions</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLogin}
              className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-white text-black font-black text-sm rounded-xl hover:bg-brand-cyan transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Animated Background Orbs */}
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
            <button className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-lg rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              Watch Demo
            </button>
          </div>

          {/* App Preview Mockup */}
          <div className="mt-20 relative max-w-5xl mx-auto animate-float">
            <div className="absolute inset-0 bg-gradient-to-t from-dark-primary via-transparent to-transparent z-10 h-40 bottom-0"></div>
            <div className="p-1 bg-gradient-to-b from-white/20 to-transparent rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl">
              <img
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=2000"
                alt="App Interface"
                className="rounded-[2.2rem] w-full border border-white/10 grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              />
            </div>
            {/* Floating Stats Card */}
            <div className="absolute -bottom-10 -right-10 hidden lg:block p-6 bg-dark-secondary border border-white/10 rounded-3xl shadow-2xl z-20 animate-bounce-slow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-brand-cyan/20 rounded-xl text-brand-cyan">
                  <BarChart3 />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Savings Growth</p>
                  <p className="text-xl font-black">+142%</p>
                </div>
              </div>
              <div className="h-12 w-48 flex items-end gap-1">
                {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-brand-cyan rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="solutions" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-cyan mb-4">The Process</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight">How Aura Transforms Your Finance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 -z-10"></div>

            {[
              {
                step: "01",
                title: "Connect Your Stack",
                desc: "Securely link your Nigerian bank accounts, ERPs, and payment gateways in minutes.",
                color: "bg-brand-cyan"
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "Aura's autonomous agents categorize transactions, calculate taxes, and flag anomalies.",
                color: "bg-brand-purple"
              },
              {
                step: "03",
                title: "Strategic Growth",
                desc: "Receive real-time insights and automated reports to drive your business forward.",
                color: "bg-brand-pink"
              }
            ].map((s, i) => (
              <div key={i} className="relative group">
                <div className={`w-16 h-16 ${s.color} text-black rounded-2xl flex items-center justify-center text-2xl font-black mb-8 shadow-2xl group-hover:scale-110 transition-transform`}>
                  {s.step}
                </div>
                <h3 className="text-2xl font-black mb-4">{s.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Workforce Section */}
      <section className="py-32 relative overflow-hidden bg-dark-secondary/20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-cyan/5 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-cyan mb-4">Meet Your New Team</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight">The Aura AI Workforce</p>
            <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
              Not just software, but a team of specialized AI agents working 24/7 to manage your business operations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "CFO Bot", role: "Strategy", color: "from-brand-cyan" },
              { name: "TaxPro", role: "Compliance", color: "from-brand-purple" },
              { name: "PayMaster", role: "Payroll", color: "from-brand-pink" },
              { name: "OpsBot", role: "Inventory", color: "from-brand-cyan" },
              { name: "Audit Shield", role: "Security", color: "from-brand-purple" },
              { name: "Procure AI", role: "Purchasing", color: "from-brand-pink" }
            ].map((agent, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center group hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${agent.color} to-transparent mb-4 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all`}>
                  <Bot size={24} className="text-white" />
                </div>
                <p className="font-black text-sm mb-1">{agent.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative bg-dark-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-purple mb-4">Enterprise Grade</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight">Built for modern Nigerian commerce.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Bot className="text-brand-cyan" />,
                title: "Agentic AI CFO",
                desc: "Aura reasons about your cash flow, detects anomalies, and proposes savings before you even ask."
              },
              {
                icon: <Zap className="text-brand-purple" />,
                title: "One-Click Payroll",
                desc: "Automated PAYE, Pension, and NHF calculations for Nigerian regulations. Approved in seconds."
              },
              {
                icon: <Globe className="text-brand-pink" />,
                title: "Tax Compliance",
                desc: "Instant FIRS-ready reports for VAT, WHT, and Company Income Tax. Stay 100% compliant."
              },
              {
                icon: <Receipt className="text-brand-cyan" />,
                title: "Smart Inventory",
                desc: "AI-driven stock forecasting, multi-warehouse support, and automated FIFO valuation."
              },
              {
                icon: <ShieldCheck className="text-brand-purple" />,
                title: "Audit Protection",
                desc: "Every action is logged with an AI-reasoning trail, making tax audits a breeze."
              },
              {
                icon: <Calculator className="text-brand-pink" />,
                title: "Bank Automation",
                desc: "Direct integration with Zenith, GTB, Access, and more. Real-time reconciliation."
              }
            ].map((f, i) => (
              <div key={i} className="group p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="mb-6 p-4 bg-dark-primary rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black mb-3">{f.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-cyan mb-4">Transparent Pricing</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight">Scale your business, not your bills.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col">
              <h3 className="text-xl font-black mb-2">Starter</h3>
              <p className="text-gray-400 font-medium text-sm mb-8">For new startups</p>
              <div className="mb-8">
                <span className="text-5xl font-black tracking-tighter">₦0</span>
                <span className="text-gray-500 font-bold ml-1">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {['50 Transactions/mo', '10 Invoices', '3 Team Members', '1 Bank Sync'].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                    <CheckCircle2 size={16} className="text-brand-cyan" /> {t}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-brand-cyan transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Growth */}
            <div className="p-8 bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 border-2 border-brand-purple rounded-[2.5rem] flex flex-col scale-105 shadow-2xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-purple text-white text-[10px] font-black uppercase tracking-widest rounded-full">Most Popular</div>
              <h3 className="text-xl font-black mb-2">Growth</h3>
              <p className="text-gray-300 font-medium text-sm mb-8">For established SMEs</p>
              <div className="mb-8">
                <span className="text-5xl font-black tracking-tighter">₦15k</span>
                <span className="text-gray-400 font-bold ml-1">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {['5,000 Transactions', 'Unlimited Invoices', 'Inventory Management', 'Automated Payroll', 'Tax Filing Assistant'].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-white">
                    <CheckCircle2 size={16} className="text-brand-purple" /> {t}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-4 bg-brand-purple text-white font-black rounded-2xl hover:bg-brand-purple/90 transition-all shadow-xl shadow-brand-purple/40"
              >
                Select Growth
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col">
              <h3 className="text-xl font-black mb-2">Enterprise</h3>
              <p className="text-gray-400 font-medium text-sm mb-8">For large corporations</p>
              <div className="mb-8">
                <span className="text-5xl font-black tracking-tighter">₦45k</span>
                <span className="text-gray-500 font-bold ml-1">/mo</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {['Unlimited Scale', 'Multi-Entity Aggregation', 'Fixed Asset Registry', 'Custom API Access', 'Priority Audit Support'].map((t, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                    <CheckCircle2 size={16} className="text-brand-pink" /> {t}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all"
              >
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-32 relative border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-pink mb-4">Deep Integrations</h2>
              <p className="text-4xl md:text-5xl font-black tracking-tight mb-8">Works with the tools you already use.</p>
              <p className="text-xl text-gray-400 font-medium mb-12 leading-relaxed">
                Aura connects natively to the Nigerian financial ecosystem. No more manual CSV exports or broken spreadsheets.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {['Direct Bank Feeds', 'Payment Gateways', 'Ecommerce Sync', 'Payroll Automation'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                    <CheckCircle2 size={18} className="text-brand-pink" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 opacity-40 grayscale invert">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Paystack_logo.png" alt="Paystack" className="h-8 mx-auto" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Flutterwave_Logo.png" alt="Flutterwave" className="h-6 mx-auto" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Kuda_Bank_logo.png" alt="Kuda" className="h-8 mx-auto" />
              <div className="h-8 text-white font-black text-center text-xl">Zenith</div>
              <div className="h-8 text-white font-black text-center text-xl">GTBank</div>
              <div className="h-8 text-white font-black text-center text-xl">Access</div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/Andela_logo.png" alt="Andela" className="h-8 mx-auto" />
              <div className="h-8 text-white font-black text-center text-xl">Shopify</div>
              <div className="h-8 text-white font-black text-center text-xl">Amazon</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-purple mb-4">Success Stories</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight">Trusted by Founders Everywhere</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Aura saved us over 40 hours a month on payroll and tax filing. It's like having a CFO on autopilot.",
                author: "Tunde Oladapo",
                role: "CEO, TechGrain Lagos"
              },
              {
                quote: "The AI reasoning for every transaction gives us the confidence we need during audit season.",
                author: "Amaka Eze",
                role: "Finance Director, RetailFlow"
              },
              {
                quote: "Connecting our bank feeds was seamless. Now we have real-time visibility into our cash runway.",
                author: "Ibrahim Musa",
                role: "Founder, AgriSmart Abuja"
              }
            ].map((t, i) => (
              <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] relative">
                <div className="text-brand-purple mb-6 italic text-4xl font-serif">"</div>
                <p className="text-gray-300 font-medium mb-8 leading-relaxed">
                  {t.quote}
                </p>
                <div>
                  <p className="font-black text-white">{t.author}</p>
                  <p className="text-sm text-gray-500 font-bold">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-12 md:p-20 bg-gradient-to-br from-brand-cyan/20 via-brand-purple/20 to-brand-pink/20 border border-white/10 rounded-[3rem] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 blur-[80px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/10 blur-[80px] -z-10"></div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
              Ready to automate your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">financial future?</span>
            </h2>
            <p className="text-xl text-gray-300 font-medium mb-12 max-w-2xl mx-auto">
              Join hundreds of forward-thinking Nigerian businesses already using Aura to scale faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={onGetStarted}
                className="px-10 py-5 bg-white text-black font-black text-lg rounded-2xl hover:bg-brand-cyan transition-all shadow-2xl active:scale-95"
              >
                Get Started for Free
              </button>
              <button className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-lg rounded-2xl hover:bg-white/10 transition-all">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 relative bg-dark-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-cyan mb-4">FAQ</h2>
            <p className="text-4xl font-black tracking-tight">Common Questions</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is my financial data secure?",
                a: "Yes. We use bank-grade AES-256 encryption and follow strict Nigerian data protection regulations. Your data is isolated at the tenant level."
              },
              {
                q: "How does the AI handle Nigerian taxes?",
                a: "Aura is pre-configured with FIRS and LIRS rules for VAT (7.5%), WHT, CIT, and NSITF. It generates FIRS-ready reports automatically."
              },
              {
                q: "Can I connect multiple bank accounts?",
                a: "Absolutely. Depending on your plan, you can connect multiple accounts from Zenith, GTBank, Kuda, and many others."
              },
              {
                q: "What happens if I go offline?",
                a: "Aura is a Progressive Web App (PWA) with full offline support. Your changes are queued and synced automatically when you're back online."
              }
            ].map((faq, i) => (
              <details key={i} className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                <summary className="flex items-center justify-between font-black text-lg list-none">
                  {faq.q}
                  <span className="text-brand-cyan group-open:rotate-45 transition-transform">
                    <Plus size={20} />
                  </span>
                </summary>
                <p className="mt-4 text-gray-400 font-medium leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-dark-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                </div>
                <span className="text-lg font-black tracking-tight">Aura Finance</span>
              </div>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                The future of autonomous business finance in Africa. Built with love in Lagos.
              </p>
            </div>

            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><a href="#" className="hover:text-brand-cyan transition-colors">AI Assistant</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors">Payroll</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors">Inventory</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><a href="#" className="hover:text-brand-cyan transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><a href="#" className="hover:text-brand-cyan transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-cyan transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">© 2025 Aura Finance AI. All rights reserved.</p>
            <div className="flex gap-6">
              <Globe className="text-gray-600 hover:text-white cursor-pointer" size={20} />
              <Smartphone className="text-gray-600 hover:text-white cursor-pointer" size={20} />
              <LayoutDashboard className="text-gray-600 hover:text-white cursor-pointer" size={20} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
