import type { PurchaseOrder } from '../types';
import { db } from './db';

const TABLE = 'purchase_orders';

export const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  return db.query<PurchaseOrder>(TABLE);
};

export const addPurchaseOrder = async (po: Omit<PurchaseOrder, 'id' | 'status' | 'issueDate'>): Promise<PurchaseOrder> => {
  return db.insert<PurchaseOrder>(TABLE, {
    vendor: po.vendor,
    expected_delivery_date: po.expectedDeliveryDate,
    line_items: JSON.stringify(po.lineItems),
    total: po.total,
    project_id: po.projectId,
    entity_id: po.entityId,
    status: 'Draft',
  });
};

export const updatePurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder> => {
  return db.update<PurchaseOrder>(TABLE, po.id, {
    status: po.status,
    total: po.total,
    vendor: po.vendor,
  });
};
