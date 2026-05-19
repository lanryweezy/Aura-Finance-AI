import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Create server instance
const server = new McpServer({
    name: "aura-finance",
    version: "1.2.0",
});
// Mock Data (Fully Featured)
const mockBills = [
    { id: 'bill_1', vendor: 'Amazon Web Services', amount: 45000, status: 'Unpaid', dueDate: '2025-03-20', description: 'Monthly Cloud Infrastructure' },
    { id: 'bill_2', vendor: 'Google Cloud', amount: 12000, status: 'Paid', dueDate: '2025-02-15', description: 'Domain Services' },
    { id: 'bill_3', vendor: 'Local Office Rent', amount: 150000, status: 'Unpaid', dueDate: '2025-04-01', description: 'Q2 Office Rent' },
];
const mockInvoices = [
    { id: 'inv_1', customer: 'TechCorp Solutions', amount: 250000, status: 'Paid', issueDate: '2025-01-10', description: 'Software Development' },
    { id: 'inv_2', customer: 'Global Industries', amount: 120000, status: 'Unpaid', issueDate: '2025-02-05', description: 'Consulting Services' },
    { id: 'inv_3', customer: 'Startup Hub', amount: 45000, status: 'Overdue', issueDate: '2024-12-15', description: 'MVP Design' },
];
const mockTransactions = [
    { id: 'tx_1', date: '2025-02-28', amount: 250000, type: 'credit', category: 'Revenue', narration: 'TechCorp Invoice Pymt' },
    { id: 'tx_2', date: '2025-02-27', amount: 12000, type: 'debit', category: 'IT Expenses', narration: 'Google Cloud Bill' },
    { id: 'tx_3', date: '2025-02-26', amount: 350000, type: 'debit', category: 'Salaries', narration: 'Ada Okoro Salary' },
];
const mockProjects = [
    { id: 'proj_1', name: 'Aura Website Revamp' },
    { id: 'proj_2', name: 'Q4 Marketing Campaign' },
];
const mockInventory = [
    { id: 'inv_item_1', name: 'Web Dev Retainer (Monthly)', sku: 'WD-RETAIN', category: 'Services', type: 'Service', salePrice: 500000, quantity: 9999 },
    { id: 'inv_item_3', name: 'Laptop - 16" Pro', sku: 'HW-LAP-PRO16', category: 'Hardware', type: 'Product', salePrice: 1250000, quantity: 5 },
];
const mockContacts = [
    { id: 'cont_1', type: 'Customer', name: 'John Doe', companyName: 'Client A Inc.', email: 'accounts@clienta.com' },
    { id: 'cont_3', type: 'Vendor', name: 'Tech Depot', companyName: 'Tech Supplies Ltd', email: 'sales@techdepot.ng' },
];
const mockEmployees = [
    { id: 'emp_1', name: 'Ada Okoro', grossSalary: 350000, jobTitle: 'Lead Developer', email: 'ada.okoro@example.com' },
    { id: 'emp_2', name: 'Bolu Adebayo', grossSalary: 450000, jobTitle: 'Product Manager', email: 'bolu.adebayo@example.com' },
];
const mockPurchaseOrders = [
    { id: 'po_1', vendor: 'Tech Supplies Ltd', total: 1900000, status: 'Sent', expectedDeliveryDate: '2025-03-10' },
];
const mockEstimates = [
    { id: 'est_1', customer: 'New Tech Inc', total: 500000, status: 'Draft', expiryDate: '2025-03-30' },
];
const mockJournalEntries = [
    { id: 'je_1', date: '2025-02-01', narration: 'Monthly Depreciation', lines: [{ accountName: 'Depreciation', type: 'debit', amount: 50000 }, { accountName: 'Accumulated Depreciation', type: 'credit', amount: 50000 }] },
];
const mockBudgets = [
    { category: 'Software & Subscriptions', amount: 50000 },
    { category: 'Marketing & Advertising', amount: 100000 },
];
const mockAuditLogs = [
    { id: 'log_1', timestamp: '2025-03-01T10:00:00Z', user: 'Admin', action: 'Created Invoice inv_2' },
];
// --- Read Tools ---
server.registerTool("list_bills", {
    description: "List all bills and their current status",
    inputSchema: z.object({ status: z.enum(['Paid', 'Unpaid', 'Overdue', 'Draft']).optional() }),
}, async ({ status }) => {
    let data = mockBills;
    if (status)
        data = data.filter(b => b.status === status);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});
server.registerTool("list_invoices", {
    description: "List all invoices and their current status",
    inputSchema: z.object({ status: z.enum(['Paid', 'Unpaid', 'Overdue', 'Draft']).optional() }),
}, async ({ status }) => {
    let data = mockInvoices;
    if (status)
        data = data.filter(i => i.status === status);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});
server.registerTool("list_transactions", {
    description: "List recent bank transactions",
    inputSchema: z.object({ type: z.enum(['debit', 'credit']).optional() }),
}, async ({ type }) => {
    let data = mockTransactions;
    if (type)
        data = data.filter(t => t.type === type);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});
server.registerTool("list_projects", { description: "List all active projects", inputSchema: z.object({}) }, async () => {
    return { content: [{ type: "text", text: JSON.stringify(mockProjects, null, 2) }] };
});
server.registerTool("list_inventory", { description: "List inventory items and stock levels", inputSchema: z.object({}) }, async () => {
    return { content: [{ type: "text", text: JSON.stringify(mockInventory, null, 2) }] };
});
server.registerTool("list_contacts", {
    description: "List customers and vendors",
    inputSchema: z.object({ type: z.enum(['Customer', 'Vendor']).optional() }),
}, async ({ type }) => {
    let data = mockContacts;
    if (type)
        data = data.filter(c => c.type === type);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});
server.registerTool("list_employees", { description: "List all employees", inputSchema: z.object({}) }, async () => {
    return { content: [{ type: "text", text: JSON.stringify(mockEmployees, null, 2) }] };
});
server.registerTool("list_purchase_orders", { description: "List all purchase orders", inputSchema: z.object({}) }, async () => {
    return { content: [{ type: "text", text: JSON.stringify(mockPurchaseOrders, null, 2) }] };
});
server.registerTool("list_estimates", { description: "List all sales estimates", inputSchema: z.object({}) }, async () => {
    return { content: [{ type: "text", text: JSON.stringify(mockEstimates, null, 2) }] };
});
server.registerTool("list_journal_entries", { description: "List all manual journal entries", inputSchema: z.object({}) }, async () => {
    return { content: [{ type: "text", text: JSON.stringify(mockJournalEntries, null, 2) }] };
});
server.registerTool("list_audit_logs", { description: "List recent system audit logs", inputSchema: z.object({}) }, async () => {
    return { content: [{ type: "text", text: JSON.stringify(mockAuditLogs, null, 2) }] };
});
server.registerTool("get_budgets", { description: "Get monthly budget targets by category", inputSchema: z.object({}) }, async () => {
    return { content: [{ type: "text", text: JSON.stringify(mockBudgets, null, 2) }] };
});
server.registerTool("get_summary", { description: "Get a high-level financial summary", inputSchema: z.object({}) }, async () => {
    const totalRevenue = mockInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = mockBills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
    const pendingReceivables = mockInvoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const pendingPayables = mockBills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.amount, 0);
    return { content: [{ type: "text", text: JSON.stringify({ totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, pendingReceivables, pendingPayables }, null, 2) }] };
});
server.registerTool("get_insights", { description: "Get AI-generated financial insights", inputSchema: z.object({}) }, async () => {
    return { content: [{ type: "text", text: JSON.stringify([{ title: "High Pending Payables", description: "You have several unpaid bills totaling 195,000 NGN.", priority: "High" }], null, 2) }] };
});
// --- Write Tools ---
server.registerTool("create_transaction", {
    description: "Record a new manual transaction",
    inputSchema: z.object({ amount: z.number().positive(), type: z.enum(['debit', 'credit']), category: z.string(), narration: z.string(), date: z.string().optional() }),
}, async (tx) => {
    return { content: [{ type: "text", text: `Transaction recorded: ${JSON.stringify({ id: `tx_${Date.now()}`, ...tx })}` }] };
});
server.registerTool("create_bill", {
    description: "Record a new bill from a vendor",
    inputSchema: z.object({ vendor: z.string(), amount: z.number().positive(), dueDate: z.string(), description: z.string() }),
}, async (bill) => {
    return { content: [{ type: "text", text: `Bill recorded: ${JSON.stringify({ id: `bill_${Date.now()}`, status: 'Unpaid', ...bill })}` }] };
});
server.registerTool("create_invoice", {
    description: "Create a new invoice for a customer",
    inputSchema: z.object({ customer: z.string(), amount: z.number().positive(), description: z.string() }),
}, async (inv) => {
    return { content: [{ type: "text", text: `Invoice created: ${JSON.stringify({ id: `inv_${Date.now()}`, status: 'Unpaid', issueDate: new Date().toISOString(), ...inv })}` }] };
});
server.registerTool("create_contact", {
    description: "Add a new customer or vendor contact",
    inputSchema: z.object({ name: z.string(), companyName: z.string().optional(), type: z.enum(['Customer', 'Vendor']), email: z.string().email(), phone: z.string().optional() }),
}, async (contact) => {
    return { content: [{ type: "text", text: `Contact created: ${JSON.stringify({ id: `cont_${Date.now()}`, ...contact })}` }] };
});
server.registerTool("create_project", {
    description: "Create a new internal or client project",
    inputSchema: z.object({ name: z.string(), description: z.string().optional() }),
}, async (proj) => {
    return { content: [{ type: "text", text: `Project created: ${JSON.stringify({ id: `proj_${Date.now()}`, ...proj })}` }] };
});
server.registerTool("create_employee", {
    description: "Add a new employee to payroll",
    inputSchema: z.object({ name: z.string(), jobTitle: z.string(), email: z.string().email(), grossSalary: z.number().positive() }),
}, async (emp) => {
    return { content: [{ type: "text", text: `Employee created: ${JSON.stringify({ id: `emp_${Date.now()}`, ...emp })}` }] };
});
server.registerTool("update_budget", {
    description: "Set or update the monthly budget for a category",
    inputSchema: z.object({ category: z.string(), amount: z.number().nonnegative() }),
}, async (budget) => {
    return { content: [{ type: "text", text: `Budget updated: ${JSON.stringify(budget)}` }] };
});
server.registerTool("record_journal_entry", {
    description: "Record a manual double-entry journal entry",
    inputSchema: z.object({ narration: z.string(), lines: z.array(z.object({ accountName: z.string(), type: z.enum(['debit', 'credit']), amount: z.number().positive() })).min(2) }),
}, async (je) => {
    return { content: [{ type: "text", text: `Journal Entry recorded: ${JSON.stringify({ id: `je_${Date.now()}`, date: new Date().toISOString(), ...je })}` }] };
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
