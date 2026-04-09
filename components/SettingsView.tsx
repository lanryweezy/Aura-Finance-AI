
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { useToast } from './ui/Toast';
import { TeamManagement } from './TeamManagement';
import { exportToCSV } from '../services/exportService';

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string }> = ({ label, checked, onChange, description }) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <div className="text-sm font-medium text-white">{label}</div>
            {description && <div className="text-xs text-gray-400">{description}</div>}
        </div>
        <button 
            onClick={() => onChange(!checked)} 
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-offset-2 focus:ring-offset-dark-primary ${checked ? 'bg-brand-cyan' : 'bg-gray-700'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const SectionHeader: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="mb-4 border-b border-gray-700 pb-2">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
    </div>
);

export const SettingsView: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'profile' | 'team'>('profile');
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Settings</h2>
                    <p className="text-gray-400 mt-1">Manage your company profile and application preferences.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,245,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="flex gap-4 border-b border-gray-800 pb-px">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'profile' ? 'text-brand-cyan' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Organization Profile
                    {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-cyan"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'team' ? 'text-brand-cyan' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Team Management
                    {activeTab === 'team' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-cyan"></div>}
                </button>
            </div>

            {activeTab === 'team' ? (
                <TeamManagement />
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                {/* Left Column - General Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <SectionHeader title="Company Profile" description="Your business details for invoices and reports." />
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Company Name</label>
                                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Tax Identification Number (TIN)</label>
                                    <input type="text" value={tin} onChange={e => setTin(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Business Address</label>
                                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Contact Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
                                    <input type="tel" placeholder="+234..." className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-colors" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <SectionHeader title="Regional Settings" description="Localization and currency preferences." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Base Currency</label>
                                <select disabled className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-gray-400 cursor-not-allowed">
                                    <option>Nigerian Naira (NGN)</option>
                                    <option>US Dollar (USD)</option>
                                    <option>British Pound (GBP)</option>
                                </select>
                                <p className="text-[10px] text-gray-500 mt-1">Base currency is set by your organization's region and cannot be changed.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Time Zone</label>
                                <select className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan">
                                    <option>West Africa Time (WAT) - Lagos</option>
                                    <option>Greenwich Mean Time (GMT)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Date Format</label>
                                <select className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan">
                                    <option>DD/MM/YYYY</option>
                                    <option>MM/DD/YYYY</option>
                                    <option>YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Financial Year Start</label>
                                <select className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan">
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
                    <Card>
                        <SectionHeader title="Application Preferences" description="Customize your Aura experience." />
                         <div className="divide-y divide-gray-800">
                            <Toggle 
                                label="Enable AI Features" 
                                description="Allow O-Heidi AI to analyze your data for insights."
                                checked={aiEnabled} 
                                onChange={setAiEnabled} 
                            />
                            <Toggle 
                                label="Email Notifications" 
                                description="Receive weekly summaries and alerts."
                                checked={emailAlerts} 
                                onChange={setEmailAlerts} 
                            />
                            <Toggle 
                                label="Two-Factor Auth" 
                                description="Require OTP for login."
                                checked={twoFactor} 
                                onChange={setTwoFactor} 
                            />
                        </div>
                    </Card>

                    <Card>
                        <SectionHeader title="Data Management" description="Export or reset your account data." />
                        <div className="space-y-3">
                            <button
                                onClick={() => exportToCSV('aura_audit_log', monitoringService.getLogs())}
                                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-dark-secondary hover:text-white transition-colors text-sm font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Export Audit Logs (CSV)
                            </button>
                            <button
                                onClick={() => { if(confirm("This will wipe ALL locally saved data. Proceed?")) { localStorage.clear(); window.location.reload(); } }}
                                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-red-900/50 text-red-500 hover:bg-red-900/20 transition-colors text-sm font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                Factory Reset Aura
                            </button>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-brand-purple/20 to-transparent border-brand-purple/30">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-brand-purple/20 rounded-full text-brand-purple">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>
                             </div>
                             <h3 className="font-bold text-white">Upgrade Plan</h3>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">You are currently on the <span className="text-brand-cyan font-bold">Free Tier</span>. Upgrade to unlock unlimited invoices and advanced AI reports.</p>
                        <button className="w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm">View Pricing</button>
                    </Card>
                </div>
            </div>
            )}
        </div>
    );
};
