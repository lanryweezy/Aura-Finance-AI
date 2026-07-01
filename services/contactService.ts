import type { Contact } from '../types';
import { db } from './db';

const TABLE = 'contacts';

export const fetchContacts = async (): Promise<Contact[]> => {
  return db.query<Contact>(TABLE);
};

export const addContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
  return db.insert<Contact>(TABLE, {
    type: contact.type,
    name: contact.name,
    company_name: contact.companyName,
    email: contact.email,
    phone: contact.phone,
    address: contact.address,
    tin: contact.tin,
  });
};

export const updateContact = async (contact: Contact): Promise<Contact> => {
  return db.update<Contact>(TABLE, contact.id, {
    type: contact.type,
    name: contact.name,
    company_name: contact.companyName,
    email: contact.email,
    phone: contact.phone,
    address: contact.address,
    tin: contact.tin,
  });
};

export const removeContact = async (id: string): Promise<void> => {
  await db.remove(TABLE, id);
};
