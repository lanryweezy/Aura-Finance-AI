import React, { useState } from 'react';

interface PaystackPaymentProps {
  plan: {
    name: string;
    price: string;
    period: string;
    features: string[];
  };
  onSuccess: (data: any) => void;
  onClose: () => void;
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({ plan, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    businessName: '',
    businessType: ''
  });

  // Convert price string to kobo (Paystack uses kobo)
  const getPriceInKobo = (priceString: string) => {
    const numericPrice = parseInt(priceString.replace(/[₦,]/g, ''));
    return numericPrice * 100; // Convert to kobo
  };

  const initializePaystack = () => {
    setLoading(true);
    
    // Paystack configuration
    const handler = window.PaystackPop.setup({
      key: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your public key
      email: customerData.email,
      amount: getPriceInKobo(plan.price),
      currency: 'NGN',
      ref: `aura_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        businessName: customerData.businessName,
        businessType: customerData.businessType,
        plan: plan.name,
        custom_fields: [
          {
            display_name: "Business Name",
            variable_name: "business_name",
            value: customerData.businessName
          },
          {
            display_name: "Plan",
            variable_name: "plan",
            value: plan.name
          }
        ]
      },
      callback: function(response: any) {
        setLoading(false);
        onSuccess({
          reference: response.reference,
          trans: response.trans,
          status: response.status,
          message: response.message,
          transaction: response.transaction,
          trxref: response.trxref,
          redirecturl: response.redirecturl,
          customer: customerData,
          plan: plan
        });
      },
      onClose: function() {
        setLoading(false);
        onClose();
      }
    });

    handler.openIframe();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.email || !customerData.firstName || !customerData.lastName) {
      alert('Please fill in all required fields');
      return;
    }
    initializePaystack();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCustomerData({
      ...customerData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Subscribe to {plan.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-900">{plan.name}</span>
            <span className="text-2xl font-bold text-green-600">{plan.price}{plan.period}</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            {plan.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {feature}
              </li>
            ))}
            {plan.features.length > 3 && (
              <li className="text-gray-500">+ {plan.features.length - 3} more features</li>
            )}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={customerData.firstName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={customerData.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              value={customerData.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="john@business.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={customerData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+234 801 234 5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={customerData.businessName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Your Business Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <select
              name="businessType"
              value={customerData.businessType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select business type</option>
              <option value="retail">Retail/Trade</option>
              <option value="services">Professional Services</option>
              <option value="technology">Technology</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="consulting">Consulting</option>
              <option value="ecommerce">E-commerce</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <img 
                src="https://paystack.com/assets/img/logo/paystack-icon-blue.png" 
                alt="Paystack" 
                className="w-6 h-6 mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Secured by Paystack</span>
            </div>
            <p className="text-xs text-gray-600">
              Your payment is processed securely by Paystack. We accept cards, bank transfers, and USSD.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay ${plan.price} with Paystack`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            You can cancel anytime. 30-day money-back guarantee.
          </p>
        </form>
      </div>
    </div>
  );
};

export default PaystackPayment;