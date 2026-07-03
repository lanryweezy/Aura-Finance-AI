import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import type { InventoryItem } from '../types';
import { useCurrency } from './ui/CurrencyProvider';
import { stockTrackingService, type StockMovement, type StockAlert, type InventoryValuation } from '../services/stockTrackingService';

interface InventoryViewProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateItem: (item: InventoryItem) => void;
}

type Tab = 'inventory' | 'movements' | 'alerts' | 'valuation' | 'transfers';

export const InventoryView: React.FC<InventoryViewProps> = ({ items, onAddItem, onUpdateItem }) => {
  const { formatAmount } = useCurrency();
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [valuation, setValuation] = useState<InventoryValuation[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ itemId: '', from: '', to: '', quantity: 1 });

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = items.reduce((s, i) => s + (i.quantity * i.costPrice), 0);
  const totalRetail = items.reduce((s, i) => s + (i.quantity * i.salePrice), 0);
  const lowStock = items.filter(i => i.lowStockThreshold && i.quantity <= i.lowStockThreshold);

  useEffect(() => {
    stockTrackingService.getAllMovements(50).then(setMovements);
    stockTrackingService.checkLowStock().then(setAlerts);
    stockTrackingService.getValuation().then(setValuation);
  }, []);

  const handleStockIn = async (itemId: string, quantity: number, cost: number) => {
    await stockTrackingService.recordMovement({
      itemId, itemName: items.find(i => i.id === itemId)?.name || '', type: 'in',
      quantity, unitCost: cost, totalCost: quantity * cost,
      reference: 'Manual stock in', notes: 'Manual adjustment', createdBy: 'user',
    });
    // Refresh
    stockTrackingService.getAllMovements(50).then(setMovements);
    stockTrackingService.checkLowStock().then(setAlerts);
  };

  const handleTransfer = async () => {
    if (!transferForm.itemId || !transferForm.from || !transferForm.to || transferForm.quantity <= 0) return;
    await stockTrackingService.transferStock(transferForm.itemId, transferForm.from, transferForm.to, transferForm.quantity, 'Stock transfer');
    setShowTransferModal(false);
    setTransferForm({ itemId: '', from: '', to: '', quantity: 1 });
    stockTrackingService.getAllMovements(50).then(setMovements);
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'inventory', label: 'Inventory', count: items.length },
    { id: 'movements', label: 'Stock Movements', count: movements.length },
    { id: 'alerts', label: 'Low Stock Alerts', count: alerts.length },
    { id: 'valuation', label: 'Valuation' },
    { id: 'transfers', label: 'Transfer Stock' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Inventory Management</h2>
          <p className="text-gray-500 mt-1">Track stock levels, movements, and valuations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTransferModal(true)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold">📦 Transfer</button>
          <button onClick={() => { setEditingItem(null); setShowAddModal(true); }} className="px-4 py-2 bg-brand-cyan text-black font-bold rounded-xl">+ Add Item</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Items</p>
          <p className="text-2xl font-black mt-1">{items.length}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Stock Value</p>
          <p className="text-2xl font-black mt-1 text-green-400">₦{totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Retail Value</p>
          <p className="text-2xl font-black mt-1 text-blue-400">₦{totalRetail.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Low Stock</p>
          <p className={`text-2xl font-black mt-1 ${lowStock.length > 0 ? 'text-red-400' : 'text-green-400'}`}>{lowStock.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-brand-cyan text-black' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-60">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-white/10">
            <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-dark-primary border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-brand-cyan" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead><tr className="border-b border-gray-100 dark:border-white/10">
                <th className="text-left p-4 text-xs font-bold text-gray-500">Item</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500">SKU</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500">Category</th>
                <th className="text-right p-4 text-xs font-bold text-gray-500">Cost</th>
                <th className="text-right p-4 text-xs font-bold text-gray-500">Sale Price</th>
                <th className="text-right p-4 text-xs font-bold text-gray-500">Stock</th>
                <th className="text-right p-4 text-xs font-bold text-gray-500">Value</th>
                <th className="text-center p-4 text-xs font-bold text-gray-500">Status</th>
              </tr></thead>
              <tbody>
                {filtered.map(item => {
                  const isLow = item.lowStockThreshold && item.quantity <= item.lowStockThreshold;
                  const isOut = item.quantity === 0;
                  return (
                    <tr key={item.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-white/5 cursor-pointer"
                      onClick={() => { setEditingItem(item); setShowAddModal(true); }}>
                      <td className="p-4 text-sm font-medium">{item.name}</td>
                      <td className="p-4 text-xs text-gray-500 font-mono">{item.sku}</td>
                      <td className="p-4 text-xs text-gray-500">{item.category}</td>
                      <td className="p-4 text-sm text-right">{formatAmount(item.costPrice)}</td>
                      <td className="p-4 text-sm text-right">{formatAmount(item.salePrice)}</td>
                      <td className="p-4 text-sm text-right font-bold">{item.quantity}</td>
                      <td className="p-4 text-sm text-right">{formatAmount(item.quantity * item.costPrice)}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          isOut ? 'bg-red-500/20 text-red-400' : isLow ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-gray-500">No items found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Movements Tab */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-gray-100 dark:border-white/10">
              <th className="text-left p-4 text-xs font-bold text-gray-500">Date</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500">Item</th>
              <th className="text-center p-4 text-xs font-bold text-gray-500">Type</th>
              <th className="text-right p-4 text-xs font-bold text-gray-500">Qty</th>
              <th className="text-right p-4 text-xs font-bold text-gray-500">Total</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500">Reference</th>
            </tr></thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id} className="border-b border-gray-50 dark:border-white/5">
                  <td className="p-4 text-sm">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-medium">{m.itemName || m.itemId}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      m.type === 'in' ? 'bg-green-500/20 text-green-400' :
                      m.type === 'out' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>{m.type}</span>
                  </td>
                  <td className="p-4 text-sm text-right">{m.quantity}</td>
                  <td className="p-4 text-sm text-right">{formatAmount(m.totalCost)}</td>
                  <td className="p-4 text-xs text-gray-500">{m.reference}</td>
                </tr>
              ))}
              {movements.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-500">No movements recorded</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Low Stock Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {alerts.length === 0 && <div className="text-center py-10 text-gray-500">No low stock alerts</div>}
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-xl border ${
              alert.severity === 'out' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{alert.itemName}</p>
                  <p className="text-xs text-gray-500">Current: {alert.currentStock} | Threshold: {alert.threshold}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                  alert.severity === 'out' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>{alert.severity === 'out' ? 'Out of Stock' : 'Low Stock'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Valuation Tab */}
      {activeTab === 'valuation' && (
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-gray-100 dark:border-white/10">
              <th className="text-left p-4 text-xs font-bold text-gray-500">Item</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500">SKU</th>
              <th className="text-right p-4 text-xs font-bold text-gray-500">Qty</th>
              <th className="text-right p-4 text-xs font-bold text-gray-500">Avg Cost</th>
              <th className="text-right p-4 text-xs font-bold text-gray-500">Total Value</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500">Method</th>
            </tr></thead>
            <tbody>
              {valuation.map(v => (
                <tr key={v.itemId} className="border-b border-gray-50 dark:border-white/5">
                  <td className="p-4 text-sm font-medium">{v.itemName}</td>
                  <td className="p-4 text-xs text-gray-500 font-mono">{v.sku}</td>
                  <td className="p-4 text-sm text-right">{v.quantity}</td>
                  <td className="p-4 text-sm text-right">{formatAmount(v.avgCost)}</td>
                  <td className="p-4 text-sm text-right font-bold">{formatAmount(v.totalValue)}</td>
                  <td className="p-4 text-xs text-gray-500">{v.valuationMethod}</td>
                </tr>
              ))}
              <tr className="bg-dark-primary font-bold">
                <td className="p-4 text-sm" colSpan={3}>Total Inventory Value</td>
                <td className="p-4 text-sm text-right"></td>
                <td className="p-4 text-sm text-right text-brand-cyan">{formatAmount(valuation.reduce((s, v) => s + v.totalValue, 0))}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Transfer Tab */}
      {activeTab === 'transfers' && (
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl p-6 max-w-lg">
          <h3 className="font-bold mb-4">Transfer Stock</h3>
          <div className="space-y-4">
            <select value={transferForm.itemId} onChange={e => setTransferForm(p => ({ ...p, itemId: e.target.value }))}
              className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm">
              <option value="">Select item</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.quantity} in stock)</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">From Warehouse</label>
                <select value={transferForm.from} onChange={e => setTransferForm(p => ({ ...p, from: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm">
                  <option value="">Select</option>
                  <option value="main">Main Warehouse</option>
                  <option value="lagos">Lagos Office</option>
                  <option value="abuja">Abuja Office</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">To Warehouse</label>
                <select value={transferForm.to} onChange={e => setTransferForm(p => ({ ...p, to: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm">
                  <option value="">Select</option>
                  <option value="main">Main Warehouse</option>
                  <option value="lagos">Lagos Office</option>
                  <option value="abuja">Abuja Office</option>
                </select>
              </div>
            </div>
            <input type="number" placeholder="Quantity" value={transferForm.quantity || ''}
              onChange={e => setTransferForm(p => ({ ...p, quantity: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm" />
            <button onClick={handleTransfer}
              disabled={!transferForm.itemId || !transferForm.from || !transferForm.to || transferForm.quantity <= 0}
              className="w-full py-2.5 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 disabled:opacity-50">
              Transfer Stock
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = {
                name: (form.elements.namedItem('name') as HTMLInputElement).value,
                sku: (form.elements.namedItem('sku') as HTMLInputElement).value,
                category: (form.elements.namedItem('category') as HTMLInputElement).value,
                type: (form.elements.namedItem('type') as HTMLSelectElement).value as 'Product' | 'Service',
                costPrice: Number((form.elements.namedItem('costPrice') as HTMLInputElement).value),
                salePrice: Number((form.elements.namedItem('salePrice') as HTMLInputElement).value),
                quantity: Number((form.elements.namedItem('quantity') as HTMLInputElement).value),
                valuationMethod: (form.elements.namedItem('valuationMethod') as HTMLSelectElement).value as 'FIFO' | 'LIFO' | 'Average',
                lowStockThreshold: Number((form.elements.namedItem('lowStockThreshold') as HTMLInputElement).value) || 10,
              };
              if (editingItem) { onUpdateItem({ ...data, id: editingItem.id } as InventoryItem); }
              else { onAddItem(data); }
              setShowAddModal(false);
            }} className="space-y-3">
              <input name="name" placeholder="Item name" defaultValue={editingItem?.name} required className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="sku" placeholder="SKU" defaultValue={editingItem?.sku} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm" />
                <input name="category" placeholder="Category" defaultValue={editingItem?.category} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select name="type" defaultValue={editingItem?.type || 'Product'} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm">
                  <option value="Product">Product</option><option value="Service">Service</option>
                </select>
                <select name="valuationMethod" defaultValue={editingItem?.valuationMethod || 'Average'} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm">
                  <option value="Average">Average Cost</option><option value="FIFO">FIFO</option><option value="LIFO">LIFO</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input name="costPrice" type="number" placeholder="Cost Price (₦)" defaultValue={editingItem?.costPrice} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm" />
                <input name="salePrice" type="number" placeholder="Sale Price (₦)" defaultValue={editingItem?.salePrice} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm" />
                <input name="quantity" type="number" placeholder="Quantity" defaultValue={editingItem?.quantity} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm" />
              </div>
              <input name="lowStockThreshold" type="number" placeholder="Low stock alert (default: 10)" defaultValue={editingItem?.lowStockThreshold || 10} className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-brand-cyan text-black rounded-xl font-bold">{editingItem ? 'Update' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
