import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Create server instance
const server = new McpServer({
    name: "aura-finance",
    version: "1.0.0",
});
// Mock Data (In a real app, this would fetch from a database or API)
const mockBills = [
    { id: 'bill_1', vendor: 'Amazon Web Services', amount: 45000, status: 'Unpaid', dueDate: '2025-03-20' },
    { id: 'bill_2', vendor: 'Google Cloud', amount: 12000, status: 'Paid', dueDate: '2025-02-15' },
    { id: 'bill_3', vendor: 'Local Office Rent', amount: 150000, status: 'Unpaid', dueDate: '2025-04-01' },
];
const mockInvoices = [
    { id: 'inv_1', customer: 'TechCorp Solutions', amount: 250000, status: 'Paid', issueDate: '2025-01-10' },
    { id: 'inv_2', customer: 'Global Industries', amount: 120000, status: 'Unpaid', issueDate: '2025-02-05' },
    { id: 'inv_3', customer: 'Startup Hub', amount: 45000, status: 'Overdue', issueDate: '2024-12-15' },
];
// Register Tools
server.registerTool("list_bills", {
    description: "List all bills and their current status",
    inputSchema: z.object({
        status: z.enum(['Paid', 'Unpaid', 'Overdue', 'Draft']).optional().describe("Filter bills by status"),
    }),
}, async ({ status }) => {
    let bills = mockBills;
    if (status) {
        bills = bills.filter(b => b.status === status);
    }
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(bills, null, 2),
            },
        ],
    };
});
server.registerTool("list_invoices", {
    description: "List all invoices and their current status",
    inputSchema: z.object({
        status: z.enum(['Paid', 'Unpaid', 'Overdue', 'Draft']).optional().describe("Filter invoices by status"),
    }),
}, async ({ status }) => {
    let invoices = mockInvoices;
    if (status) {
        invoices = invoices.filter(i => i.status === status);
    }
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(invoices, null, 2),
            },
        ],
    };
});
server.registerTool("get_summary", {
    description: "Get a high-level financial summary",
    inputSchema: z.object({}),
}, async () => {
    const totalRevenue = mockInvoices
        .filter(i => i.status === 'Paid')
        .reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = mockBills
        .filter(b => b.status === 'Paid')
        .reduce((sum, b) => sum + b.amount, 0);
    const pendingReceivables = mockInvoices
        .filter(i => i.status !== 'Paid')
        .reduce((sum, i) => sum + i.amount, 0);
    const pendingPayables = mockBills
        .filter(b => b.status !== 'Paid')
        .reduce((sum, b) => sum + b.amount, 0);
    const summary = {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        pendingReceivables,
        pendingPayables,
        cashPosition: totalRevenue - totalExpenses // Simplified
    };
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(summary, null, 2),
            },
        ],
    };
});
server.registerTool("get_insights", {
    description: "Get AI-generated financial insights based on current data",
    inputSchema: z.object({}),
}, async () => {
    const insights = [
        {
            title: "High Pending Payables",
            description: "You have several unpaid bills totaling 195,000 NGN. Consider scheduling payments to avoid late fees.",
            priority: "High"
        },
        {
            title: "Revenue Growth Opportunity",
            description: "Your revenue from TechCorp Solutions is consistent. You might want to explore expanded service offerings for them.",
            priority: "Medium"
        },
        {
            title: "Expense Anomaly",
            description: "AWS costs are 15% higher than last month. Check for unused resources.",
            priority: "Low"
        }
    ];
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(insights, null, 2),
            },
        ],
    };
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Aura Finance MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
