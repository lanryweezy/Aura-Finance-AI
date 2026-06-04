
import React from 'react';
import { useCurrency } from './ui/CurrencyProvider';
import { billingService } from '../services/billingService';

interface LandingViewProps {
    onStart: () => void;
    onLogin: () => void;
    onViewLegal: (type: 'privacy' | 'terms') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, onLogin, onViewLegal }) => {
    const { formatAmount } = useCurrency();
    const plans = billingService.getPlans();

    return (
        <div className="min-h-screen bg-dark-primary text-white font-sans selection:bg-brand-cyan selection:text-black">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-dark-primary/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        </div>
                        <span className="text-xl font-black tracking-tighter">AURA</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={onLogin} className="text-sm font-bold hover:text-brand-cyan transition-colors px-4 py-2">Log In</button>
                        <button onClick={onStart} className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-cyan transition-all transform hover:scale-105">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-cyan/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-cyan text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
                        </span>
                        Next-Gen Finance for African SMEs
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
                        Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-purple">Intelligence</span><br/>
                        on Autopilot.
                    </h1>

                    <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed mb-12">
                        Aura automates your bookkeeping, payroll, and tax compliance with AI tailored for the Nigerian market. Save 40+ hours a month.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button onClick={onStart} className="w-full sm:w-auto px-10 py-5 bg-brand-cyan text-black font-black rounded-2xl hover:bg-brand-cyan/90 transition-all shadow-[0_0_40px_rgba(0,245,212,0.3)] text-lg">
                            Start Free Trial
                        </button>
                        <button className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-lg">
                            Watch Demo
                        </button>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="mt-24 relative max-w-5xl mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-cyan to-brand-purple rounded-[2rem] blur opacity-20"></div>
                        <div className="relative bg-dark-secondary rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                             <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000"
                                alt="Aura Dashboard"
                                className="w-full h-auto opacity-80 grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-dark-primary via-transparent to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By */}
            <section className="py-20 border-y border-white/5 bg-dark-secondary/30">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-gray-500 font-bold uppercase tracking-widest text-xs mb-12">Trusted by 5,000+ Nigerian Businesses</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale">
                        <span className="text-2xl font-black">PAYSTACK</span>
                        <span className="text-2xl font-black">FLUTTERWAVE</span>
                        <span className="text-2xl font-black">Kuda.</span>
                        <span className="text-2xl font-black">brass</span>
                        <span className="text-2xl font-black">MONIEPOINT</span>
                    </div>
                </div>
            </section>

            {/* Solutions Section */}
            <section id="solutions" className="py-32 bg-dark-primary relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Built for businesses <br/><span className="text-brand-purple">at every stage.</span></h2>
                            <div className="space-y-8">
                                {[
                                    { title: 'Startups', desc: 'Take control of your finance with real-time expense tracking and founder-friendly dashboards.' },
                                    { title: 'Growing SMEs', desc: 'Automate payroll and taxes as you scale your team across multiple locations in Nigeria.' },
                                    { title: 'Enterprises', desc: 'Advanced audit trails, custom approval workflows, and multi-entity consolidation.' }
                                ].map((sol, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="w-1 h-16 bg-white/5 rounded-full overflow-hidden">
                                            <div className="w-full h-0 group-hover:h-full bg-brand-purple transition-all duration-500"></div>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2 transition-colors group-hover:text-brand-purple">{sol.title}</h4>
                                            <p className="text-gray-400">{sol.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-brand-purple/20 blur-[100px] rounded-full"></div>
                            <img
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"
                                alt="Solutions"
                                className="relative rounded-3xl border border-white/10 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 relative">
                 <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need to <br/><span className="text-brand-cyan">scale your operations.</span></h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">One platform to manage your entire financial lifecycle, from first invoice to year-end tax filing.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'AI Bookkeeping',
                                description: 'Automatic transaction categorization and reconciliation with 99% accuracy.',
                                icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'
                            },
                            {
                                title: 'Local Payroll',
                                description: 'One-click payroll with automated PAYE, Pension, and NHF calculations for Nigeria.',
                                icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'
                            },
                            {
                                title: 'Tax Compliance',
                                description: 'Generate VAT, WHT, and CIT reports ready for FIRS and LIRS filing.',
                                icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'
                            }
                        ].map((feat, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-dark-secondary/50 border border-white/5 hover:border-brand-cyan/30 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan mb-6 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={feat.icon}/></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-4">{feat.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feat.description}</p>
                            </div>
                        ))}
                    </div>
                 </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-32 bg-dark-secondary/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, <span className="text-brand-purple">Transparent</span> Pricing</h2>
                        <p className="text-gray-400">Start for free and upgrade as you grow.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative p-10 rounded-[2.5rem] border transition-all duration-500 ${
                                    plan.highlighted
                                    ? 'bg-dark-secondary border-brand-cyan shadow-2xl scale-105 z-10'
                                    : 'bg-dark-tertiary/30 border-white/5'
                                }`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-brand-cyan text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                        Best Value
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-5xl font-black tracking-tight">{formatAmount(plan.price, { maximumFractionDigits: 0 })}</span>
                                    <span className="text-gray-500 font-medium">/mo</span>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {plan.features.slice(0, 5).map((f, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-400">
                                            <svg className="w-5 h-5 text-brand-cyan flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <button onClick={onStart} className={`w-full py-4 rounded-2xl font-black transition-all ${
                                    plan.highlighted
                                    ? 'bg-brand-cyan text-black hover:shadow-[0_0_30px_rgba(0,245,212,0.4)]'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}>
                                    Choose {plan.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="relative rounded-[3rem] bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 p-12 md:p-20 overflow-hidden text-center border border-white/10">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/20 blur-[100px] -z-10"></div>
                         <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to automate your <br/>business finances?</h2>
                         <p className="text-gray-300 text-lg mb-12 max-w-xl mx-auto">Get started today and join over 5,000 businesses making smarter financial decisions with Aura AI.</p>
                         <button onClick={onStart} className="px-12 py-6 bg-white text-black font-black rounded-2xl text-xl hover:bg-brand-cyan transition-all transform hover:scale-105">
                             Get Started for Free
                         </button>
                         <p className="mt-6 text-sm text-gray-500 font-medium">No credit card required • 14-day free trial</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 bg-dark-primary">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-2">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                </div>
                                <span className="text-xl font-black tracking-tighter uppercase">Aura Finance</span>
                            </div>
                            <p className="text-gray-500 max-w-xs">Built for the next generation of African entrepreneurs. Automating finance so you can focus on growth.</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Product</h4>
                            <ul className="space-y-4 text-sm text-gray-500">
                                <li className="hover:text-brand-cyan cursor-pointer transition-colors">Features</li>
                                <li className="hover:text-brand-cyan cursor-pointer transition-colors">Pricing</li>
                                <li className="hover:text-brand-cyan cursor-pointer transition-colors">API Docs</li>
                                <li className="hover:text-brand-cyan cursor-pointer transition-colors">Mobile App</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Company</h4>
                            <ul className="space-y-4 text-sm text-gray-500">
                                <li className="hover:text-brand-cyan cursor-pointer transition-colors">About</li>
                                <li className="hover:text-brand-cyan cursor-pointer transition-colors">Careers</li>
                                <li onClick={() => onViewLegal('privacy')} className="hover:text-brand-cyan cursor-pointer transition-colors">Privacy</li>
                                <li onClick={() => onViewLegal('terms')} className="hover:text-brand-cyan cursor-pointer transition-colors">Terms</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5 text-xs font-bold text-gray-600 uppercase tracking-widest">
                        <p>© 2024 Aura Finance AI. All rights reserved.</p>
                        <div className="flex gap-8">
                            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
                            <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
