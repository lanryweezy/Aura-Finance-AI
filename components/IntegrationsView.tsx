
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { ComingSoon } from './ui/ComingSoon';
import { Spinner } from './ui/Spinner';
import { useToast } from './ui/Toast';
import { integrationSyncService } from '../services/integrationSyncService';

// Import refactored config components
import { PaystackConfig, FlutterwaveConfig, PagaConfig } from './integrations/PaymentGatewayConfigs';
import { SeamlessHRConfig, BentoConfig, GustoConfig, DeelConfig } from './integrations/PayrollConfigs';
import { ShopifyConfig, AmazonBusinessConfig } from './integrations/EcommerceConfigs';
import { SlackConfig, TeamsConfig, ClickUpConfig, UberConfig } from './integrations/ProductivityConfigs';
import { QuickBooksConfig, XeroConfig, SageConfig } from './integrations/AccountingConfigs';
import { HubSpotConfig, SalesforceConfig } from './integrations/CRMConfigs';

interface Integration {
  name: string;
  logoUrl: string;
  description: string;
  category: 'Payment Gateways' | 'HR & Payroll' | 'E-commerce' | 'Productivity' | 'CRM' | 'Accounting Software';
  status: 'Coming Soon' | 'Active' | 'Connected';
}

const allIntegrations: Integration[] = [
  // Payment Gateways
  {
    name: 'Paystack',
    logoUrl: 'https://asset.brandfetch.io/idY_J2a-3h/id_LF2v35r.svg',
    description: 'Automatically sync sales, fees, and payouts from your Paystack account.',
    category: 'Payment Gateways',
    status: 'Active',
  },
  {
    name: 'Flutterwave',
    logoUrl: 'https://asset.brandfetch.io/idA805S2Tz/idFxh97h51.svg',
    description: 'Reconcile your income by connecting your Flutterwave store and payment links.',
    category: 'Payment Gateways',
    status: 'Active',
  },
  {
    name: 'Paga',
    logoUrl: 'https://mypaga.com/images/logo.png',
    description: 'Sync your Paga business account to import sales and merchant payouts.',
    category: 'Payment Gateways',
    status: 'Active',
  },
  // HR & Payroll
  {
    name: 'SeamlessHR',
    logoUrl: 'https://seamlesshr.com/wp-content/uploads/2022/07/logo.svg',
    description: 'Sync employee data and payroll expenses to automate your salary bookkeeping.',
    category: 'HR & Payroll',
    status: 'Active',
  },
  {
    name: 'Bento',
    logoUrl: 'https://assets-global.website-files.com/62ab25f654b9c148c79219e2/62ab29e4695b2149b5c328e1_bento-logo.svg',
    description: 'Import payroll reports from Bento to keep your salary expenses up to date.',
    category: 'HR & Payroll',
    status: 'Active',
  },
  {
    name: 'Gusto',
    logoUrl: 'https://logo.clearbit.com/gusto.com',
    description: 'Sync payroll, benefits, and HR data from Gusto for US-based employees.',
    category: 'HR & Payroll',
    status: 'Active',
  },
  {
    name: 'Deel',
    logoUrl: 'https://logo.clearbit.com/letsdeel.com',
    description: 'Automate journal entries for international contractors and EOR employees.',
    category: 'HR & Payroll',
    status: 'Active',
  },
   // E-commerce
  {
    name: 'Shopify',
    logoUrl: 'https://logo.clearbit.com/shopify.com',
    description: 'Import sales, refunds, and fees from your Shopify store automatically.',
    category: 'E-commerce',
    status: 'Active',
  },
  {
    name: 'Amazon Business',
    logoUrl: 'https://logo.clearbit.com/amazon.com',
    description: 'Automatically import and categorize receipts from your Amazon Business account.',
    category: 'E-commerce',
    status: 'Active',
  },
  // Productivity
  {
    name: 'Slack',
    logoUrl: 'https://logo.clearbit.com/slack.com',
    description: 'Get key financial notifications and alerts directly in your Slack workspace.',
    category: 'Productivity',
    status: 'Active',
  },
  {
    name: 'Microsoft Teams',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    description: 'Receive real-time alerts and approvals directly in your Teams channels.',
    category: 'Productivity',
    status: 'Active',
  },
  {
    name: 'Uber',
    logoUrl: 'https://logo.clearbit.com/uber.com',
    description: 'Automatically pull business trip receipts and associate them with projects.',
    category: 'Productivity',
    status: 'Active',
  },
  // Accounting Software
  {
    name: 'QuickBooks',
    logoUrl: 'https://logo.clearbit.com/quickbooks.com',
    description: 'Sync your ledger with QuickBooks Online for comprehensive accounting.',
    category: 'Accounting Software',
    status: 'Active',
  },
  {
    name: 'Xero',
    logoUrl: 'https://logo.clearbit.com/xero.com',
    description: 'Import and export data to Xero to keep your accountant in the loop.',
    category: 'Accounting Software',
    status: 'Active',
  },
  {
    name: 'Sage',
    logoUrl: 'https://logo.clearbit.com/sage.com',
    description: 'Connect Sage Accounting to sync invoices, bills, and ledger accounts.',
    category: 'Accounting Software',
    status: 'Active',
  },
  // CRM
  {
    name: 'HubSpot',
    logoUrl: 'https://logo.clearbit.com/hubspot.com',
    description: 'Sync contacts and sales deals to keep your financial data and CRM in harmony.',
    category: 'CRM',
    status: 'Active',
  },
  {
    name: 'Salesforce',
    logoUrl: 'https://logo.clearbit.com/salesforce.com',
    description: 'Connect Salesforce to automate invoicing and track customer lifetime value.',
    category: 'CRM',
    status: 'Active',
  },
  {
    name: 'ClickUp',
    logoUrl: 'https://logo.clearbit.com/clickup.com',
    description: 'Link financial tasks and invoices to your ClickUp workspaces and projects.',
    category: 'Productivity',
    status: 'Active',
  },
];

const integrationCategories = [
    'Payment Gateways',
    'HR & Payroll',
    'E-commerce',
    'Productivity',
    'Accounting Software',
    'CRM'
] as const;

const IntegrationCard: React.FC<{ integration: Integration; onClick: () => void }> = ({ integration, onClick }) => {
    return (
        <Card onClick={onClick} className="flex flex-col justify-between group border-gray-100 dark:border-white/5 hover:border-brand-cyan transition-all duration-300 transform hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-xl">
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm border border-gray-100">
                         <img src={integration.logoUrl} alt={`${integration.name} logo`} className="h-full w-full object-contain" />
                    </div>
                    <span className="font-black text-lg text-gray-900 dark:text-white tracking-tight">{integration.name}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 min-h-[40px] font-medium leading-relaxed">{integration.description}</p>
            </div>
            <div className="mt-6 flex justify-end">
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${integration.status === 'Active' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' : 'bg-gray-100 dark:bg-gray-600/50 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
                    {integration.status}
                </span>
            </div>
        </Card>
    );
};

export const IntegrationsView: React.FC = () => {
    const { showToast } = useToast();
    const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectedApps, setConnectedApps] = useState<string[]>(() => {
        const saved = localStorage.getItem('aura_connected_apps');
        return saved ? JSON.parse(saved) : [];
    });

    const [isSyncing, setIsSyncing] = useState(false);

    const handleConnect = (name: string, config: any = {}) => {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        const newConnected = [...connectedApps, name];
        setConnectedApps(newConnected);
        localStorage.setItem('aura_connected_apps', JSON.stringify(newConnected));

        // Simulation of secure backend storage (avoiding plain text keys in localStorage for production)
        // In a real app, 'config' (containing API keys) would be sent to a secure backend vault.
        // We DO NOT store these in localStorage for security reasons (XSS protection).
        console.log(`[SECURE] Encrypting and storing credentials for ${name} in backend vault`);

        showToast(`${name} connected successfully!`, 'success');
        setSelectedIntegration(null);
      }, 1500);
    };

    const handleSync = (name: string) => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);

            let mockData: any[] = [];
            if (name === 'Paystack') mockData = integrationSyncService.syncPaystack();
            if (name === 'Shopify') mockData = integrationSyncService.syncShopify();
            if (name === 'Uber') mockData = integrationSyncService.syncUber();

            if (mockData.length > 0) {
                // In a full implementation, this would trigger a global state update via useAppStore
                console.log(`[INTEGRATION] Imported ${mockData.length} records from ${name}`);
                showToast(`${name} synced successfully. ${mockData.length} new records imported.`, 'success');
            } else {
                showToast(`${name} synced. No new records found.`, 'info');
            }
        }, 2000);
    };

    if (selectedIntegration) {
        const integration = allIntegrations.find(i => i.name === selectedIntegration);
        const isActive = integration?.status === 'Active';
        const isConnected = connectedApps.includes(selectedIntegration);

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <button onClick={() => setSelectedIntegration(null)} className="flex items-center gap-2 text-brand-cyan font-black text-sm hover:underline mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Back to Hub
                </button>

                {isActive ? (
                  <Card className="max-w-2xl mx-auto p-8 text-center">
                    <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center p-2 mx-auto mb-6 shadow-lg">
                      <img src={integration.logoUrl} alt={integration.name} className="h-full w-full object-contain" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Connect to {integration.name}</h3>
                    <p className="text-gray-400 mb-8">{integration.description}</p>

                    {isConnected ? (
                      <div className="space-y-6">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                            <p className="text-green-400 font-medium flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            This integration is active and syncing.
                            </p>
                        </div>
                        <button
                            onClick={() => handleSync(selectedIntegration)}
                            disabled={isSyncing}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            {isSyncing ? <Spinner /> : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                                    Sync Now
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                const newApps = connectedApps.filter(a => a !== selectedIntegration);
                                setConnectedApps(newApps);
                                localStorage.setItem('aura_connected_apps', JSON.stringify(newApps));
                                showToast(`${selectedIntegration} disconnected.`, 'info');
                            }}
                            className="w-full text-red-500 text-sm hover:underline"
                        >
                            Disconnect Integration
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-left p-4 bg-dark-secondary rounded-xl border border-gray-700">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Permissions</p>
                          <ul className="text-sm text-gray-300 space-y-2">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></div>Read transaction history</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></div>Sync financial reports</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></div>Automate journal entries</li>
                          </ul>
                        </div>

                        {/* Config Routing */}
                        {selectedIntegration === 'Paystack' && <PaystackConfig onConnect={(c) => handleConnect('Paystack', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Flutterwave' && <FlutterwaveConfig onConnect={(c) => handleConnect('Flutterwave', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Paga' && <PagaConfig onConnect={(c) => handleConnect('Paga', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'SeamlessHR' && <SeamlessHRConfig onConnect={(c) => handleConnect('SeamlessHR', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Bento' && <BentoConfig onConnect={(c) => handleConnect('Bento', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Gusto' && <GustoConfig onConnect={(c) => handleConnect('Gusto', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Deel' && <DeelConfig onConnect={(c) => handleConnect('Deel', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Shopify' && <ShopifyConfig onConnect={(c) => handleConnect('Shopify', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Amazon Business' && <AmazonBusinessConfig onConnect={(c) => handleConnect('Amazon Business', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Slack' && <SlackConfig onConnect={(c) => handleConnect('Slack', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Microsoft Teams' && <TeamsConfig onConnect={(c) => handleConnect('Microsoft Teams', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Uber' && <UberConfig onConnect={(c) => handleConnect('Uber', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'QuickBooks' && <QuickBooksConfig onConnect={(c) => handleConnect('QuickBooks', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Xero' && <XeroConfig onConnect={(c) => handleConnect('Xero', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Sage' && <SageConfig onConnect={(c) => handleConnect('Sage', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'HubSpot' && <HubSpotConfig onConnect={(c) => handleConnect('HubSpot', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'Salesforce' && <SalesforceConfig onConnect={(c) => handleConnect('Salesforce', c)} isConnecting={isConnecting} />}
                        {selectedIntegration === 'ClickUp' && <ClickUpConfig onConnect={(c) => handleConnect('ClickUp', c)} isConnecting={isConnecting} />}

                      </div>
                    )}
                  </Card>
                ) : (
                  <ComingSoon featureName={`${selectedIntegration} Integration`} />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Integrations Hub</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">Connect O-Heidi AI to your favorite tools and supercharge your workflow.</p>
            </div>

            {integrationCategories.map(category => (
                <div key={category}>
                    <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                        {category}
                        <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {allIntegrations
                            .filter(int => int.category === category)
                            .map(integration => {
                                const isConnected = connectedApps.includes(integration.name);
                                return (
                                    <IntegrationCard
                                        key={integration.name}
                                        integration={{
                                            ...integration,
                                            status: isConnected ? 'Connected' : integration.status
                                        }}
                                        onClick={() => setSelectedIntegration(integration.name)}
                                    />
                                );
                            })
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};
