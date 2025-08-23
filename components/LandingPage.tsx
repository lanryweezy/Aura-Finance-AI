import React from 'react';

interface LandingPageProps {
  onStartTrial?: (plan: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartTrial }) => {
  const pricingPlans = [
    {
      name: 'Small Business',
      description: 'Perfect for startups and small businesses',
      price: '₦8,500',
      period: '/month',
      users: 'Up to 2 users',
      features: [
        'Basic invoicing & receipts',
        'Expense tracking',
        'VAT compliance (7.5%)',
        'Basic financial reports',
        'Bank reconciliation',
        'Email support',
        'Mobile app access'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'SME Pro',
      description: 'Ideal for growing medium enterprises',
      price: '₦18,000',
      period: '/month',
      users: 'Up to 5 users',
      features: [
        'Everything in Small Business',
        'Advanced financial reporting',
        'Payroll management (PAYE)',
        'Multi-currency support',
        'Inventory management',
        'API access',
        'Priority support',
        'Custom invoice branding',
        'Advanced analytics dashboard'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: 'Custom',
      period: 'pricing',
      users: 'Unlimited users',
      features: [
        'Everything in SME Pro',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced compliance tools',
        'Multi-location support',
        'Custom workflows',
        'SLA guarantee',
        'On-premise deployment option',
        'Training & onboarding'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const features = [
    {
      icon: '🇳🇬',
      title: 'Built for Nigeria',
      description: 'Native support for Nigerian tax laws, VAT, PAYE, and banking systems'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Intelligence',
      description: 'Smart transaction categorization and financial insights with local context'
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      description: 'Optimized for Nigerian mobile usage patterns with offline capability'
    },
    {
      icon: '💼',
      title: 'Complete Business Suite',
      description: 'Invoicing, payroll, expenses, and tax compliance in one platform'
    },
    {
      icon: '🔒',
      title: 'Bank-Grade Security',
      description: 'Secure financial data with Nigerian compliance standards'
    },
    {
      icon: '💸',
      title: 'Local Payment Integration',
      description: 'Seamless integration with Paystack, Flutterwave, and Nigerian banks'
    }
  ];

  const testimonials = [
    {
      name: 'Adebayo Ogundimu',
      role: 'CEO, TechStart Lagos',
      company: 'Lagos Tech Hub',
      quote: 'Aura Finance cut our accounting time from days to hours. The AI understands Nigerian business patterns perfectly.',
      avatar: '👨🏿‍💼'
    },
    {
      name: 'Fatima Abdullahi',
      role: 'Finance Director',
      company: 'Abuja Consulting',
      quote: 'Finally, a platform that knows Nigerian VAT rules inside out. Our compliance is now 100% automated.',
      avatar: '👩🏿‍💼'
    },
    {
      name: 'Chinedu Okeke',
      role: 'Business Owner',
      company: 'Kano Trading Co.',
      quote: 'The mobile app works perfectly even with our poor internet. Now I can manage finances from anywhere.',
      avatar: '👨🏿‍💼'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Smart Finance Management for 
              <span className="text-green-600"> Nigerian Businesses</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered financial platform designed specifically for Nigerian entrepreneurs. 
              Simplify VAT, payroll, invoicing, and tax compliance with local expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors">
                Start 30-Day Free Trial
              </button>
              <button className="border border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors">
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Setup in 5 minutes • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything Nigerian Businesses Need
            </h2>
            <p className="text-xl text-gray-600">
              Built by Nigerians, for Nigerian business challenges
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing for Every Business Size
            </h2>
            <p className="text-xl text-gray-600">
              Start free, scale as you grow. All prices in Nigerian Naira.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.popular 
                    ? 'border-green-500 bg-white shadow-xl scale-105' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}
                    <span className="text-lg text-gray-500 font-normal">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{plan.users}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => onStartTrial && onStartTrial(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'border border-green-600 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Payments powered by <strong>Paystack</strong> • Secure & reliable • 30-day money-back guarantee
            </p>
            <p className="text-sm text-gray-500">
              All plans include SSL security, data backup, and Nigerian customer support
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Nigerian Entrepreneurs
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of businesses already simplifying their finances
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <p className="text-green-600 text-sm">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business Finance?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of Nigerian businesses already using Aura Finance AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Start Your Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Aura Finance AI</h3>
              <p className="text-gray-400">
                Empowering Nigerian businesses with intelligent financial management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>System Status</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Aura Finance AI. Made with ❤️ in Nigeria.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;