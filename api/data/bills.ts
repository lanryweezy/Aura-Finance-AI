
export default async function handler(req: any, res: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';

    if (req.method === 'GET') {
        // Fetch from Vercel Postgres / Redis...
        return res.status(200).json([
            { id: 'bill_prod_1', vendor: 'Amazon Web Services', amount: 45000, status: 'Unpaid', dueDate: new Date().toISOString() }
        ]);
    }

    if (req.method === 'POST') {
        const data = req.body;
        // Save to DB...
        return res.status(201).json({ id: `bill_${Date.now()}`, ...data, status: 'Unpaid' });
    }

    return res.status(405).end();
}
