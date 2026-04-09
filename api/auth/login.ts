
export default async function handler(req: any, res: any) {
    const { email, password } = req.body;

    if (req.method === 'POST') {
        // Authenticate via Auth0 / Clerk / Custom DB...
        const orgId = `org_${email.split('@')[0]}`;
        const user = {
            id: `u_${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            organizationId: orgId
        };
        const org = {
            id: orgId,
            name: `${user.name}'s Organization`,
            plan: 'Free'
        };

        return res.status(200).json({ user, org, token: `jwt-${user.id}` });
    }

    return res.status(405).end();
}
