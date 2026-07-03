import { supabase } from './supabaseClient';
import { db } from './db';
import { notificationService } from './notificationService';

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference: string;
  notes: string;
  warehouseFrom?: string;
  warehouseTo?: string;
  createdBy: string;
  createdAt: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  threshold: number;
  warehouse?: string;
  severity: 'low' | 'out';
  createdAt: string;
}

export interface InventoryValuation {
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  avgCost: number;
  totalValue: number;
  valuationMethod: string;
}

export const stockTrackingService = {
  // Record a stock movement
  recordMovement: async (movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<StockMovement> => {
    if (supabase) {
      const { data, error } = await supabase.from('stock_movements').insert({
        ...movement,
        organization_id: db.getOrgId(),
      }).select().single();
      if (error) throw error;

      // Update item quantity
      const { data: item } = await supabase.from('inventory').select('quantity').eq('id', movement.itemId).single();
      if (item) {
        let newQty = item.quantity;
        if (movement.type === 'in') newQty += movement.quantity;
        else if (movement.type === 'out') newQty -= movement.quantity;
        else if (movement.type === 'adjustment') newQty = movement.quantity;
        await supabase.from('inventory').update({ quantity: Math.max(0, newQty) }).eq('id', movement.itemId);
      }

      return data as StockMovement;
    }
    return { ...movement, id: `sm_${Date.now()}`, createdAt: new Date().toISOString() };
  },

  // Get stock movements for an item
  getItemMovements: async (itemId: string): Promise<StockMovement[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('stock_movements')
      .select('*').eq('item_id', itemId).eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false });
    return (data || []) as StockMovement[];
  },

  // Get all stock movements
  getAllMovements: async (limit = 100): Promise<StockMovement[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('stock_movements')
      .select('*').eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false }).limit(limit);
    return (data || []) as StockMovement[];
  },

  // Check low stock alerts
  checkLowStock: async (): Promise<StockAlert[]> => {
    if (!supabase) return [];
    const { data: items } = await supabase.from('inventory')
      .select('*').eq('organization_id', db.getOrgId());

    if (!items) return [];

    const alerts: StockAlert[] = [];
    for (const item of items) {
      if (item.low_stock_threshold && item.quantity <= item.low_stock_threshold) {
        alerts.push({
          id: `alert_${item.id}`,
          itemId: item.id,
          itemName: item.name,
          currentStock: item.quantity,
          threshold: item.low_stock_threshold,
          severity: item.quantity === 0 ? 'out' : 'low',
          createdAt: new Date().toISOString(),
        });

        // Send notification
        await notificationService.create({
          type: 'system',
          priority: item.quantity === 0 ? 'critical' : 'high',
          title: item.quantity === 0 ? `Out of Stock: ${item.name}` : `Low Stock: ${item.name}`,
          message: `${item.name} has ${item.quantity} units remaining (threshold: ${item.low_stock_threshold})`,
          metadata: { itemId: item.id, quantity: item.quantity },
        });
      }
    }
    return alerts;
  },

  // Transfer stock between warehouses
  transferStock: async (itemId: string, fromWarehouse: string, toWarehouse: string, quantity: number, notes: string): Promise<void> => {
    // Record outgoing movement
    await stockTrackingService.recordMovement({
      itemId, itemName: '', type: 'out', quantity, unitCost: 0, totalCost: 0,
      reference: `Transfer to ${toWarehouse}`, notes,
      warehouseFrom: fromWarehouse, warehouseTo: toWarehouse,
      createdBy: 'system',
    });

    // Record incoming movement
    await stockTrackingService.recordMovement({
      itemId, itemName: '', type: 'in', quantity, unitCost: 0, totalCost: 0,
      reference: `Transfer from ${fromWarehouse}`, notes,
      warehouseFrom: fromWarehouse, warehouseTo: toWarehouse,
      createdBy: 'system',
    });
  },

  // Get inventory valuation
  getValuation: async (): Promise<InventoryValuation[]> => {
    if (!supabase) return [];
    const { data: items } = await supabase.from('inventory')
      .select('*').eq('organization_id', db.getOrgId());

    if (!items) return [];

    return items.map(item => ({
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      quantity: item.quantity,
      avgCost: item.cost_price,
      totalValue: item.quantity * item.cost_price,
      valuationMethod: item.valuation_method || 'Average',
    }));
  },

  // Get total inventory value
  getTotalValue: async (): Promise<number> => {
    const valuation = await stockTrackingService.getValuation();
    return valuation.reduce((s, v) => s + v.totalValue, 0);
  },

  // Receive stock from purchase order
  receiveFromPO: async (poId: string, items: { itemId: string; quantity: number; unitCost: number }[]): Promise<void> => {
    for (const item of items) {
      await stockTrackingService.recordMovement({
        itemId: item.itemId,
        itemName: '',
        type: 'in',
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost,
        reference: `PO #${poId}`,
        notes: 'Received from purchase order',
        createdBy: 'system',
      });
    }
  },
};
