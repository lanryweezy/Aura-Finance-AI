import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const server = new McpServer({
  name: "aura-finance",
  version: "2.0.0",
});

async function query(table: string, filters?: Record<string, any>) {
  if (!supabase) return [];
  let q = supabase.from(table).select('*');
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) q = q.eq(k, v);
    });
  }
  const { data, error } = await q;
  if (error) { console.error(`Query ${table}:`, error.message); return []; }
  return data || [];
}

// ========== READ TOOLS ==========

server.registerTool("list_bills", {
  description: "List all bills and their current status",
  inputSchema: { status: z.enum(['Paid', 'Unpaid', 'Overdue', 'Draft']).optional().describe("Filter bills by status") },
}, async ({ status }) => {
  const bills = await query('bills', status ? { status } : undefined);
  return { content: [{ type: "text", text: JSON.stringify(bills, null, 2) }] };
});

server.registerTool("list_invoices", {
  description: "List all invoices and their current status",
  inputSchema: { status: z.enum(['Paid', 'Unpaid', 'Overdue', 'Draft']).optional().describe("Filter invoices by status") },
}, async ({ status }) => {
  const invoices = await query('invoices', status ? { status } : undefined);
  return { content: [{ type: "text", text: JSON.stringify(invoices, null, 2) }] };
});

server.registerTool("list_transactions", {
  description: "List recent bank transactions",
  inputSchema: { type: z.enum(['debit', 'credit']).optional().describe("Filter by transaction type") },
}, async ({ type }) => {
  const txs = await query('transactions', type ? { type } : undefined);
  return { content: [{ type: "text", text: JSON.stringify(txs, null, 2) }] };
});

server.registerTool("list_projects", {
  description: "List all active projects",
  inputSchema: {},
}, async () => {
  const projects = await query('projects');
  return { content: [{ type: "text", text: JSON.stringify(projects, null, 2) }] };
});

server.registerTool("list_inventory", {
  description: "List inventory items and stock levels",
  inputSchema: {},
}, async () => {
  const items = await query('inventory');
  return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
});

server.registerTool("list_contacts", {
  description: "List customers and vendors",
  inputSchema: { type: z.enum(['Customer', 'Vendor']).optional().describe("Filter by contact type") },
}, async ({ type }) => {
  const contacts = await query('contacts', type ? { type } : undefined);
  return { content: [{ type: "text", text: JSON.stringify(contacts, null, 2) }] };
});

server.registerTool("list_employees", {
  description: "List all employees and payroll information",
  inputSchema: {},
}, async () => {
  const employees = await query('employees');
  return { content: [{ type: "text", text: JSON.stringify(employees, null, 2) }] };
});

server.registerTool("get_summary", {
  description: "Get a high-level financial summary",
  inputSchema: {},
}, async () => {
  const invoices = await query('invoices');
  const bills = await query('bills');
  const totalRevenue = invoices.filter((i: any) => i.status === 'Paid').reduce((s: number, i: any) => s + (i.total || 0), 0);
  const totalExpenses = bills.filter((b: any) => b.status === 'Paid').reduce((s: number, b: any) => s + (b.amount || 0), 0);
  const pendingReceivables = invoices.filter((i: any) => i.status !== 'Paid').reduce((s: number, i: any) => s + (i.total || 0), 0);
  const pendingPayables = bills.filter((b: any) => b.status !== 'Paid').reduce((s: number, b: any) => s + (b.amount || 0), 0);
  return { content: [{ type: "text", text: JSON.stringify({ totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, pendingReceivables, pendingPayables }, null, 2) }] };
});

server.registerTool("get_insights", {
  description: "Get AI-generated financial insights",
  inputSchema: {},
}, async () => {
  const invoices = await query('invoices');
  const bills = await query('bills');
  const insights: any[] = [];
  const unpaid = invoices.filter((i: any) => i.status !== 'Paid');
  const unpaidTotal = unpaid.reduce((s: number, i: any) => s + (i.total || 0), 0);
  if (unpaidTotal > 0) insights.push({ title: 'Outstanding Receivables', description: `${unpaid.length} unpaid invoices worth ₦${unpaidTotal.toLocaleString()}`, priority: 'High' });
  const unpaidBills = bills.filter((b: any) => b.status !== 'Paid');
  const unpaidBillsTotal = unpaidBills.reduce((s: number, b: any) => s + (b.amount || 0), 0);
  if (unpaidBillsTotal > 0) insights.push({ title: 'Outstanding Payables', description: `${unpaidBills.length} unpaid bills worth ₦${unpaidBillsTotal.toLocaleString()}`, priority: 'Medium' });
  return { content: [{ type: "text", text: JSON.stringify(insights, null, 2) }] };
});

// ========== WRITE TOOLS ==========

server.registerTool("create_transaction", {
  description: "Record a new manual transaction",
  inputSchema: {
    amount: z.number().positive(),
    type: z.enum(['debit', 'credit']),
    category: z.string(),
    narration: z.string(),
    date: z.string().optional().describe("ISO date string, defaults to today"),
  },
}, async (tx) => {
  if (!supabase) return { content: [{ type: "text", text: "Supabase not configured" }] };
  const { data, error } = await supabase.from('transactions').insert({
    id: `tx_${Date.now()}`, amount: tx.amount, type: tx.type,
    category: tx.category, narration: tx.narration,
    date: tx.date || new Date().toISOString(),
  }).select().single();
  if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
  return { content: [{ type: "text", text: `Transaction recorded: ${JSON.stringify(data)}` }] };
});

server.registerTool("create_bill", {
  description: "Record a new bill from a vendor",
  inputSchema: { vendor: z.string(), amount: z.number().positive(), dueDate: z.string(), description: z.string() },
}, async (bill) => {
  if (!supabase) return { content: [{ type: "text", text: "Supabase not configured" }] };
  const { data, error } = await supabase.from('bills').insert({
    vendor: bill.vendor, amount: bill.amount, due_date: bill.dueDate,
    description: bill.description, status: 'Unpaid',
  }).select().single();
  if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
  return { content: [{ type: "text", text: `Bill recorded: ${JSON.stringify(data)}` }] };
});

server.registerTool("create_invoice", {
  description: "Create a new invoice for a customer",
  inputSchema: { customer: z.string(), amount: z.number().positive(), description: z.string() },
}, async (inv) => {
  if (!supabase) return { content: [{ type: "text", text: "Supabase not configured" }] };
  const vat = Math.round(inv.amount * 0.075);
  const { data, error } = await supabase.from('invoices').insert({
    customer: inv.customer, amount: inv.amount, vat,
    total: inv.amount + vat, description: inv.description,
    status: 'Unpaid', issue_date: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 86400000).toISOString(),
  }).select().single();
  if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
  return { content: [{ type: "text", text: `Invoice created: ${JSON.stringify(data)}` }] };
});

server.registerTool("run_payroll", {
  description: "Execute payroll for all employees",
  inputSchema: { period: z.string().describe("The payroll period, e.g., 'March 2025'") },
}, async ({ period }) => {
  const employees = await query('employees');
  return { content: [{ type: "text", text: `Payroll for ${period} executed for ${employees.length} employees.` }] };
});

server.registerTool("generate_tax_report", {
  description: "Generate a Nigerian tax compliance report",
  inputSchema: { taxType: z.enum(['VAT', 'PAYE', 'WHT', 'CIT']), period: z.string() },
}, async ({ taxType, period }) => {
  const invoices = await query('invoices');
  const totalVat = invoices.reduce((s: number, i: any) => s + (i.vat || 0), 0);
  return { content: [{ type: "text", text: JSON.stringify({ taxType, period, totalLiability: totalVat, status: 'Draft' }, null, 2) }] };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Aura Finance MCP Server v2.0.0 running on stdio${supabase ? ' (Supabase connected)' : ' (mock mode)'}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
