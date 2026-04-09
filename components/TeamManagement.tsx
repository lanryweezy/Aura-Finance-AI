
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { useToast } from './ui/Toast';
import { teamService, TeamMember, UserRole } from '../services/teamService';

export const TeamManagement: React.FC = () => {
    const { showToast } = useToast();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);

    // Invite Form State
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<UserRole>('Viewer');

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setIsLoading(true);
        try {
            const data = await teamService.fetchMembers();
            setMembers(data);
        } catch (e) {
            showToast('Failed to load team members', 'error');
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

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold text-white">Team Management</h3>
                    <p className="text-gray-400">Invite and manage roles for your organization.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invite Form */}
                <Card className="lg:col-span-1 h-fit">
                    <h4 className="text-lg font-bold text-white mb-4">Invite Member</h4>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Full Name</label>
                            <input
                                type="text"
                                value={inviteName}
                                onChange={e => setInviteName(e.target.value)}
                                required
                                className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white mt-1 text-sm focus:ring-1 focus:ring-brand-cyan"
                                placeholder="Tunde Oke"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Email Address</label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                required
                                className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white mt-1 text-sm focus:ring-1 focus:ring-brand-cyan"
                                placeholder="colleague@company.com"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Role</label>
                            <select
                                value={inviteRole}
                                onChange={e => setInviteRole(e.target.value as UserRole)}
                                className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white mt-1 text-sm focus:ring-1 focus:ring-brand-cyan"
                            >
                                <option value="Viewer">Viewer (Read-only)</option>
                                <option value="Accountant">Accountant</option>
                                <option value="Admin">Administrator</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={isInviting}
                            className="w-full py-3 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all shadow-[0_0_15px_rgba(0,245,212,0.2)] disabled:opacity-50"
                        >
                            {isInviting ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </form>
                </Card>

                {/* Team List */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <h4 className="text-lg font-bold text-white mb-4">Current Members</h4>
                    {isLoading ? (
                        <div className="py-12 text-center"><Spinner /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-800">
                                    <tr>
                                        <th className="py-3 text-xs text-gray-500 uppercase">Member</th>
                                        <th className="py-3 text-xs text-gray-500 uppercase">Role</th>
                                        <th className="py-3 text-xs text-gray-500 uppercase">Status</th>
                                        <th className="py-3 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {members.map(member => (
                                        <tr key={member.id}>
                                            <td className="py-4">
                                                <p className="text-white font-medium text-sm">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                    member.role === 'Owner' ? 'border-brand-purple text-brand-purple bg-brand-purple/5' :
                                                    member.role === 'Admin' ? 'border-brand-cyan text-brand-cyan bg-brand-cyan/5' :
                                                    'border-gray-600 text-gray-400'
                                                }`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`text-xs ${member.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                {member.role !== 'Owner' && (
                                                    <button onClick={() => handleRemove(member.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
