
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { ComingSoon } from './ui/ComingSoon';

interface Integration {
  name: string;
  logoUrl: string;
  description: string;
  category: 'Payment Gateways' | 'HR & Payroll' | 'E-commerce' | 'Productivity' | 'Accounting';
  status: 'Coming Soon' | 'Active';
}

const allIntegrations: Integration[] = [
  // Accounting
  {
    name: 'QuickBooks',
    logoUrl: 'https://logo.clearbit.com/quickbooks.intuit.com',
    description: 'Two-way sync of invoices, bills, and ledgers for your external accountants.',
    category: 'Accounting',
    status: 'Coming Soon',
  },
  {
    name: 'Xero',
    logoUrl: 'https://logo.clearbit.com/xero.com',
    description: 'Push verified transactions and mapped accounts directly to Xero.',
    category: 'Accounting',
    status: 'Coming Soon',
  },
  {
    name: 'ZohoBooks',
    logoUrl: 'https://logo.clearbit.com/zoho.com',
    description: 'Keep your ZohoBooks ledger in perfect harmony with Aura.',
    category: 'Accounting',
    status: 'Coming Soon',
  },
  // Payment Gateways
  {
    name: 'Paystack',
    logoUrl: 'https://asset.brandfetch.io/idY_J2a-3h/id_LF2v35r.svg',
    description: 'Automatically sync sales, fees, and payouts from your Paystack account.',
    category: 'Payment Gateways',
    status: 'Coming Soon',
  },
  {
    name: 'Flutterwave',
    logoUrl: 'https://asset.brandfetch.io/idA805S2Tz/idFxh97h51.svg',
    description: 'Reconcile your income by connecting your Flutterwave store and payment links.',
    category: 'Payment Gateways',
    status: 'Coming Soon',
  },
  {
    name: 'Interswitch',
    logoUrl: 'https://www.interswitchgroup.com/images/logo/logo-blue.svg',
    description: 'Connect your Interswitch Payment Gateway for seamless transaction reconciliation.',
    category: 'Payment Gateways',
    status: 'Coming Soon',
  },
  // HR & Payroll
  {
    name: 'SeamlessHR',
    logoUrl: 'https://seamlesshr.com/wp-content/uploads/2022/07/logo.svg',
    description: 'Sync employee data and payroll expenses to automate your salary bookkeeping.',
    category: 'HR & Payroll',
    status: 'Coming Soon',
  },
  {
    name: 'Bento',
    logoUrl: 'https://assets-global.website-files.com/62ab25f654b9c148c79219e2/62ab29e4695b2149b5c328e1_bento-logo.svg',
    description: 'Import payroll reports from Bento to keep your salary expenses up to date.',
    category: 'HR & Payroll',
    status: 'Coming Soon',
  },
  {
    name: 'Pade',
    logoUrl: 'https://pade.co/img/pade_logo.png',
    description: 'Connect Pade to automatically record salary payments and compliance costs.',
    category: 'HR & Payroll',
    status: 'Coming Soon',
  },
   // E-commerce
  {
    name: 'Shopify',
    logoUrl: 'https://logo.clearbit.com/shopify.com',
    description: 'Import sales, refunds, and fees from your Shopify store automatically.',
    category: 'E-commerce',
    status: 'Coming Soon',
  },
  {
    name: 'WooCommerce',
    logoUrl: 'https://logo.clearbit.com/woocommerce.com',
    description: 'Connect your WooCommerce-powered site to get a clear picture of your sales.',
    category: 'E-commerce',
    status: 'Coming Soon',
  },
  {
    name: 'Bumpa',
    logoUrl: 'https://getbumpa.com/images/bumpa_logo_on_white.svg',
    description: 'Sync your sales data directly from your Bumpa mobile storefront.',
    category: 'E-commerce',
    status: 'Coming Soon',
  },
  // Productivity
  {
    name: 'Slack',
    logoUrl: 'https://logo.clearbit.com/slack.com',
    description: 'Approve expenses, receive alerts, and chat with O-Heidi AI directly in Slack.',
    category: 'Productivity',
    status: 'Coming Soon',
  },
  {
    name: 'Microsoft Teams',
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    description: 'Bring Aura expense approvals and financial reporting into MS Teams.',
    category: 'Productivity',
    status: 'Coming Soon',
  },
  {
    name: 'Google Drive',
    logoUrl: 'https://logo.clearbit.com/drive.google.com',
    description: 'Automatically back up your reports and scanned receipts to Google Drive.',
    category: 'Productivity',
    status: 'Coming Soon',
  },
];

const integrationCategories = [
    'Accounting',
    'Payment Gateways',
    'HR & Payroll',
    'E-commerce',
    'Productivity',
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
    const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

    if (selectedIntegration) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <button onClick={() => setSelectedIntegration(null)} className="flex items-center gap-2 text-brand-cyan font-black text-sm hover:underline mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Back to Hub
                </button>
                <ComingSoon featureName={`${selectedIntegration} Integration`} />
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
                            .map(integration => (
                                <IntegrationCard
                                    key={integration.name}
                                    integration={integration}
                                    onClick={() => setSelectedIntegration(integration.name)}
                                />
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};
