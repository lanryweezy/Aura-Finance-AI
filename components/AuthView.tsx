
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
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    
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
                const result = await authService.login(email, password);
                if (result.requires2FA) {
                    setRequires2FA(true);
                    showToast('Two-factor authentication required.', 'info');
                } else {
                    onLogin(result.user, result.org);
                }
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

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { user, org } = await authService.verify2FA(twoFactorCode);
            onLogin(user, org);
        } catch (error) {
            showToast('Invalid 2FA code. Try 123456.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        setIsLoading(true);
        try {
            const { user, org } = await authService.loginWithBiometrics();
            onLogin(user, org);
        } catch (error) {
            showToast('Biometric login failed.', 'error');
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
        <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center p-4 relative overflow-hidden transition-colors">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-brand-cyan/10 dark:bg-brand-cyan/20 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-brand-purple/10 dark:bg-brand-purple/20 rounded-full blur-[150px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>
            
            <div className="w-full max-w-5xl h-[85vh] bg-white/80 dark:bg-dark-tertiary/30 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl flex overflow-hidden relative z-10">
                {/* Left Side - Visuals */}
                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-100 to-white dark:from-dark-secondary dark:to-dark-primary p-12 flex-col justify-between relative border-r border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                         <div className="bg-gradient-to-br from-brand-cyan to-brand-purple p-2.5 rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                         </div>
                         <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Aura Finance</h1>
                    </div>
                    
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">
                            The future of <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-purple">Autonomous Accounting.</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium">
                            Join thousands of Nigerian businesses using AI to automate bookkeeping, payroll, and tax compliance.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm backdrop-blur-sm">
                            <p className="text-brand-cyan font-black text-3xl">98%</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Time Saved</p>
                        </div>
                         <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm backdrop-blur-sm">
                            <p className="text-brand-purple font-black text-3xl">100%</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Compliance</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white/50 dark:bg-dark-secondary/50 overflow-y-auto custom-scrollbar">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">{isLogin ? 'Choose a login method to continue.' : 'Start your 14-day free trial.'}</p>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {requires2FA ? '2FA Verification' : (isLogin ? 'Welcome Back' : 'Create Account')}
                        </h2>
                        <p className="text-gray-400 mb-6">
                            {requires2FA ? 'Enter the code from your authenticator app.' : (isLogin ? 'Choose a login method to continue.' : 'Start your 14-day free trial.')}
                        </p>

                        {requires2FA ? (
                            <form onSubmit={handleVerify2FA} className="space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase">Verification Code</label>
                                    <input
                                        type="text"
                                        value={twoFactorCode}
                                        onChange={(e) => setTwoFactorCode(e.target.value)}
                                        required
                                        className="w-full mt-1 bg-dark-primary border border-gray-700 rounded-lg p-3 text-white text-center text-2xl tracking-[1em] focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors font-mono"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/90 transition-all shadow-[0_0_20px_rgba(0,245,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRequires2FA(false)}
                                    className="w-full text-gray-400 text-sm hover:text-white transition-colors"
                                >
                                    Back to Login
                                </button>
                            </form>
                        ) : (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            <button
                                onClick={() => handleProviderLogin('google')}
                                disabled={isLoading}
                                className="w-full py-2.5 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.92-2.91l-3.86-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                                Google
                            </button>
                             <button
                                onClick={handleBiometricLogin}
                                disabled={isLoading}
                                className="w-full py-2.5 bg-dark-primary border border-brand-cyan/30 text-brand-cyan font-semibold rounded-lg hover:bg-brand-cyan/10 transition-colors flex items-center justify-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                Face ID / Touch ID
                            </button>
                        </div>

                        <div className="space-y-3 mb-8">
                            <button 
                                onClick={() => handleProviderLogin('google')}
                                disabled={isLoading}
                                className="w-full py-3 bg-white dark:bg-white text-gray-800 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-md border border-gray-200 active:scale-[0.98]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.92-2.91l-3.86-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                                Continue with Google
                            </button>
                            <button 
                                onClick={() => handleProviderLogin('microsoft')}
                                disabled={isLoading}
                                className="w-full py-3 bg-[#2F2F2F] border border-gray-600 text-white font-bold rounded-xl hover:bg-[#3F3F3F] transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.98]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
                                Microsoft / Company Mail
                            </button>
                             <button 
                                onClick={() => handleProviderLogin('sso')}
                                disabled={isLoading}
                                className="w-full py-3 bg-transparent border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Single Sign-On (SSO)
                            </button>
                        </div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                                <span className="px-4 bg-white dark:bg-dark-secondary text-gray-400">Or use email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                            className="w-full mt-1 bg-gray-50 dark:bg-dark-primary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-medium"
                                            placeholder="Tunde Okechukwu"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                                        <input 
                                            type="text" 
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            required
                                            className="w-full mt-1 bg-gray-50 dark:bg-dark-primary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-medium"
                                            placeholder="Aura Logistics Ltd"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full mt-1 bg-gray-50 dark:bg-dark-primary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-medium"
                                    placeholder="name@company.com"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full mt-1 bg-gray-50 dark:bg-dark-primary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan transition-all outline-none font-medium"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-4 bg-brand-cyan text-black font-black rounded-xl hover:bg-brand-cyan/90 transition-all shadow-lg shadow-brand-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-[0.98] uppercase tracking-widest text-sm"
                            >
                                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button 
                                    onClick={() => setIsLogin(!isLogin)} 
                                    className="text-brand-cyan font-black hover:underline ml-1"
                                >
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>
                        </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
