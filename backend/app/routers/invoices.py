from fastapi import APIRouter
from typing import List
from ..schemas import Invoice, InvoiceCreate
from .. import db

router = APIRouter(prefix="/invoices", tags=["invoices"])

@router.get("/", response_model=List[Invoice])
def list_invoices():
	def compute_status(inv: Invoice) -> Invoice:
		if inv.status in ("Paid", "Draft"):
			return inv
		from datetime import datetime
		if datetime.fromisoformat(inv.dueDate.replace('Z','')) < datetime.utcnow():
			inv.status = 'Overdue'
		else:
			inv.status = 'Unpaid'
		return inv
	return [compute_status(i) for i in sorted(db.invoices, key=lambda x: x.dueDate)]

@router.post("/", response_model=Invoice)
def create_invoice(payload: InvoiceCreate):
	inv = Invoice(id=f"inv_{int(__import__('time').time()*1000)}", issueDate=db._now_iso(), status='Draft', **payload.model_dump())
	db.invoices.insert(0, inv)
	return inv