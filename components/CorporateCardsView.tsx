import React, { useState, useEffect } from 'react';
import { cardService } from '../services/cardService';
import type { CorporateCard } from '../types';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  frozen: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const CorporateCardsView: React.FC = () => {
  const [cards, setCards] = useState<CorporateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCard, setNewCard] = useState<{ name: string; type: 'virtual' | 'physical'; spendLimit: number }>({ name: '', type: 'virtual', spendLimit: 500000 });

  useEffect(() => {
    cardService.fetchCards().then(setCards).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newCard.name) return;
    const card = await cardService.createCard(newCard);
    setCards(prev => [card, ...prev]);
    setShowCreate(false);
    setNewCard({ name: '', type: 'virtual', spendLimit: 500000 });
  };

  const handleFreeze = async (id: string) => {
    await cardService.freezeCard(id);
    setCards(prev => prev.map(c => c.id === id ? { ...c, status: 'frozen' as const } : c));
  };

  const handleUnfreeze = async (id: string) => {
    await cardService.unfreezeCard(id);
    setCards(prev => prev.map(c => c.id === id ? { ...c, status: 'active' as const } : c));
  };

  const totalLimit = cards.reduce((s, c) => s + c.spendLimit, 0);
  const totalSpent = cards.reduce((s, c) => s + c.spentAmount, 0);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading cards...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Corporate Cards</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage virtual and physical cards for your team</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-brand-cyan text-black font-bold rounded-xl hover:bg-brand-cyan/80 transition-all"
        >
          + New Card
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Cards</p>
          <p className="text-2xl font-black mt-1">{cards.length}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-2xl font-black mt-1 text-green-400">{cards.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Limit</p>
          <p className="text-2xl font-black mt-1">₦{totalLimit.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Spent</p>
          <p className="text-2xl font-black mt-1">₦{totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
            <div className="flex items-center justify-between mb-6">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[card.status]}`}>
                {card.status}
              </span>
              <span className="text-xs text-gray-400">{card.type}</span>
            </div>
            <p className="text-lg font-bold mb-1">{card.name}</p>
            <p className="text-2xl font-mono tracking-wider mb-4">•••• •••• •••• {card.last4}</p>
            <div className="flex justify-between text-xs text-gray-400 mb-4">
              <span>Limit: ₦{card.spendLimit.toLocaleString()}</span>
              <span>Spent: ₦{card.spentAmount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
              <div
                className="bg-brand-cyan h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, (card.spentAmount / card.spendLimit) * 100)}%` }}
              />
            </div>
            {card.assignedToName && (
              <p className="text-xs text-gray-400 mb-3">Assigned to: {card.assignedToName}</p>
            )}
            <div className="flex gap-2">
              {card.status === 'active' ? (
                <button onClick={() => handleFreeze(card.id)} className="flex-1 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold hover:bg-yellow-500/30">
                  Freeze
                </button>
              ) : card.status === 'frozen' ? (
                <button onClick={() => handleUnfreeze(card.id)} className="flex-1 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30">
                  Unfreeze
                </button>
              ) : null}
              <button className="flex-1 py-1.5 bg-white/10 text-gray-300 rounded-lg text-xs font-bold hover:bg-white/20">
                Details
              </button>
            </div>
          </div>
        ))}

        {cards.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No cards yet</p>
            <p className="text-sm">Create your first corporate card to start managing team spending</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold">Create New Card</h3>
            <input
              type="text"
              placeholder="Card name (e.g., Marketing Team)"
              value={newCard.name}
              onChange={e => setNewCard(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setNewCard(p => ({ ...p, type: 'virtual' }))}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border ${newCard.type === 'virtual' ? 'bg-brand-cyan text-black border-brand-cyan' : 'border-white/10 text-gray-400'}`}
              >
                Virtual
              </button>
              <button
                onClick={() => setNewCard(p => ({ ...p, type: 'physical' }))}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border ${newCard.type === 'physical' ? 'bg-brand-cyan text-black border-brand-cyan' : 'border-white/10 text-gray-400'}`}
              >
                Physical
              </button>
            </div>
            <input
              type="number"
              placeholder="Spend limit (₦)"
              value={newCard.spendLimit}
              onChange={e => setNewCard(p => ({ ...p, spendLimit: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-dark-primary border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan"
            />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-xl font-bold hover:bg-white/10">
                Cancel
              </button>
              <button onClick={handleCreate} className="flex-1 py-2.5 bg-brand-cyan text-black rounded-xl font-bold hover:bg-brand-cyan/80">
                Create Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
