
import React, { useState } from 'react';
import { authService } from '../services/authService';
import type { User, Organization } from '../types';
import { useToast } from './ui/Toast';

interface AuthViewProps {
    onLogin: (user: User, org: Organization) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
    const { showToast } = useToast();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isLogin) {
                const { user, org } = await authService.login(email, password);
                onLogin(user, org);
            } else {
                const { user, org } = await authService.signup(fullName, email, password, companyName);
                onLogin(user, org);
            }
        } catch (error) {
            showToast('Authentication failed. Please check your credentials.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProviderLogin = async (provider: 'google' | 'microsoft' | 'sso') => {
        setIsLoading(true);
        try {
            const { user, org } = await authService.loginWithProvider(provider);
            onLogin(user, org);
        } catch (error) {
            showToast('SSO Authentication failed. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-primary flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-brand-cyan/20 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-brand-purple/20 rounded-full blur-[150px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>
            
            <div className="w-full max-w-5xl h-[85vh] bg-dark-tertiary/30 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden relative z-10">
                {/* Left Side - Visuals */}
                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-dark-secondary to-dark-primary p-12 flex-col justify-between relative border-r border-white/5">
                    <div className="flex items-center gap-3">
                         <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2.5 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                         </div>
                         <h1 className="text-2xl font-black tracking-tight text-white">Aura Finance</h1>
                    </div>
                    
                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            The future of <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">Autonomous Accounting.</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Join thousands of Nigerian businesses using AI to automate bookkeeping, payroll, and tax compliance.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                            <p className="text-brand-cyan font-bold text-2xl">98%</p>
                            <p className="text-gray-400 text-sm">Time saved on bookkeeping</p>
                        </div>
                         <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                            <p className="text-brand-purple font-bold text-2xl">100%</p>
                            <p className="text-gray-400 text-sm">Tax compliance accuracy</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-dark-secondary/50 overflow-y-auto custom-scrollbar">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="text-gray-400 mb-6">{isLogin ? 'Choose a login method to continue.' : 'Start your 14-day free trial.'}</p>

                        <div className="space-y-3 mb-6">
                            <button 
                                onClick={() => handleProviderLogin('google')}
                                disabled={isLoading}
                                className="w-full py-2.5 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.92-2.91l-3.86-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                                Continue with Google
                            </button>
                            <button 
                                onClick={() => handleProviderLogin('microsoft')}
                                disabled={isLoading}
                                className="w-full py-2.5 bg-[#2F2F2F] border border-gray-600 text-white font-semibold rounded-lg hover:bg-[#3F3F3F] transition-colors flex items-center justify-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
                                Microsoft / Company Mail
                            </button>
                             <button 
                                onClick={() => handleProviderLogin('sso')}
                                disabled={isLoading}
                                className="w-full py-2.5 bg-transparent border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Single Sign-On (SSO)
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-dark-secondary text-gray-500">Or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                            className="w-full mt-1 bg-dark-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors"
                                            placeholder="Tunde Okechukwu"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase">Company Name</label>
                                        <input 
                                            type="text" 
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            required
                                            className="w-full mt-1 bg-dark-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors"
                                            placeholder="Aura Logistics Ltd"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full mt-1 bg-dark-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors"
                                    placeholder="name@company.com"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase">Password</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full mt-1 bg-dark-primary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-3.5 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/90 transition-all shadow-[0_0_20px_rgba(0,245,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400 text-sm">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button 
                                    onClick={() => setIsLogin(!isLogin)} 
                                    className="text-brand-cyan font-semibold hover:underline"
                                >
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
