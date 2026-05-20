
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { useToast } from './ui/Toast';
import { teamService, TeamMember, UserRole, PermissionSet } from '../services/teamService';

export const TeamManagement: React.FC = () => {
    const { showToast } = useToast();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [customRoles, setCustomRoles] = useState<PermissionSet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);

    // Invite Form State
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<UserRole>('Viewer');

    // New Role State
    const [newRoleName, setNewRoleName] = useState('');
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [membersData, rolesData] = await Promise.all([
                teamService.fetchMembers(),
                teamService.fetchCustomRoles()
            ]);
            setMembers(membersData);
            setCustomRoles(rolesData);
        } catch (e) {
            showToast('Failed to load team management data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            const newMember = await teamService.inviteMember(inviteName, inviteEmail, inviteRole);
            setMembers(prev => [...prev, newMember]);
            showToast(`Invitation sent to ${inviteEmail}`, 'success');
            setInviteName('');
            setInviteEmail('');
        } catch (e) {
            showToast('Failed to send invitation', 'error');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            await teamService.removeMember(id);
            setMembers(prev => prev.filter(m => m.id !== id));
            showToast('Member removed from organization', 'success');
        } catch (e) {
            showToast('Failed to remove member', 'error');
        }
    };

    const permissionsList = [
        { key: 'reports_view', name: 'View Reports', baseRoles: ['Owner', 'Admin', 'Accountant', 'Viewer'] },
        { key: 'reports_export', name: 'Export Reports', baseRoles: ['Owner', 'Admin', 'Accountant'] },
        { key: 'invoices_create', name: 'Create Invoices', baseRoles: ['Owner', 'Admin', 'Accountant'] },
        { key: 'invoices_delete', name: 'Delete Invoices', baseRoles: ['Owner', 'Admin'] },
        { key: 'payroll_run', name: 'Run Payroll', baseRoles: ['Owner', 'Admin', 'Accountant'] },
        { key: 'settings_manage', name: 'Manage Settings', baseRoles: ['Owner', 'Admin'] },
        { key: 'audit_view', name: 'View Audit Trail', baseRoles: ['Owner', 'Admin'] },
    ];

    const handleCreateRole = async () => {
        if (!newRoleName) return showToast('Please enter a role name', 'error');
        try {
            const role = await teamService.saveCustomRole({
                name: newRoleName,
                permissions: selectedPerms
            });
            setCustomRoles([...customRoles, role]);
            setShowRoleModal(false);
            setNewRoleName('');
            setSelectedPerms([]);
            showToast(`Custom role "${newRoleName}" created!`, 'success');
        } catch (e) {
            showToast('Failed to create role', 'error');
        }
    };

    return (
        <div className="space-y-8 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Invite and manage roles for your organization.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invite Form */}
                <Card className="lg:col-span-1 h-fit border-gray-100 dark:border-white/5 shadow-xl">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Invite Member</h4>
                    <form onSubmit={handleInvite} className="space-y-5">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Full Name</label>
                            <input
                                type="text"
                                value={inviteName}
                                onChange={e => setInviteName(e.target.value)}
                                required
                                className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white mt-2 text-sm font-medium focus:ring-2 focus:ring-brand-cyan outline-none transition-all"
                                placeholder="Tunde Oke"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Email Address</label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                required
                                className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white mt-2 text-sm font-medium focus:ring-2 focus:ring-brand-cyan outline-none transition-all"
                                placeholder="colleague@company.com"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Role</label>
                            <select
                                value={inviteRole}
                                onChange={e => setInviteRole(e.target.value as UserRole)}
                                className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white mt-2 text-sm font-bold focus:ring-2 focus:ring-brand-cyan outline-none transition-all"
                            >
                                <option value="Viewer">Viewer (Read-only)</option>
                                <option value="Accountant">Accountant</option>
                                <option value="Admin">Administrator</option>
                                {customRoles.map(role => (
                                    <option key={role.id} value={role.name}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={isInviting}
                            className="w-full py-3.5 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/90 transition-all shadow-lg shadow-brand-cyan/20 disabled:opacity-50 active:scale-95 mt-2"
                        >
                            {isInviting ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </form>
                </Card>

                {/* Team List */}
                <Card className="lg:col-span-2 overflow-hidden border-gray-100 dark:border-white/5 shadow-xl flex flex-col">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Current Members</h4>
                    {isLoading ? (
                        <div className="py-20 text-center bg-gray-50 dark:bg-dark-secondary/20 rounded-2xl"><Spinner /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-dark-tertiary">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                    {members.map(member => (
                                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                <p className="text-gray-900 dark:text-white font-bold text-sm">{member.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{member.email}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                                                    member.role === 'Owner' ? 'border-brand-purple text-brand-purple bg-brand-purple/5' :
                                                    member.role === 'Admin' ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/5' :
                                                    'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                                                }`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs font-bold ${member.status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {member.role !== 'Owner' && (
                                                    <button onClick={() => handleRemove(member.id)} className="text-gray-400 hover:text-red-500 transition-all active:scale-90 p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-auto pt-8 border-t border-gray-100 dark:border-white/5 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Role Permissions</h4>
                            <button
                                onClick={() => setShowRoleModal(true)}
                                className="px-4 py-2 bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-all active:scale-95"
                            >
                                + Create Custom Role
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">
                                        <th className="pb-3">Permission</th>
                                        {['Owner', 'Admin', 'Accountant', 'Viewer', ...customRoles.map(r => r.name)].map(role => (
                                            <th key={role} className="pb-3 text-center">{role}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {permissionsList.map(p => (
                                        <tr key={p.key} className="group">
                                            <td className="py-3 font-bold text-gray-700 dark:text-gray-300 group-hover:text-brand-cyan transition-colors">{p.name}</td>
                                            {['Owner', 'Admin', 'Accountant', 'Viewer'].map(role => (
                                                <td key={role} className="py-3 text-center">
                                                    {p.baseRoles.includes(role) ? (
                                                        <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 text-green-500">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 text-red-500/30">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                            {customRoles.map(role => (
                                                <td key={role.id} className="py-3 text-center">
                                                    {role.permissions.includes(p.key) ? (
                                                        <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 text-green-500">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 text-red-500/30">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Custom Role Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-white">Create Custom Role</h4>
                            <button onClick={() => setShowRoleModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">Role Name</label>
                                <input
                                    type="text"
                                    value={newRoleName}
                                    onChange={e => setNewRoleName(e.target.value)}
                                    className="w-full bg-dark-secondary border border-white/10 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-brand-purple"
                                    placeholder="e.g., Junior Accountant"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-4 block">Select Permissions</label>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {permissionsList.map(p => (
                                        <label key={p.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-brand-purple/50 transition-all cursor-pointer group">
                                            <span className="text-sm font-bold text-gray-300 group-hover:text-white">{p.name}</span>
                                            <input
                                                type="checkbox"
                                                checked={selectedPerms.includes(p.key)}
                                                onChange={e => {
                                                    if (e.target.checked) setSelectedPerms([...selectedPerms, p.key]);
                                                    else setSelectedPerms(selectedPerms.filter(k => k !== p.key));
                                                }}
                                                className="w-5 h-5 rounded border-white/20 bg-transparent text-brand-purple focus:ring-brand-purple"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleCreateRole}
                                className="w-full py-4 bg-brand-purple text-white font-black rounded-xl hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/20 active:scale-[0.98]"
                            >
                                CREATE ROLE
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
