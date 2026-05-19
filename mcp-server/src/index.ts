import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "aura-finance",
  version: "1.1.0",
});

// Mock Data (Expanded)
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

// --- Read Tools ---

server.registerTool(
  "list_bills",
  {
    description: "List all bills and their current status",
    inputSchema: z.object({
      status: z.enum(['Paid', 'Unpaid', 'Overdue', 'Draft']).optional().describe("Filter bills by status"),
    }),
  },
  async ({ status }) => {
    let bills = mockBills;
    if (status) {
      bills = bills.filter(b => b.status === status);
    }
    return { content: [{ type: "text", text: JSON.stringify(bills, null, 2) }] };
  }
);

server.registerTool(
  "list_invoices",
  {
    description: "List all invoices and their current status",
    inputSchema: z.object({
      status: z.enum(['Paid', 'Unpaid', 'Overdue', 'Draft']).optional().describe("Filter invoices by status"),
    }),
  },
  async ({ status }) => {
    let invoices = mockInvoices;
    if (status) {
      invoices = invoices.filter(i => i.status === status);
    }
    return { content: [{ type: "text", text: JSON.stringify(invoices, null, 2) }] };
  }
);

server.registerTool(
    "list_transactions",
    {
      description: "List recent bank transactions",
      inputSchema: z.object({
        type: z.enum(['debit', 'credit']).optional().describe("Filter by transaction type"),
      }),
    },
    async ({ type }) => {
      let txs = mockTransactions;
      if (type) {
        txs = txs.filter(t => t.type === type);
      }
      return { content: [{ type: "text", text: JSON.stringify(txs, null, 2) }] };
    }
);

server.registerTool(
    "list_projects",
    {
      description: "List all active projects",
      inputSchema: z.object({}),
    },
    async () => {
      return { content: [{ type: "text", text: JSON.stringify(mockProjects, null, 2) }] };
    }
);

server.registerTool(
    "list_inventory",
    {
      description: "List inventory items and stock levels",
      inputSchema: z.object({}),
    },
    async () => {
      return { content: [{ type: "text", text: JSON.stringify(mockInventory, null, 2) }] };
    }
);

server.registerTool(
    "list_contacts",
    {
      description: "List customers and vendors",
      inputSchema: z.object({
        type: z.enum(['Customer', 'Vendor']).optional().describe("Filter by contact type"),
      }),
    },
    async ({ type }) => {
      let contacts = mockContacts;
      if (type) {
        contacts = contacts.filter(c => c.type === type);
      }
      return { content: [{ type: "text", text: JSON.stringify(contacts, null, 2) }] };
    }
);

server.registerTool(
    "list_employees",
    {
      description: "List all employees and payroll information",
      inputSchema: z.object({}),
    },
    async () => {
      return { content: [{ type: "text", text: JSON.stringify(mockEmployees, null, 2) }] };
    }
);

server.registerTool(
  "get_summary",
  {
    description: "Get a high-level financial summary",
    inputSchema: z.object({}),
  },
  async () => {
    const totalRevenue = mockInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = mockBills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
    const pendingReceivables = mockInvoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const pendingPayables = mockBills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + b.amount, 0);

    const summary = {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      pendingReceivables,
      pendingPayables,
      cashPosition: totalRevenue - totalExpenses
    };
    return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
  }
);

server.registerTool(
    "get_insights",
    {
      description: "Get AI-generated financial insights",
      inputSchema: z.object({}),
    },
    async () => {
      const insights = [
          { title: "High Pending Payables", description: "You have several unpaid bills totaling 195,000 NGN.", priority: "High" },
          { title: "Revenue Growth Opportunity", description: "Your revenue from TechCorp Solutions is consistent.", priority: "Medium" },
          { title: "Cashflow Forecast", description: "Based on current trends, your cash position will remain stable for the next 45 days.", priority: "Low" }
      ];
      return { content: [{ type: "text", text: JSON.stringify(insights, null, 2) }] };
    }
);

server.registerTool(
  "run_payroll",
  {
    description: "Execute payroll for all employees",
    inputSchema: z.object({
      period: z.string().describe("The payroll period, e.g., 'March 2025'"),
    }),
  },
  async ({ period }) => {
    return { content: [{ type: "text", text: `Payroll for ${period} has been executed successfully for ${mockEmployees.length} employees.` }] };
  }
);

server.registerTool(
  "generate_tax_report",
  {
    description: "Generate a Nigerian tax compliance report",
    inputSchema: z.object({
      taxType: z.enum(['VAT', 'PAYE', 'WHT', 'CIT']),
      period: z.string(),
    }),
  },
  async ({ taxType, period }) => {
    const report = {
      taxType,
      period,
      totalLiability: 125000,
      status: 'Draft',
      breakdown: [
        { description: 'Standard Rate', amount: 125000 }
      ]
    };
    return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
  }
);

// --- Write Tools ---

server.registerTool(
    "create_transaction",
    {
      description: "Record a new manual transaction",
      inputSchema: z.object({
        amount: z.number().positive(),
        type: z.enum(['debit', 'credit']),
        category: z.string(),
        narration: z.string(),
        date: z.string().optional().describe("ISO date string, defaults to today"),
      }),
    },
    async (tx) => {
      const newTx = { id: `tx_${Date.now()}`, date: tx.date || new Date().toISOString(), ...tx };
      // In real app, persist to DB
      return { content: [{ type: "text", text: `Transaction recorded successfully: ${JSON.stringify(newTx)}` }] };
    }
);

server.registerTool(
    "create_bill",
    {
      description: "Record a new bill from a vendor",
      inputSchema: z.object({
        vendor: z.string(),
        amount: z.number().positive(),
        dueDate: z.string(),
        description: z.string(),
      }),
    },
    async (bill) => {
      const newBill = { id: `bill_${Date.now()}`, status: 'Unpaid', ...bill };
      return { content: [{ type: "text", text: `Bill recorded successfully: ${JSON.stringify(newBill)}` }] };
    }
);

server.registerTool(
    "create_invoice",
    {
      description: "Create a new invoice for a customer",
      inputSchema: z.object({
        customer: z.string(),
        amount: z.number().positive(),
        description: z.string(),
      }),
    },
    async (inv) => {
      const newInv = { id: `inv_${Date.now()}`, status: 'Unpaid', issueDate: new Date().toISOString(), ...inv };
      return { content: [{ type: "text", text: `Invoice created successfully: ${JSON.stringify(newInv)}` }] };
    }
);

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
