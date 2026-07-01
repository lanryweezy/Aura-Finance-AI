import { useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { auditLogService } from '../auditLogService';
import { addInventoryItem, updateInventoryItem } from '../inventoryService';
import { addProject } from '../projectService';
import { addJournalEntry } from '../journalEntryService';
import { addPurchaseOrder } from '../purchaseOrderService';
import { addEstimate } from '../estimateService';
import { saveBudgets } from '../budgetService';
import { addContact, updateContact } from '../contactService';
import { fixedAssetService } from '../fixedAssetService';
import type { InventoryItem, PurchaseOrder, Estimate, Bill, Invoice, Budget, Contact, JournalEntry } from '../../types';

async function logAudit(action: string, module: string) {
  await auditLogService.add(action, 'User', module);
  const logs = await auditLogService.getLogs();
  useAppStore.getState().setAuditLog(logs);
}

export function useInventory() {
  const { inventory, setInventory } = useAppStore();

  const handleAdd = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    const newItem = await addInventoryItem(item);
    setInventory(prev => [newItem, ...prev]);
    await logAudit(`Added inventory: ${newItem.name}`, 'Inventory');
    return newItem;
  }, [setInventory]);

  const handleUpdate = useCallback(async (item: InventoryItem) => {
    const updated = await updateInventoryItem(item);
    setInventory(prev => prev.map(i => (i.id === updated.id ? updated : i)));
    await logAudit(`Updated inventory: ${updated.name}`, 'Inventory');
    return updated;
  }, [setInventory]);

  return { inventory, handleAdd, handleUpdate };
}

export function useProjects() {
  const { projects, setProjects } = useAppStore();

  const handleAdd = useCallback(async (name: string) => {
    const p = await addProject(name);
    setProjects(prev => [...prev, p]);
    await logAudit(`Created project: ${p.name}`, 'Projects');
    return p;
  }, [setProjects]);

  return { projects, handleAdd };
}

export function useJournalEntries() {
  const { journalEntries, setJournalEntries } = useAppStore();

  const handleAdd = useCallback(async (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    const newEntry = await addJournalEntry(entry);
    setJournalEntries(prev => [newEntry, ...prev]);
    await logAudit(`Created journal entry #${newEntry.id.slice(-4)}`, 'Accounting');
    return newEntry;
  }, [setJournalEntries]);

  return { journalEntries, handleAdd };
}

export function usePurchases() {
  const { purchaseOrders, setPurchaseOrders, estimates, setEstimates } = useAppStore();

  const handleAddPO = useCallback(async (po: Omit<PurchaseOrder, 'id' | 'status' | 'issueDate'>) => {
    const newPO = await addPurchaseOrder(po);
    setPurchaseOrders(prev => [newPO, ...prev]);
    await logAudit(`Created PO #${newPO.id.slice(-4)} for ${newPO.vendor}`, 'Purchases');
    return newPO;
  }, [setPurchaseOrders]);

  const handleAddEstimate = useCallback(async (est: Omit<Estimate, 'id' | 'status' | 'issueDate'>) => {
    const newEst = await addEstimate(est);
    setEstimates(prev => [newEst, ...prev]);
    await logAudit(`Created estimate #${newEst.id.slice(-4)} for ${newEst.customer}`, 'Sales');
    return newEst;
  }, [setEstimates]);

  const handleConvertToBill = useCallback((po: PurchaseOrder) => {
    setPurchaseOrders(prev => prev.map(p => (p.id === po.id ? { ...p, status: 'Completed' as const } : p)));
    logAudit(`Converted PO #${po.id.slice(-4)} to bill`, 'Purchases');
  }, [setPurchaseOrders]);

  const handleConvertToInvoice = useCallback((est: Estimate) => {
    setEstimates(prev => prev.map(e => (e.id === est.id ? { ...e, status: 'Accepted' as const } : e)));
    logAudit(`Converted estimate #${est.id.slice(-4)} to invoice`, 'Sales');
  }, [setEstimates]);

  return { purchaseOrders, estimates, handleAddPO, handleAddEstimate, handleConvertToBill, handleConvertToInvoice };
}

export function useBudgets() {
  const { budgets, setBudgets } = useAppStore();

  const handleSave = useCallback(async (updated: Budget[]) => {
    await saveBudgets(updated);
    setBudgets(updated);
    await logAudit('Updated budgets', 'Budgeting');
  }, [setBudgets]);

  return { budgets, handleSave };
}

export function useContacts() {
  const { contacts, setContacts } = useAppStore();

  const handleAdd = useCallback(async (data: Omit<Contact, 'id'>) => {
    const c = await addContact(data);
    setContacts(prev => [...prev, c]);
    await logAudit(`Added ${data.type}: ${c.name}`, 'Contacts');
    return c;
  }, [setContacts]);

  const handleUpdate = useCallback(async (contact: Contact) => {
    const updated = await updateContact(contact);
    setContacts(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    await logAudit(`Updated contact: ${updated.name}`, 'Contacts');
    return updated;
  }, [setContacts]);

  return { contacts, handleAdd, handleUpdate };
}

export function useAssets() {
  const { fixedAssets, setFixedAssets } = useAppStore();

  const handleAdd = useCallback(async (asset: any) => {
    const item = await fixedAssetService.addAsset(asset);
    setFixedAssets(prev => [item, ...prev]);
    await logAudit(`Registered asset: ${item.name}`, 'Accounting');
    return item;
  }, [setFixedAssets]);

  const handleDispose = useCallback(async (id: string, price: number) => {
    setFixedAssets(prev => prev.map(a => (a.id === id ? { ...a, status: 'Disposed' as const, disposalDate: new Date().toISOString(), disposalPrice: price, bookValue: 0 } : a)));
    await logAudit(`Disposed asset #${id.slice(-4)}`, 'Accounting');
  }, [setFixedAssets]);

  return { fixedAssets, handleAdd, handleDispose };
}
