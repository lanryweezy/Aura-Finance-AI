import React, { useState } from 'react';
import { Card } from './Card';
import { NIGERIAN_BANKS } from '../../constants';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

interface OnboardingData {
  businessName: string;
  businessType: string;
  taxId: string;
  bank: string;
  expectedMonthlyRevenue: string;
  mainChallenges: string[];
}

const businessTypes = [
  'Trading/Retail',
  'Professional Services',
  'Manufacturing',
  'Technology/Software',
  'Agriculture',
  'Construction',
  'Transportation/Logistics',
  'Hospitality/Restaurant',
  'Healthcare',
  'Education/Training',
  'Import/Export',
  'Other'
];

const commonChallenges = [
  'Tax compliance and filing',
  'Cash flow management',
  'Invoice and payment tracking',
  'Payroll and staff management',
  'Expense categorization',
  'Financial reporting',
  'Bank reconciliation',
  'VAT calculations',
  'Foreign exchange management'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    taxId: '',
    bank: '',
    expectedMonthlyRevenue: '',
    mainChallenges: []
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    onComplete(formData);
    onClose();
  };

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleChallenge = (challenge: string) => {
    const current = formData.mainChallenges;
    if (current.includes(challenge)) {
      updateFormData('mainChallenges', current.filter(c => c !== challenge));
    } else {
      updateFormData('mainChallenges', [...current, challenge]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-cyan via-nigerian-green to-brand-pink rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  <path d="M12 3v6l4-4-4-4"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Welcome to Aura Finance</h2>
                <p className="text-sm text-gray-400">Let's set up your Nigerian business account</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-dark-secondary rounded-lg text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-dark-tertiary rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-brand-cyan to-nigerian-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Business Information</h3>
                <p className="text-gray-400 text-sm mb-4">Tell us about your Nigerian business</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                  className="w-full p-3 bg-dark-secondary border border-gray-600 rounded-lg text-white focus:border-brand-cyan focus:outline-none"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => updateFormData('businessType', e.target.value)}
                  className="w-full p-3 bg-dark-secondary border border-gray-600 rounded-lg text-white focus:border-brand-cyan focus:outline-none"
                >
                  <option value="">Select business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tax Identification Number (TIN)</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => updateFormData('taxId', e.target.value)}
                  className="w-full p-3 bg-dark-secondary border border-gray-600 rounded-lg text-white focus:border-brand-cyan focus:outline-none"
                  placeholder="Enter your TIN (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">Required for VAT and tax compliance features</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Banking Information</h3>
                <p className="text-gray-400 text-sm mb-4">Connect your Nigerian bank account</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Primary Bank</label>
                <select
                  value={formData.bank}
                  onChange={(e) => updateFormData('bank', e.target.value)}
                  className="w-full p-3 bg-dark-secondary border border-gray-600 rounded-lg text-white focus:border-brand-cyan focus:outline-none"
                >
                  <option value="">Select your bank</option>
                  {NIGERIAN_BANKS.map(bank => (
                    <option key={bank.code} value={bank.name}>{bank.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-400 mb-1">Secure Bank Connection</h4>
                    <p className="text-xs text-gray-300">
                      We use bank-grade encryption to securely connect to your Nigerian bank account. 
                      Your login credentials are never stored on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Business Scale</h3>
                <p className="text-gray-400 text-sm mb-4">Help us customize your experience</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Expected Monthly Revenue</label>
                <select
                  value={formData.expectedMonthlyRevenue}
                  onChange={(e) => updateFormData('expectedMonthlyRevenue', e.target.value)}
                  className="w-full p-3 bg-dark-secondary border border-gray-600 rounded-lg text-white focus:border-brand-cyan focus:outline-none"
                >
                  <option value="">Select revenue range</option>
                  <option value="0-500k">₦0 - ₦500,000</option>
                  <option value="500k-2m">₦500,000 - ₦2,000,000</option>
                  <option value="2m-10m">₦2,000,000 - ₦10,000,000</option>
                  <option value="10m-50m">₦10,000,000 - ₦50,000,000</option>
                  <option value="50m+">₦50,000,000+</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-dark-secondary/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Small Business (₦0-25M)</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>• 20% Company Income Tax</li>
                    <li>• Simplified reporting</li>
                    <li>• Basic compliance tools</li>
                  </ul>
                </div>
                <div className="bg-dark-secondary/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Medium/Large (₦25M+)</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>• 30% Company Income Tax</li>
                    <li>• Advanced reporting</li>
                    <li>• Full compliance suite</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Your Main Challenges</h3>
                <p className="text-gray-400 text-sm mb-4">Select the areas where you need the most help</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonChallenges.map(challenge => (
                  <button
                    key={challenge}
                    onClick={() => toggleChallenge(challenge)}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                      formData.mainChallenges.includes(challenge)
                        ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'
                        : 'bg-dark-secondary border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.mainChallenges.includes(challenge)
                          ? 'border-brand-cyan bg-brand-cyan'
                          : 'border-gray-400'
                      }`}>
                        {formData.mainChallenges.includes(challenge) && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{challenge}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && (!formData.businessName || !formData.businessType)) ||
                  (step === 2 && !formData.bank) ||
                  (step === 3 && !formData.expectedMonthlyRevenue)
                }
                className="px-6 py-2 bg-brand-cyan text-black font-medium rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-gradient-to-r from-brand-cyan to-nigerian-green text-black font-medium rounded-lg hover:opacity-90"
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};