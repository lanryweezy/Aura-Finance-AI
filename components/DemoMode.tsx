import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDemoData } from '../services/demoDataService';
import { useAppStore } from '../store/useAppStore';

export const DemoMode: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();

  const handleStartDemo = () => {
    const { transactions, invoices, bills, employees, contacts, projects, budgets } = loadDemoData();

    // Set user
    setUser({
      id: 'u_demo',
      name: 'Demo User',
      email: 'demo@aura.ai',
      role: 'Owner',
      organizationId: 'org_demo',
    });

    // Load demo data into store
    const store = useAppStore.getState();
    store.setTransactions(transactions);
    store.setInvoices(invoices);
    store.setBills(bills);
    store.setEmployees(employees);
    store.setContacts(contacts);
    store.setProjects(projects);
    store.setBudgets(budgets);
    store.setIsLoading(false);

    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-dark-secondary border border-white/10 rounded-3xl w-full max-w-lg p-8 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-2xl font-black mb-2">Try Aura Finance AI</h2>
        <p className="text-gray-400 mb-6">
          Experience the full product with realistic Nigerian business data. No signup required.
        </p>

        <div className="bg-dark-primary border border-white/10 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 mb-2">Demo includes:</p>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>✓ 6 months of realistic transactions</li>
            <li>✓ 5 invoices (paid, unpaid, overdue)</li>
            <li>✓ 5 bills from vendors</li>
            <li>✓ 5 employees with Nigerian payroll</li>
            <li>✓ AI CFO with 4 agents</li>
            <li>✓ Full accounting features</li>
          </ul>
        </div>

        <button
          onClick={handleStartDemo}
          className="w-full py-4 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all text-lg shadow-lg shadow-brand-cyan/20"
        >
          Launch Demo →
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Data is stored locally. No account needed.
        </p>
      </div>
    </div>
  );
};
