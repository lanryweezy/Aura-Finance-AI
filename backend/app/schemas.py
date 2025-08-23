from pydantic import BaseModel
from typing import List, Literal, Optional

class RawTransaction(BaseModel):
	id: str
	amount: float
	type: Literal['debit', 'credit']
	date: str
	narration: str
	balance: Optional[float] = None

class CategorizedTransaction(RawTransaction):
	category: str
	projectId: Optional[str] = None
	receiptUrl: Optional[str] = None

class LineItem(BaseModel):
	id: str
	name: str
	description: Optional[str] = None
	quantity: int
	unitPrice: float
	total: float
	inventoryItemId: Optional[str] = None

class Bill(BaseModel):
	id: str
	vendor: str
	description: str
	amount: float
	issueDate: str
	dueDate: str
	status: Literal['Paid', 'Unpaid', 'Overdue', 'Draft']
	whtApplies: bool
	lineItems: List[LineItem]
	projectId: Optional[str] = None

class Invoice(BaseModel):
	id: str
	customer: str
	description: str
	amount: float
	vat: float
	total: float
	issueDate: str
	dueDate: str
	status: Literal['Paid', 'Unpaid', 'Overdue', 'Draft']
	whtApplied: bool
	lineItems: List[LineItem]
	projectId: Optional[str] = None

class Employee(BaseModel):
	id: str
	name: str
	jobTitle: str
	hireDate: str
	email: str
	bankName: str
	accountNumber: str
	grossSalary: float

class JournalLine(BaseModel):
	accountName: str
	type: Literal['debit', 'credit']
	amount: float
	description: Optional[str] = None

class JournalEntry(BaseModel):
	id: str
	date: str
	narration: str
	lines: List[JournalLine]

class Project(BaseModel):
	id: str
	name: str

class Budget(BaseModel):
	category: str
	amount: float

class PurchaseOrder(BaseModel):
	id: str
	vendor: str
	issueDate: str
	expectedDeliveryDate: str
	status: Literal['Draft', 'Sent', 'Completed', 'Cancelled']
	lineItems: List[LineItem]
	total: float
	projectId: Optional[str] = None

class Estimate(BaseModel):
	id: str
	customer: str
	issueDate: str
	expiryDate: str
	status: Literal['Draft', 'Sent', 'Accepted', 'Declined']
	lineItems: List[LineItem]
	total: float
	projectId: Optional[str] = None

class InventoryItem(BaseModel):
	id: str
	name: str
	sku: str
	category: str
	type: Literal['Product', 'Service']
	costPrice: float
	salePrice: float
	quantity: int

class BankConnection(BaseModel):
	id: str
	provider: Literal['mono', 'okra']
	bankName: str
	accountNumber: str
	accountName: str
	lastSynced: str

# Request models (for create/update without id/autofields)
class EmployeeCreate(BaseModel):
	name: str
	jobTitle: str
	hireDate: str
	email: str
	bankName: str
	accountNumber: str
	grossSalary: float

class EmployeeUpdate(EmployeeCreate):
	id: str

class BillCreate(BaseModel):
	vendor: str
	description: str
	amount: float
	dueDate: str
	whtApplies: bool
	lineItems: List[LineItem]
	projectId: Optional[str] = None

class InvoiceCreate(BaseModel):
	customer: str
	description: str
	amount: float
	vat: float
	total: float
	dueDate: str
	whtApplied: bool
	lineItems: List[LineItem]
	projectId: Optional[str] = None

class InventoryItemCreate(BaseModel):
	name: str
	sku: str
	category: str
	type: Literal['Product', 'Service']
	costPrice: float
	salePrice: float
	quantity: int

class InventoryItemUpdate(InventoryItemCreate):
	id: str

class StockAdjustRequest(BaseModel):
	delta: int

class PurchaseOrderCreate(BaseModel):
	vendor: str
	expectedDeliveryDate: str
	lineItems: List[LineItem]
	total: float
	projectId: Optional[str] = None

class EstimateCreate(BaseModel):
	customer: str
	expiryDate: str
	lineItems: List[LineItem]
	total: float
	projectId: Optional[str] = None

class JournalEntryCreate(BaseModel):
	narration: str
	lines: List[JournalLine]

class ProjectCreate(BaseModel):
	name: str

class BudgetsUpdateRequest(BaseModel):
	budgets: List[Budget]

class ConnectRequest(BaseModel):
	provider: Literal['mono', 'okra']