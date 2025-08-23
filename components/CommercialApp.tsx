import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import PaystackPayment from './PaystackPayment';
import ContactSales from './ContactSales';
import App from '../App';

// Simple authentication state type
interface User {
  id: string;
  email: string;
  name: string;
  plan: 'small-business' | 'sme-pro' | 'enterprise';
  businessName: string;
  subscriptionStatus: 'active' | 'trial' | 'inactive';
  trialEndsAt?: string;
}

const CommercialApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'payment' | 'contact-sales' | 'app'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('aura_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setCurrentView('app');
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('aura_user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Add Paystack script to head
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleStartTrial = (plan: any) => {
    if (plan.name === 'Enterprise') {
      setSelectedPlan(plan);
      setCurrentView('contact-sales');
    } else {
      setSelectedPlan(plan);
      setCurrentView('payment');
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    // Create user account after successful payment
    const newUser: User = {
      id: paymentData.reference,
      email: paymentData.customer.email,
      name: `${paymentData.customer.firstName} ${paymentData.customer.lastName}`,
      plan: paymentData.plan.name === 'Small Business' ? 'small-business' : 'sme-pro',
      businessName: paymentData.customer.businessName || '',
      subscriptionStatus: 'active'
    };

    // Store user data
    localStorage.setItem('aura_user', JSON.stringify(newUser));
    setUser(newUser);

    // Log the payment for backend processing
    console.log('Payment successful:', paymentData);
    
    // Switch to main app
    setCurrentView('app');
  };

  const handleContactSalesSubmit = (salesData: any) => {
    // Log the enterprise inquiry
    console.log('Enterprise inquiry:', salesData);
    
    // For now, we'll create a trial user
    const trialUser: User = {
      id: Date.now().toString(),
      email: salesData.email,
      name: `${salesData.firstName} ${salesData.lastName}`,
      plan: 'enterprise',
      businessName: salesData.businessName,
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days trial
    };

    localStorage.setItem('aura_user', JSON.stringify(trialUser));
    setUser(trialUser);
    setCurrentView('app');
  };

  const handleSignOut = () => {
    localStorage.removeItem('aura_user');
    setUser(null);
    setCurrentView('landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Main application with authenticated user
  if (currentView === 'app' && user) {
    return (
      <div>
        {/* User info header */}
        <div className="bg-green-600 text-white px-4 py-2 text-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              Welcome back, {user.name} • {user.businessName} • {user.plan.toUpperCase()} Plan
              {user.subscriptionStatus === 'trial' && user.trialEndsAt && (
                <span className="ml-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs">
                  Trial ends: {new Date(user.trialEndsAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <button 
              onClick={handleSignOut}
              className="hover:bg-green-700 px-3 py-1 rounded text-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
        <App />
      </div>
    );
  }

  // Payment modal
  if (currentView === 'payment' && selectedPlan) {
    return (
      <div>
        <LandingPage />
        <PaystackPayment
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onClose={() => setCurrentView('landing')}
        />
      </div>
    );
  }

  // Contact sales modal
  if (currentView === 'contact-sales' && selectedPlan) {
    return (
      <div>
        <LandingPage />
        <ContactSales
          onSubmit={handleContactSalesSubmit}
          onClose={() => setCurrentView('landing')}
        />
      </div>
    );
  }

  // Default landing page with interactive pricing
  return (
    <LandingPage onStartTrial={handleStartTrial} />
  );
};

export default CommercialApp;