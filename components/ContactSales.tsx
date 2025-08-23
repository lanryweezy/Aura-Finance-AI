import React, { useState } from 'react';

interface ContactSalesProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ContactSales: React.FC<ContactSalesProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    companySize: '',
    currentSolution: '',
    requirements: '',
    timeline: '',
    budget: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real implementation, you would send this to your backend
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit({
        ...formData,
        submittedAt: new Date().toISOString(),
        source: 'enterprise_contact_form'
      });
      
      alert('Thank you! Our sales team will contact you within 24 hours.');
      onClose();
    } catch (error) {
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const companySize = [
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1,000 employees' },
    { value: '1000+', label: '1,000+ employees' }
  ];

  const timelines = [
    { value: 'immediate', label: 'Immediate (within 1 month)' },
    { value: '1-3months', label: '1-3 months' },
    { value: '3-6months', label: '3-6 months' },
    { value: '6months+', label: '6+ months' }
  ];

  const budgets = [
    { value: '50k-100k', label: '₦50,000 - ₦100,000/month' },
    { value: '100k-500k', label: '₦100,000 - ₦500,000/month' },
    { value: '500k-1m', label: '₦500,000 - ₦1,000,000/month' },
    { value: '1m+', label: '₦1,000,000+/month' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Get Custom Enterprise Pricing</h2>
            <p className="text-gray-600 mt-2">Our sales team will create a tailored solution for your business</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-2">Enterprise Features Include:</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Unlimited users and transactions
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Dedicated account manager
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Custom integrations & API
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Advanced compliance tools
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Multi-location support
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              SLA guarantee & priority support
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
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
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="+234 801 234 5678"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                name="businessName"
                required
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your Company Ltd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Type *
              </label>
              <select
                name="businessType"
                required
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select business type</option>
                <option value="financial-services">Financial Services</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail/E-commerce</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="government">Government</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Size *
              </label>
              <select
                name="companySize"
                required
                value={formData.companySize}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select company size</option>
                {companySize.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Implementation Timeline
              </label>
              <select
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select timeline</option>
                {timelines.map(timeline => (
                  <option key={timeline.value} value={timeline.value}>{timeline.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Solution
              </label>
              <input
                type="text"
                name="currentSolution"
                value={formData.currentSolution}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="QuickBooks, SAP, Excel, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Budget Range
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select budget range</option>
                {budgets.map(budget => (
                  <option key={budget.value} value={budget.value}>{budget.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specific Requirements
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tell us about your specific needs: integrations, compliance requirements, user count, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Any additional information you'd like to share..."
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Our enterprise sales specialist will contact you within 24 hours</li>
              <li>• We'll schedule a personalized demo based on your requirements</li>
              <li>• Receive a custom proposal with pricing and implementation plan</li>
              <li>• Optional: Connect with existing customers in your industry</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Get Custom Pricing'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By submitting this form, you agree to be contacted by our sales team. 
            We respect your privacy and won't share your information with third parties.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ContactSales;