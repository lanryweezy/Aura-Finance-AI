
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { useToast } from './ui/Toast';
import { TeamManagement } from './TeamManagement';
import { exportToCSV } from '../services/exportService';
import { monitoringService } from '../services/monitoringService';
import { securityService } from '../services/securityService';
import { authService } from '../services/authService';
import { ApiKey } from '../types';

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string }> = ({ label, checked, onChange, description }) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{label}</div>
            {description && <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{description}</div>}
        </div>
        <button 
            onClick={() => onChange(!checked)} 
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 dark:focus:ring-offset-dark-primary ${checked ? 'bg-brand-cyan' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const SectionHeader: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{description}</p>
    </div>
);

const SecuritySettings: React.FC = () => {
    const { showToast } = useToast();
    const [twoFactor, setTwoFactor] = useState(false);
    const [ipWhitelist, setIpWhitelist] = useState('192.168.1.1, 10.0.0.1');
    const [timeout, setTimeoutVal] = useState(30);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <Card>
                <SectionHeader title="Authentication" description="Secure your account with multi-factor authentication." />
                <Toggle
                    label="Two-Factor Authentication (MFA)"
                    description="Require a code from an authenticator app to log in."
                    checked={twoFactor}
                    onChange={setTwoFactor}
                />
                <div className="mt-4 p-4 bg-dark-secondary rounded-xl border border-white/5">
                    <button
                        onClick={async () => {
                            await securityService.registerBiometrics();
                            showToast('Biometrics registered successfully!', 'success');
                        }}
                        className="flex items-center gap-2 text-sm text-brand-cyan hover:underline font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Set up Biometric Login (Face ID / Touch ID)
                    </button>
                </div>
            </Card>

            <Card>
                <SectionHeader title="Access Restriction" description="Restrict access to specific corporate IP addresses." />
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Whitelisted IP Addresses (comma separated)</label>
                        <input
                            type="text"
                            value={ipWhitelist}
                            onChange={(e) => setIpWhitelist(e.target.value)}
                            placeholder="e.g. 192.168.1.1, 41.67.12.5"
                            className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Session Inactivity Timeout (Minutes)</label>
                        <input
                            type="number"
                            value={timeout}
                            onChange={(e) => setTimeoutVal(parseInt(e.target.value))}
                            className="w-24 bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Users will be automatically logged out after this period of inactivity.</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const DeveloperSettings: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
        { id: '1', key: 'aura_live_sk_....92a1', name: 'Server Integration', scope: 'write', createdAt: '2023-11-20T10:00:00Z' }
    ]);

    const handleGenerateKey = () => {
        const newKey = securityService.generateApiKey('New Integration', 'read');
        setApiKeys([...apiKeys, newKey]);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <Card>
                <div className="flex justify-between items-start mb-4">
                    <SectionHeader title="API Keys" description="Generate and manage keys for external integrations." />
                    <button
                        onClick={handleGenerateKey}
                        className="text-xs bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 px-3 py-1.5 rounded-lg hover:bg-brand-cyan/30 transition-colors"
                    >
                        + Generate New Key
                    </button>
                </div>

                <div className="space-y-3">
                    {apiKeys.map(key => (
                        <div key={key.id} className="p-3 bg-dark-secondary rounded-lg border border-gray-700 flex justify-between items-center">
                            <div>
                                <div className="text-sm font-bold text-white">{key.name}</div>
                                <div className="text-xs font-mono text-gray-500 mt-1">{key.key}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-brand-purple/20 text-brand-purple rounded">{key.scope}</span>
                                <button className="text-gray-500 hover:text-red-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20">
                <h4 className="text-sm font-bold text-amber-500 mb-2">Webhooks</h4>
                <p className="text-xs text-gray-400 mb-4">Receive real-time notifications for transactions, invoice payments, and payroll runs.</p>
                <button disabled className="px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-lg text-xs font-bold opacity-50 cursor-not-allowed">
                    Coming Soon
                </button>
            </Card>
        </div>
    );
};

const ComplianceSettings: React.FC = () => {
    const { showToast } = useToast();
    const user = authService.getCurrentUser()?.user;

    const handleExport = async () => {
        if (!user) return;
        const data = await securityService.exportPersonalData(user.id);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aura-data-export-${user.id}.json`;
        a.click();
        showToast('Personal data export started.', 'success');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <Card>
                <SectionHeader title="Privacy & Data Control" description="Manage your rights under GDPR, CCPA, and NDPA." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-dark-secondary rounded-xl border border-white/5 space-y-3">
                        <h4 className="text-sm font-bold text-white">Data Portability</h4>
                        <p className="text-xs text-gray-400">Download a machine-readable copy of all your personal data and activity logs.</p>
                        <button
                            onClick={handleExport}
                            className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all"
                        >
                            Request Data Export
                        </button>
                    </div>
                    <div className="p-4 bg-dark-secondary rounded-xl border border-white/5 space-y-3">
                        <h4 className="text-sm font-bold text-red-500">Account Deletion</h4>
                        <p className="text-xs text-gray-400">Permanently delete your account and all associated data. This action is irreversible.</p>
                        <button
                            onClick={() => { if(confirm("Are you SURE? All data will be lost.")) { showToast("Deletion request submitted.", "info"); } }}
                            className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition-all"
                        >
                            Delete My Account
                        </button>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-white">SOC2 Readiness</h3>
                        <p className="text-xs text-gray-400 text-green-400">Technical controls active and logging.</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                        <span>Data Encryption at Rest (AES-256)</span>
                        <span className="text-green-400 font-bold">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                        <span>Audit Logging & Versioning</span>
                        <span className="text-green-400 font-bold">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Automated Vulnerability Scanning</span>
                        <span className="text-green-400 font-bold">Enabled</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export const SettingsView: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'security' | 'developer' | 'compliance'>('profile');
    const [companyName, setCompanyName] = useState('Aura Inc.');
    const [tin, setTin] = useState('12345678-0001');
    const [email, setEmail] = useState('admin@aurainc.ng');
    const [address, setAddress] = useState('123 Innovation Dr, Lagos');
    
    const [aiEnabled, setAiEnabled] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);
    
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            showToast("Settings saved successfully!", "success");
        }, 1000);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">Manage your company profile and application preferences.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="flex gap-4 border-b border-gray-800 pb-px overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'profile' ? 'text-brand-cyan' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Organization Profile
                    {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-cyan shadow-[0_0_8px_rgba(0,245,212,0.5)]"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'team' ? 'text-brand-cyan' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Team Management
                    {activeTab === 'team' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-cyan shadow-[0_0_8px_rgba(0,245,212,0.5)]"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'security' ? 'text-brand-cyan' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Security & Access
                    {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-cyan"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('developer')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'developer' ? 'text-brand-cyan' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Developer API
                    {activeTab === 'developer' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-cyan"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('compliance')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'compliance' ? 'text-brand-cyan' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    GDPR/Compliance
                    {activeTab === 'compliance' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-cyan"></div>}
                </button>
            </div>

            {activeTab === 'team' ? (
                <TeamManagement />
            ) : activeTab === 'security' ? (
                <SecuritySettings />
            ) : activeTab === 'developer' ? (
                <DeveloperSettings />
            ) : activeTab === 'compliance' ? (
                <ComplianceSettings />
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Left Column - General Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-gray-100 dark:border-white/5 shadow-xl">
                        <SectionHeader title="Company Profile" description="Your business details for invoices and reports." />
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Company Name</label>
                                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">TIN</label>
                                    <input type="text" value={tin} onChange={e => setTin(e.target.value)} className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-mono font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Business Address</label>
                                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Contact Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                                    <input type="tel" placeholder="+234..." className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-gray-100 dark:border-white/5 shadow-xl">
                        <SectionHeader title="Regional Settings" description="Localization and currency preferences." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Base Currency</label>
                                <select disabled className="w-full bg-gray-100 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium">
                                    <option>Nigerian Naira (NGN)</option>
                                    <option>US Dollar (USD)</option>
                                    <option>British Pound (GBP)</option>
                                </select>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium italic">Base currency is set by your organization's region.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Time Zone</label>
                                <select className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan font-medium">
                                    <option>West Africa Time (WAT) - Lagos</option>
                                    <option>Greenwich Mean Time (GMT)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Date Format</label>
                                <select className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan font-medium">
                                    <option>DD/MM/YYYY</option>
                                    <option>MM/DD/YYYY</option>
                                    <option>YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Financial Year Start</label>
                                <select className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan font-medium">
                                    <option>January</option>
                                    <option>April</option>
                                    <option>July</option>
                                    <option>October</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Preferences */}
                <div className="space-y-6">
                    <Card className="border-gray-100 dark:border-white/5 shadow-xl">
                        <SectionHeader title="Preferences" description="Customize your experience." />
                         <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            <Toggle 
                                label="AI Features"
                                description="Enable O-Heidi AI analysis."
                                checked={aiEnabled} 
                                onChange={setAiEnabled} 
                            />
                            <Toggle 
                                label="Email Alerts"
                                description="Weekly summaries & alerts."
                                checked={emailAlerts} 
                                onChange={setEmailAlerts} 
                            />
                            <Toggle 
                                label="2-Factor Auth"
                                description="Enhanced account security."
                                checked={twoFactor} 
                                onChange={setTwoFactor} 
                            />
                        </div>
                    </Card>

                    <Card className="border-gray-100 dark:border-white/5 shadow-xl">
                        <SectionHeader title="Data Safety" description="Manage your records." />
                        <div className="space-y-3">
                            <button
                                onClick={() => exportToCSV('aura_audit_log', monitoringService.getLogs())}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-secondary hover:text-gray-900 dark:hover:text-white transition-all text-sm font-bold active:scale-[0.98]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Export Logs (CSV)
                            </button>
                            <button
                                onClick={() => { if(confirm("This will wipe ALL locally saved data. Proceed?")) { localStorage.clear(); window.location.reload(); } }}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-bold active:scale-[0.98]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                Factory Reset
                            </button>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-brand-purple/10 via-brand-purple/5 to-transparent border-brand-purple/20 shadow-xl overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-purple/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                 <div className="p-2.5 bg-brand-purple/20 rounded-xl text-brand-purple shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>
                                 </div>
                                 <h3 className="font-bold text-gray-900 dark:text-white">Upgrade Plan</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 font-medium leading-relaxed">You are currently on the <span className="text-brand-purple font-bold">Free Tier</span>. Upgrade to unlock unlimited invoices and advanced AI reports.</p>
                            <button className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-all text-sm shadow-lg active:scale-[0.98]">View Pricing</button>
                        </div>
                    </Card>
                </div>
            </div>
            )}
        </div>
    );
};
