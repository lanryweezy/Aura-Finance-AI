import React, { useState, useEffect } from 'react';
import { spendPolicyService, type SpendPolicy, type PolicyViolation } from '../services/spendPolicyService';

export const SpendPolicyWidget: React.FC = () => {
  const [policies, setPolicies] = useState<SpendPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    spendPolicyService.fetchPolicies().then(setPolicies).finally(() => setLoading(false));
  }, []);

  if (loading || policies.length === 0) return null;

  return (
    <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm">Spend Policies</h3>
          <p className="text-xs text-gray-500">{policies.filter(p => p.isActive).length} active policies</p>
        </div>
        <span className="text-lg">🛡️</span>
      </div>

      <div className="space-y-2">
        {policies.filter(p => p.isActive).slice(0, 3).map(policy => (
          <div key={policy.id} className="p-3 bg-dark-primary rounded-xl">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-bold">{policy.name}</span>
              <span className="text-gray-500">₦{policy.maxAmount.toLocaleString()}/txn</span>
            </div>
            <div className="flex gap-2 text-[10px] text-gray-500">
              <span>Daily: ₦{policy.maxDaily.toLocaleString()}</span>
              <span>Monthly: ₦{policy.maxMonthly.toLocaleString()}</span>
            </div>
            {policy.blockedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {policy.blockedCategories.map(cat => (
                  <span key={cat} className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded text-[10px]">
                    ✕ {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
