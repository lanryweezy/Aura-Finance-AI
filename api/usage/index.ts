
// Mock Vercel Serverless Function for usage tracking
// In production, this would securely update a database (e.g., Vercel Postgres or Upstash Redis)

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const { tenantId, type, increment } = req.body;

    // Logic to increment usage in DB...
    console.log(`[Vercel Serverless] Tracking usage for ${tenantId}: ${type} +${increment}`);

    return res.status(200).json({ success: true, message: 'Usage recorded' });
  }

  if (req.method === 'GET') {
      const { tenantId } = req.query;
      // Logic to fetch usage from DB...
      return res.status(200).json({
          usage: [
              { type: 'ai_insight', used: 12, limit: 100 },
              { type: 'ocr_scan', used: 5, limit: 50 }
          ]
      });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
