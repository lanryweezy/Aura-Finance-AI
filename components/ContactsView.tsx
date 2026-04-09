
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">{contact ? 'Edit Contact' : 'Add New Contact'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4 p-1 bg-dark-secondary rounded-lg">
                        <button type="button" onClick={() => setFormData({...formData, type: 'Customer'})} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${formData.type === 'Customer' ? 'bg-brand-cyan text-black' : 'text-gray-400 hover:text-white'}`}>Customer</button>
                        <button type="button" onClick={() => setFormData({...formData, type: 'Vendor'})} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${formData.type === 'Vendor' ? 'bg-brand-pink text-white' : 'text-gray-400 hover:text-white'}`}>Vendor</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Contact Person" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700 text-white"/>
                        <input type="text" placeholder="Company Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700 text-white"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700 text-white"/>
                        <input type="tel" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700 text-white"/>
                    </div>
                    <input type="text" placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700 text-white"/>
                    <input type="text" placeholder="Tax ID / TIN" value={formData.tin} onChange={e => setFormData({...formData, tin: e.target.value})} className="w-full bg-dark-secondary p-3 rounded-lg border border-gray-700 text-white"/>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold">Save Contact</button>
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

    const getBalance = (contact: Contact) => {
        if (contact.type === 'Customer') {
            // Sum of unpaid invoices where customer name matches (approximate matching for demo)
            return invoices
                .filter(i => (i.status === 'Unpaid' || i.status === 'Overdue') && (i.customer === contact.name || i.customer === contact.companyName))
                .reduce((sum, i) => sum + i.total, 0);
        } else {
            // Sum of unpaid bills
            return bills
                .filter(b => (b.status === 'Unpaid' || b.status === 'Overdue') && (b.vendor === contact.name || b.vendor === contact.companyName))
                .reduce((sum, b) => sum + b.amount, 0);
        }
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
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Contacts CRM</h2>
                        <p className="text-gray-400 mt-1">Manage your customers and vendors.</p>
                    </div>
                    <button onClick={handleNew} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                        Add Contact
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-dark-tertiary p-1 rounded-lg">
                        <button onClick={() => setActiveTab('Customer')} className={`px-6 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'Customer' ? 'bg-dark-secondary text-white shadow' : 'text-gray-400 hover:text-white'}`}>Customers</button>
                        <button onClick={() => setActiveTab('Vendor')} className={`px-6 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'Vendor' ? 'bg-dark-secondary text-white shadow' : 'text-gray-400 hover:text-white'}`}>Vendors</button>
                    </div>
                    <div className="relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder="Search contacts..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-secondary border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredContacts.map(contact => {
                        const balance = getBalance(contact);
                        return (
                            <Card key={contact.id} className="relative group hover:border-brand-cyan/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${activeTab === 'Customer' ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-brand-pink/20 text-brand-pink'}`}>
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{contact.name}</h3>
                                            <p className="text-gray-400 text-sm">{contact.companyName}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleEdit(contact)} className="text-gray-500 hover:text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                    </button>
                                </div>
                                
                                <div className="space-y-2 mb-6">
                                    {contact.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                            {contact.email}
                                        </div>
                                    )}
                                    {contact.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                            {contact.phone}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-700/50 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                        {activeTab === 'Customer' ? 'Outstanding' : 'Payable'}
                                    </span>
                                    <span className={`font-mono font-bold ${balance > 0 ? (activeTab === 'Customer' ? 'text-yellow-400' : 'text-red-400') : 'text-gray-500'}`}>
                                        {formatAmount(balance)}
                                    </span>
                                </div>
                            </Card>
                        );
                    })}
                    {filteredContacts.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-dark-tertiary/30 rounded-2xl border border-dashed border-gray-700">
                            <p className="text-gray-400">No {activeTab.toLowerCase()}s found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
