import type { CorporateCard } from '../../../types';

export const anchorCardProvider = {
  createCard: async (cardData: any): Promise<any> => {
    // This is where actual Anchor API logic would go.
    // For now it returns a mock to adhere to the abstraction requirement.
    console.log('Anchor createCard called', cardData);
    return {
      providerCardId: `anchor_${Date.now()}`,
      provider: 'anchor'
    };
  }
};
