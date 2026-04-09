
import React, { useState } from 'react';

const RATES: Record<string, number> = {
    'NGN': 1,
    'USD': 1550.00,
    'GBP': 2010.50,
};

interface CurrencyContextType {
    currency: string;
    setCurrency: (c: string) => void;
    formatAmount: (amount: number) => string;
}

const CurrencyContext = React.createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState('NGN');

    const formatAmount = (amount: number) => {
        const rate = RATES[currency] || 1;
        const converted = amount / rate;

        return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : currency === 'USD' ? 'en-US' : 'en-GB', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = React.useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
    return context;
};
