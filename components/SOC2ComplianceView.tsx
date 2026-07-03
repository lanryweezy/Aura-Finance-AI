import React from 'react';

export interface SOC2Control {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'planned';
  lastVerified?: string;
}

export const SOC2_CONTROLS: SOC2Control[] = [
  // Security
  { id: 'SC-1', category: 'Security', name: 'Access Control', description: 'Role-based access control with Owner/Admin/Accountant/Viewer roles', status: 'implemented' },
  { id: 'SC-2', category: 'Security', name: 'Authentication', description: 'Supabase Auth with email/password and Google OAuth', status: 'implemented' },
  { id: 'SC-3', category: 'Security', name: 'Session Management', description: 'Auto-logout after configurable timeout', status: 'implemented' },
  { id: 'SC-4', category: 'Security', name: 'Encryption at Rest', description: 'Supabase AES-256 encryption for all data', status: 'implemented' },
  { id: 'SC-5', category: 'Security', name: 'Encryption in Transit', description: 'TLS 1.2+ for all API communications', status: 'implemented' },
  { id: 'SC-6', category: 'Security', name: 'API Key Management', description: 'Secure API key generation and rotation', status: 'implemented' },
  { id: 'SC-7', category: 'Security', name: 'IP Whitelisting', description: 'Restrict access by IP address', status: 'implemented' },

  // Availability
  { id: 'AV-1', category: 'Availability', name: 'Uptime Monitoring', description: 'Sentry error tracking and uptime monitoring', status: 'implemented' },
  { id: 'AV-2', category: 'Availability', name: 'Backup & Recovery', description: 'Automated daily backups with point-in-time recovery', status: 'partial' },
  { id: 'AV-3', category: 'Availability', name: 'Disaster Recovery', description: 'DR plan with RTO < 4 hours, RPO < 1 hour', status: 'planned' },

  // Processing Integrity
  { id: 'PI-1', category: 'Processing Integrity', name: 'Data Validation', description: 'Input validation on all forms and API endpoints', status: 'implemented' },
  { id: 'PI-2', category: 'Processing Integrity', name: 'Audit Trail', description: 'Complete audit trail for all financial transactions', status: 'implemented' },
  { id: 'PI-3', category: 'Processing Integrity', name: 'Double-Entry Bookkeeping', description: 'Balanced journal entries enforced', status: 'implemented' },

  // Confidentiality
  { id: 'CF-1', category: 'Confidentiality', name: 'Data Classification', description: 'Sensitive data classified and protected', status: 'implemented' },
  { id: 'CF-2', category: 'Confidentiality', name: 'Access Logging', description: 'All data access logged and auditable', status: 'implemented' },
  { id: 'CF-3', category: 'Confidentiality', name: 'Data Retention', description: 'Configurable data retention policies', status: 'partial' },

  // Privacy
  { id: 'PR-1', category: 'Privacy', name: 'Data Minimization', description: 'Collect only necessary data', status: 'implemented' },
  { id: 'PR-2', category: 'Privacy', name: 'Right to Deletion', description: 'Users can delete their account and data', status: 'implemented' },
  { id: 'PR-3', category: 'Privacy', name: 'Privacy Policy', description: 'Published privacy policy', status: 'implemented' },
];

export const SOC2ComplianceView: React.FC = () => {
  const implemented = SOC2_CONTROLS.filter(c => c.status === 'implemented').length;
  const partial = SOC2_CONTROLS.filter(c => c.status === 'partial').length;
  const planned = SOC2_CONTROLS.filter(c => c.status === 'planned').length;
  const total = SOC2_CONTROLS.length;
  const score = Math.round((implemented / total) * 100);

  const categories = [...new Set(SOC2_CONTROLS.map(c => c.category))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">SOC 2 Compliance</h2>
        <p className="text-gray-500 mt-1">Security, availability, and confidentiality controls</p>
      </div>

      {/* Score Card */}
      <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Compliance Score</h3>
          <span className={`text-3xl font-black ${score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {score}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${score}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-green-400">{implemented}</p>
            <p className="text-xs text-gray-500">Implemented</p>
          </div>
          <div>
            <p className="text-2xl font-black text-yellow-400">{partial}</p>
            <p className="text-xs text-gray-500">Partial</p>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-400">{planned}</p>
            <p className="text-xs text-gray-500">Planned</p>
          </div>
        </div>
      </div>

      {/* Controls by Category */}
      {categories.map(category => (
        <div key={category} className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-5">
          <h3 className="font-bold mb-3">{category}</h3>
          <div className="space-y-2">
            {SOC2_CONTROLS.filter(c => c.category === category).map(control => (
              <div key={control.id} className="flex items-center gap-3 text-sm">
                <span className={`w-2 h-2 rounded-full ${
                  control.status === 'implemented' ? 'bg-green-400' :
                  control.status === 'partial' ? 'bg-yellow-400' : 'bg-gray-400'
                }`} />
                <span className="flex-1">{control.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  control.status === 'implemented' ? 'bg-green-500/20 text-green-400' :
                  control.status === 'partial' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {control.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
