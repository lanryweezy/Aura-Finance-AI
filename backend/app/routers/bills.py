from fastapi import APIRouter
from typing import List
from ..schemas import Bill, BillCreate
from .. import db

router = APIRouter(prefix="/bills", tags=["bills"])

@router.get("/", response_model=List[Bill])
def list_bills():
	def compute_status(b: Bill) -> Bill:
		if b.status == 'Paid':
			return b
		from datetime import datetime
		if datetime.fromisoformat(b.dueDate.replace('Z','')) < datetime.utcnow():
			b.status = 'Overdue'
		else:
			b.status = 'Unpaid'
		return b
	return [compute_status(b) for b in sorted(db.bills, key=lambda x: x.dueDate, reverse=True)]

@router.post("/", response_model=Bill)
def create_bill(payload: BillCreate):
	bill = Bill(id=f"bill_{int(__import__('time').time()*1000)}", issueDate=db._now_iso(), status='Unpaid', **payload.model_dump())
	db.bills.insert(0, bill)
	return bill