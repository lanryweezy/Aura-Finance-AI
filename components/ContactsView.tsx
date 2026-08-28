
import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import type { Contact, Invoice, Bill } from '../types';
import { useCurrency } from './ui/CurrencyProvider';

interface ContactsViewProps {
    contacts: Contact[];
    invoices: Invoice[];
    bills: Bill[];
    onAddContact: (contact: Omit<Contact, 'id'>) => void;
    onUpdateContact: (contact: Contact) => void;
}

const AddEditContactModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    contact: Contact | null;
}> = ({ isOpen, onClose, onSave, contact }) => {
    const [formData, setFormData] = useState<Partial<Contact>>({
        type: 'Customer',
        name: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        tin: ''
    });

    React.useEffect(() => {
        if (contact) {
            setFormData(contact);
        } else {
            setFormData({ type: 'Customer', name: '', companyName: '', email: '', phone: '', address: '', tin: '' });
        }
    }, [contact, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(contact ? { ...formData, id: contact.id } : formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-aura-gray-900 dark:text-white mb-6">{contact ? 'Edit Contact' : 'Add New Contact'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4 p-1.5 bg-aura-gray-100 dark:bg-dark-secondary rounded-xl">
                        <button type="button" onClick={() => setFormData({...formData, type: 'Customer'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'Customer' ? 'bg-white dark:bg-brand-cyan text-aura-gray-900 dark:text-black shadow-sm' : 'text-aura-gray-500 dark:text-gray-400 hover:text-aura-gray-900 dark:hover:text-white'}`}>Customer</button>
                        <button type="button" onClick={() => setFormData({...formData, type: 'Vendor'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'Vendor' ? 'bg-white dark:bg-brand-pink text-aura-gray-900 dark:text-white shadow-sm' : 'text-aura-gray-500 dark:text-gray-400 hover:text-aura-gray-900 dark:hover:text-white'}`}>Vendor</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Contact Person" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-aura-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-aura-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all"/>
                        <input type="text" placeholder="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-aura-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-aura-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all"/>
                        <input type="tel" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all"/>
                    </div>
                    <input type="text" placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all"/>
                    <input type="text" placeholder="Tax ID / TIN" value={formData.tin} onChange={e => setFormData({...formData, tin: e.target.value})} className="w-full bg-gray-50 dark:bg-dark-secondary p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-cyan outline-none transition-all font-mono font-bold"/>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-secondary transition-all font-bold">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">Save Contact</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ContactsView: React.FC<ContactsViewProps> = ({ contacts, invoices, bills, onAddContact, onUpdateContact }) => {
    const { formatAmount } = useCurrency();
    const [activeTab, setActiveTab] = useState<'Customer' | 'Vendor'>('Customer');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredContacts = useMemo(() => {
        return contacts.filter(c => 
            c.type === activeTab && 
            (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [contacts, activeTab, searchTerm]);

    // ⚡ Bolt Optimization: Replace O(N*M) nested iterations with O(M) single-pass lookup table computation.
    // This avoids chaining .filter().reduce() inside the contacts .map() which creates excessive array allocations.
    const { customerBalances, vendorBalances } = useMemo(() => {
        const cBalances = new Map<string, number>();
        const vBalances = new Map<string, number>();

        for (const i of invoices) {
            if ((i.status === 'Unpaid' || i.status === 'Overdue') && i.customer) {
                cBalances.set(i.customer, (cBalances.get(i.customer) || 0) + i.total);
            }
        }

        for (const b of bills) {
            if ((b.status === 'Unpaid' || b.status === 'Overdue') && b.vendor) {
                vBalances.set(b.vendor, (vBalances.get(b.vendor) || 0) + b.amount);
            }
        }

        return { customerBalances: cBalances, vendorBalances: vBalances };
    }, [invoices, bills]);

    const getBalance = (contact: Contact) => {
        const balances = contact.type === 'Customer' ? customerBalances : vendorBalances;
        const nameBalance = balances.get(contact.name) || 0;

        if (contact.companyName && contact.companyName !== contact.name) {
            return nameBalance + (balances.get(contact.companyName) || 0);
        }
        return nameBalance;
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingContact(null);
        setIsModalOpen(true);
    };

    return (
        <>
            <AddEditContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={editingContact ? onUpdateContact : onAddContact} contact={editingContact} />
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Contacts CRM</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">Manage your relationships with customers and vendors.</p>
                    </div>
                    <button onClick={handleNew} className="bg-brand-cyan hover:bg-brand-cyan/90 text-black font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                        Add Contact
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-aura-gray-100 dark:bg-dark-tertiary p-1.5 rounded-xl shadow-inner w-full md:w-auto">
                        <button onClick={() => setActiveTab('Customer')} className={`flex-1 md:flex-none px-8 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Customer' ? 'bg-white dark:bg-dark-secondary text-aura-gray-900 dark:text-white shadow-sm' : 'text-aura-gray-500 dark:text-gray-400 hover:text-aura-gray-900 dark:hover:text-white'}`}>Customers</button>
                        <button onClick={() => setActiveTab('Vendor')} className={`flex-1 md:flex-none px-8 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Vendor' ? 'bg-white dark:bg-brand-pink text-aura-gray-900 dark:text-white shadow-sm' : 'text-aura-gray-500 dark:text-gray-400 hover:text-aura-gray-900 dark:hover:text-white'}`}>Vendors</button>
                    </div>
                    <div className="relative w-full md:w-80">
                        <input 
                            type="text" 
                            placeholder="Search by name or company..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all shadow-sm"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredContacts.map(contact => {
                        const balance = getBalance(contact);
                        return (
                            <Card key={contact.id} className="relative group border-gray-100 dark:border-white/5 hover:border-brand-cyan/30 transition-all shadow-xl hover:shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button aria-label="Edit contact" onClick={() => handleEdit(contact)} className="p-2 bg-gray-50 dark:bg-dark-secondary rounded-lg text-gray-400 hover:text-brand-cyan transition-colors shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${activeTab === 'Customer' ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20' : 'bg-brand-pink/10 text-brand-pink border border-brand-pink/20'}`}>
                                        {contact.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-black text-gray-900 dark:text-white text-lg truncate">{contact.name}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium truncate">{contact.companyName || 'Individual'}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    {contact.email && (
                                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            <div className="p-1.5 bg-gray-100 dark:bg-white/5 rounded-md text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                            </div>
                                            <span className="truncate">{contact.email}</span>
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            <div className="p-1.5 bg-gray-100 dark:bg-white/5 rounded-md text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                            </div>
                                            <span>{contact.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-5 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-dark-secondary/10 -mx-6 px-6 -mb-6 pb-6 mt-auto">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                        {activeTab === 'Customer' ? 'Outstanding' : 'Payable'}
                                    </span>
                                    <span className={`font-mono font-bold text-lg ${balance > 0 ? (activeTab === 'Customer' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400') : 'text-gray-400 dark:text-gray-600'}`}>
                                        {formatAmount(balance)}
                                    </span>
                                </div>
                            </Card>
                        );
                    })}
                    {filteredContacts.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-20 text-center bg-aura-gray-50/50 dark:bg-dark-tertiary/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                             <div className="p-5 bg-white dark:bg-dark-secondary rounded-2xl mb-6 shadow-xl shadow-aura-gray-200/50 dark:shadow-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                             </div>
                            <p className="text-gray-500 dark:text-gray-400 font-bold">No {activeTab.toLowerCase()}s found matching your search.</p>
                            <button onClick={() => setSearchTerm('')} className="mt-4 text-brand-cyan font-black text-sm hover:underline">Clear search filters</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
