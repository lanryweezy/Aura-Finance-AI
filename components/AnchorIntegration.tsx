import React, { useState, useEffect } from 'react';
import { anchorCustomerService } from '../services/anchor/anchorCustomerService';
import { anchorAccountService } from '../services/anchor/anchorAccountService';
import { anchorTransferService } from '../services/anchor/anchorTransferService';
import { useAppStore } from '../store/useAppStore';

export const AnchorIntegration: React.FC = () => {
  const user = useAppStore(state => state.user);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadCustomer();
    }
  }, [user]);

  const loadCustomer = async () => {
    if (!user?.id) return;
    const data = await anchorCustomerService.getCustomerByUserId(user.id);
    setCustomer(data);
  };

  const handleCreateCustomer = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const mockData = {
        fullName: { firstName: user.name.split(' ')[0] || 'Test', lastName: user.name.split(' ')[1] || 'User' },
        email: user.email,
        phoneNumber: '07000000000',
        address: {
          addressLine_1: '123 Test St',
          city: 'Lagos',
          state: 'Lagos',
          postalCode: '100001',
          country: 'NG'
        }
      };
      await anchorCustomerService.createIndividualCustomer(user.id, mockData);
      setSuccess('Customer created successfully!');
      loadCustomer();
    } catch (e: any) {
      setError(e.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Please log in</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Anchor Integration</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Customer Status</h3>
          {customer ? (
            <div className="text-sm mt-2">
              <p><span className="font-medium">Anchor ID:</span> {customer.anchor_id}</p>
              <p><span className="font-medium">Status:</span> {customer.status}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-2">No Anchor customer linked to this account.</p>
              <button
                onClick={handleCreateCustomer}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Onboard Customer'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
