
import type { Contact } from '../types';
import { apiClient } from './apiClient';

export const fetchContacts = async (): Promise<Contact[]> => {
    return await apiClient.get('/contacts');
};

export const addContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    return await apiClient.post('/contacts', contact);
};

export const updateContact = async (contact: Contact): Promise<Contact> => {
    return await apiClient.put(`/contacts/${contact.id}`, contact);
};

export const removeContact = async (id: string): Promise<void> => {
    return await apiClient.delete(`/contacts/${id}`);
};
