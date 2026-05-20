
export const exchangeRateService = {
    getRate: async (from: string, to: string = 'NGN'): Promise<number> => {
        // Simulated real-time rates
        const rates: Record<string, number> = {
            'USD_NGN': 1550,
            'GBP_NGN': 1980,
            'EUR_NGN': 1680,
            'NGN_USD': 1/1550,
        };
        const pair = `${from}_${to}`;
        return rates[pair] || 1;
    },

    convert: async (amount: number, from: string, to: string = 'NGN'): Promise<number> => {
        const rate = await exchangeRateService.getRate(from, to);
        return amount * rate;
    }
};
