import { VercelRequest, VercelResponse } from '@vercel/node';

// Server-side environment variables (NEVER expose to Vite/frontend)
const ANCHOR_API_KEY = process.env.ANCHOR_API_KEY || '';
const ANCHOR_ENVIRONMENT = process.env.ANCHOR_ENVIRONMENT || 'sandbox';

const getBaseUrl = () => {
  return ANCHOR_ENVIRONMENT === 'production'
    ? 'https://api.getanchor.co/api/v1'
    : 'https://api.sandbox.getanchor.co/api/v1';
};

const getHeaders = () => {
  if (!ANCHOR_API_KEY) throw new Error('Anchor API key is not configured.');
  return {
    'Content-Type': 'application/json',
    'x-anchor-key': ANCHOR_API_KEY,
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { action, payload } = req.body;
    const baseUrl = getBaseUrl();

    try {
      if (action === 'createCustomer') {
        const response = await fetch(`${baseUrl}/customers`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        return res.status(response.ok ? 200 : response.status).json(data);
      }

      if (action === 'createDepositAccount') {
        const response = await fetch(`${baseUrl}/accounts`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        return res.status(response.ok ? 200 : response.status).json(data);
      }

      if (action === 'createCounterparty') {
          const response = await fetch(`${baseUrl}/counterparties`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        return res.status(response.ok ? 200 : response.status).json(data);
      }

      if (action === 'createNipTransfer') {
           const response = await fetch(`${baseUrl}/transfers`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        return res.status(response.ok ? 200 : response.status).json(data);
      }

      if (action === 'webhook') {
          // Process webhook securely
          // In a real implementation this would verify the signature
          const signature = req.headers['x-anchor-signature'];
          if (!signature) {
             return res.status(401).json({ error: 'Missing signature' });
          }
          console.log("Received Anchor webhook:", req.body);
          return res.status(200).json({ status: 'received' });
      }

      return res.status(400).json({ error: 'Unknown action' });

    } catch (error: any) {
      console.error('Anchor API Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
     const { action, accountId, virtualNubanId, bankCode, accountNumber } = req.query;
     const baseUrl = getBaseUrl();

     try {
         if (action === 'getAccountBalance' && accountId) {
             const response = await fetch(`${baseUrl}/accounts/balance/${accountId}`, {
                headers: getHeaders()
             });
             return res.status(response.ok ? 200 : response.status).json(await response.json());
         }

         if (action === 'getVirtualNuban' && virtualNubanId) {
              const response = await fetch(`${baseUrl}/virtual-nubans/${virtualNubanId}`, {
                headers: getHeaders()
             });
             return res.status(response.ok ? 200 : response.status).json(await response.json());
         }

         if (action === 'listBanks') {
             const response = await fetch(`${baseUrl}/banks`, {
                headers: getHeaders()
             });
             return res.status(response.ok ? 200 : response.status).json(await response.json());
         }

         if (action === 'verifyAccount' && bankCode && accountNumber) {
              const response = await fetch(`${baseUrl}/payments/verify-account/${bankCode}/${accountNumber}`, {
                headers: getHeaders()
             });
             return res.status(response.ok ? 200 : response.status).json(await response.json());
         }

          return res.status(400).json({ error: 'Unknown GET action or missing parameters' });
     } catch (error: any) {
        return res.status(500).json({ error: error.message });
     }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
