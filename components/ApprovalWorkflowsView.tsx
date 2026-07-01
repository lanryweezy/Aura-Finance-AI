import React, { useState, useEffect } from 'react';
import { approvalService } from '../services/approvalService';
import type { ApprovalRequest, ApprovalPolicy } from '../types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
};

const entityLabels: Record<string, string> = {
  invoice: 'Invoice',
  bill: 'Bill',
  purchase_order: 'Purchase Order',
  journal_entry: 'Journal Entry',
  expense_claim: 'Expense Claim',
};

export const ApprovalWorkflowsView: React.FC = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [policies, setPolicies] = useState<ApprovalPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'policies'>('requests');
  const [filter, setFilter] = useState<string>('pending');

  useEffect(() => {
    Promise.all([
      approvalService.fetchRequests(),
      approvalService.fetchPolicies(),
    ]).then(([r, p]) => { setRequests(r); setPolicies(p); }).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => {
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
    const updated = await approvalService.approve(id, user.id, user.name);
    if (updated) setRequests(prev => prev.map(r => r.id === id ? updated : r));
  };

  const handleReject = async (id: string) => {
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
    const updated = await approvalService.reject(id, user.id, user.name, 'Rejected by admin');
    if (updated) setRequests(prev => prev.map(r => r.id === id ? updated : r));
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading approvals...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Approval Workflows</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review and approve financial transactions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('requests')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'requests' ? 'bg-brand-cyan text-black' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Requests {pendingCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">{pendingCount}</span>}
        </button>
        <button
          onClick={() => setTab('policies')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'policies' ? 'bg-brand-cyan text-black' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Policies
        </button>
      </div>

      {tab === 'requests' && (
        <>
          {/* Filters */}
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected', 'all'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-brand-cyan text-black' : 'bg-white/5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Request List */}
          <div className="space-y-3">
            {filtered.map(req => (
              <div key={req.id} className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">
                        {entityLabels[req.entityType] || req.entityType}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusColors[req.status]}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="font-bold text-sm">{req.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested by {req.requestedByName} • ₦{req.amount.toLocaleString()}
                    </p>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Approval Steps */}
                <div className="flex gap-2 mt-3">
                  {req.approvals.map((step, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.status === 'approved' ? 'bg-green-500 text-white' :
                        step.status === 'rejected' ? 'bg-red-500 text-white' :
                        'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}>
                        {step.status === 'approved' ? '✓' : step.status === 'rejected' ? '✕' : step.level}
                      </div>
                      <span className="text-xs text-gray-500">{step.approverName}</span>
                      {i < req.approvals.length - 1 && <span className="text-gray-300 mx-1">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No {filter !== 'all' ? filter : ''} requests
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'policies' && (
        <div className="space-y-3">
          {policies.map(policy => (
            <div key={policy.id} className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-sm">{policy.name}</p>
                  <p className="text-xs text-gray-500">
                    {entityLabels[policy.entityType] || policy.entityType} • ₦{policy.minAmount.toLocaleString()}
                    {policy.maxAmount ? ` — ₦${policy.maxAmount.toLocaleString()}` : '+'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${policy.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {policy.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {policy.levels.map((level, i) => (
                  <div key={i} className="text-xs bg-white/5 px-2 py-1 rounded-lg">
                    L{level.level}: {level.approverName || level.approverRole}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {policies.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No approval policies</p>
              <p className="text-sm">Create policies to require approvals for transactions above certain amounts</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
