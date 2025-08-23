from __future__ import annotations
from typing import List
from datetime import datetime, timedelta
from .schemas import *

# Seed data similar to frontend mocks

employees: List[Employee] = [
	Employee(id='emp_1', name='Ada Okoro', grossSalary=350000, jobTitle='Lead Developer', hireDate='2022-05-15T00:00:00Z', email='ada.okoro@example.com', bankName='GTBank', accountNumber='0123456789'),
	Employee(id='emp_2', name='Bolu Adebayo', grossSalary=450000, jobTitle='Product Manager', hireDate='2021-11-20T00:00:00Z', email='bolu.adebayo@example.com', bankName='Kuda Bank', accountNumber='0987654321'),
	Employee(id='emp_3', name='Chidi Eze', grossSalary=150000, jobTitle='Junior Designer', hireDate='2023-08-01T00:00:00Z', email='chidi.eze@example.com', bankName='Access Bank', accountNumber='1122334455'),
	Employee(id='emp_4', name='Funke Williams', grossSalary=800000, jobTitle='Chief Operating Officer', hireDate='2020-02-10T00:00:00Z', email='funke.williams@example.com', bankName='Zenith Bank', accountNumber='5566778899'),
]

# Invoices
_now = datetime.utcnow()
_one_week_ago = _now - timedelta(days=7)
_two_weeks_from_now = _now + timedelta(days=14)

invoices: List[Invoice] = [
	Invoice(id='inv_1', customer='Client A Inc.', description='Web Development Services', amount=500000, vat=37500, total=537500, issueDate=_one_week_ago.isoformat()+"Z", dueDate=_two_weeks_from_now.isoformat()+"Z", status='Unpaid', whtApplied=True, lineItems=[LineItem(id='li_1', name='Web Dev', description=' retainer', quantity=1, unitPrice=500000, total=500000)]),
	Invoice(id='inv_2', customer='Client B Ltd.', description='Q4 Social Media Campaign', amount=750000, vat=56250, total=806250, issueDate=datetime(2023, 11, 2).isoformat()+"Z", dueDate=datetime(2023, 12, 2).isoformat()+"Z", status='Paid', whtApplied=True, lineItems=[LineItem(id='li_2', name='SMM', description='q4', quantity=1, unitPrice=750000, total=750000)]),
	Invoice(id='inv_3', customer='Startup C', description='Initial Consultation', amount=50000, vat=0, total=50000, issueDate=_now.isoformat()+"Z", dueDate=_now.isoformat()+"Z", status='Draft', whtApplied=False, lineItems=[LineItem(id='li_3', name='Consult', description='initial', quantity=1, unitPrice=50000, total=50000)]),
	Invoice(id='inv_4', customer='Legacy Corp', description='System Maintenance - Oct', amount=120000, vat=9000, total=129000, issueDate=datetime(2023, 10, 15).isoformat()+"Z", dueDate=datetime(2023, 11, 15).isoformat()+"Z", status='Overdue', whtApplied=False, lineItems=[LineItem(id='li_4', name='Maint', description='oct', quantity=1, unitPrice=120000, total=120000)]),
]

# Bills
_one_month_from_now = _now + timedelta(days=30)

bills: List[Bill] = [
	Bill(id='bill_1', vendor='Paystack', description='Monthly API Subscription', amount=10000, issueDate=_one_week_ago.isoformat()+"Z", dueDate=_two_weeks_from_now.isoformat()+"Z", status='Unpaid', whtApplies=False, lineItems=[LineItem(id='li_b1', name='sub', description='api', quantity=1, unitPrice=10000, total=10000)]),
	Bill(id='bill_2', vendor='Google Workspace', description='Team Business Plan', amount=35000, issueDate=datetime(_now.year, _now.month, 1).isoformat()+"Z", dueDate=datetime(_now.year, _now.month, 15).isoformat()+"Z", status='Unpaid', whtApplies=True, lineItems=[LineItem(id='li_b2', name='gsuite', description='team', quantity=1, unitPrice=35000, total=35000)]),
	Bill(id='bill_3', vendor='Landlord-Office Space', description='November Office Rent', amount=450000, issueDate=datetime(2023, 11, 1).isoformat()+"Z", dueDate=datetime(2023, 11, 5).isoformat()+"Z", status='Paid', whtApplies=False, lineItems=[LineItem(id='li_b3', name='rent', description='office', quantity=1, unitPrice=450000, total=450000)]),
]

# Inventory
inventory_items: List[InventoryItem] = [
	InventoryItem(id='inv_item_1', name='Web Dev Retainer (Monthly)', sku='WD-RETAIN', category='Services', type='Service', costPrice=0, salePrice=500000, quantity=9999),
	InventoryItem(id='inv_item_2', name='Social Media Management', sku='SMM-BASIC', category='Services', type='Service', costPrice=0, salePrice=250000, quantity=9999),
	InventoryItem(id='inv_item_3', name='Laptop - 16" Pro', sku='HW-LAP-PRO16', category='Hardware', type='Product', costPrice=950000, salePrice=1250000, quantity=5),
	InventoryItem(id='inv_item_4', name='Ergonomic Office Chair', sku='HW-CHR-ERGO', category='Furniture', type='Product', costPrice=85000, salePrice=150000, quantity=12),
]

# Purchase Orders
purchase_orders: List[PurchaseOrder] = [
	PurchaseOrder(
		id=f"po_{int(_now.timestamp())-10000}",
		vendor='Tech Supplies Ltd',
		issueDate=(_now - timedelta(days=5)).isoformat()+"Z",
		expectedDeliveryDate=_now.isoformat()+"Z",
		status='Sent',
		lineItems=[LineItem(id='li_po1_1', inventoryItemId='inv_item_3', name='Laptop - 16" Pro', description='For new developer', quantity=2, unitPrice=950000, total=1900000)],
		total=1900000
	)
]

# Estimates
estimates: List[Estimate] = [
	Estimate(
		id=f"est_{int(_now.timestamp())-20000}",
		customer='Potential Client X',
		issueDate=(_now - timedelta(days=3)).isoformat()+"Z",
		expiryDate=(_now + timedelta(days=10)).isoformat()+"Z",
		status='Sent',
		lineItems=[
			LineItem(id='li_est1_1', inventoryItemId='inv_item_1', name='Web Dev Retainer (Monthly)', description='Full package', quantity=1, unitPrice=500000, total=500000),
			LineItem(id='li_est1_2', inventoryItemId='inv_item_2', name='Social Media Management', description='Basic package', quantity=1, unitPrice=250000, total=250000),
		],
		total=750000
	)
]

# Journal Entries
journal_entries: List[JournalEntry] = [
	JournalEntry(
		id=f"je_{int(_now.timestamp())-50000}",
		date=(_now - timedelta(days=30)).isoformat()+"Z",
		narration='To record depreciation for the month',
		lines=[
			JournalLine(accountName='Depreciation', type='debit', amount=50000),
			JournalLine(accountName='Accumulated Depreciation', type='credit', amount=50000),
		]
	)
]

# Projects
projects: List[Project] = [
	Project(id='proj_1', name='Aura Website Revamp'),
	Project(id='proj_2', name='Q4 Marketing Campaign'),
	Project(id='proj_3', name='Internal HR Platform'),
]

# Budgets
budgets: List[Budget] = [
	Budget(category='Software & Subscriptions', amount=50000),
	Budget(category='Marketing & Advertising', amount=100000),
	Budget(category='Travel', amount=75000),
]

# Connections
connections: List[BankConnection] = []

# Transactions
transactions: List[RawTransaction] = [
	RawTransaction(id='txn_1', amount=500000, type='credit', date='2023-10-28T10:00:00Z', narration='PAYSTACK/INVOICE-CLIENT-A', balance=1500000),
	RawTransaction(id='txn_2', amount=25000, type='debit', date='2023-10-28T12:30:00Z', narration='BUYGOODS/JUMIA-OFFICESUPPLIES', balance=1475000),
	RawTransaction(id='txn_3', amount=5000, type='debit', date='2023-10-29T09:15:00Z', narration='AIRTIME VTU PURCHASE-MTN', balance=1470000),
	RawTransaction(id='txn_4', amount=150000, type='debit', date='2023-10-30T18:00:00Z', narration='NIP/UBA-DESIGNER-OCT-SALARY', balance=1320000),
	RawTransaction(id='txn_5', amount=75000, type='debit', date='2023-11-01T11:00:00Z', narration='WEB/GOOGLE-ADS-MARKETING', balance=1245000),
	RawTransaction(id='txn_6', amount=750000, type='credit', date='2023-11-02T14:20:00Z', narration='NIP FROM CLIENT B', balance=1995000),
	RawTransaction(id='txn_7', amount=15000, type='debit', date='2023-11-03T13:00:00Z', narration='IKEDC/ELECTRICITY-BILL', balance=1980000),
	RawTransaction(id='txn_8', amount=12500, type='debit', date='2023-11-05T16:45:00Z', narration='BOLT/RIDE-IKEJA', balance=1967500),
	RawTransaction(id='txn_9', amount=350000, type='debit', date='2023-11-06T10:00:00Z', narration='NIP/UBA-DEVELOPER-NOV-SALARY', balance=1617500),
	RawTransaction(id='txn_10', amount=250000, type='credit', date='2023-11-07T15:00:00Z', narration='PAYMENT RECEIVED/PROJECT-C', balance=1867500),
]

# Helpers

def _now_iso() -> str:
	return datetime.utcnow().isoformat()+"Z"