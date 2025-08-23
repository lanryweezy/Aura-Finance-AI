from fastapi import APIRouter
from typing import List
from ..schemas import Bill, BillCreate
from ..repository import repository, compute_bill_status

router = APIRouter(prefix="/bills", tags=["bills"])

@router.get("/", response_model=List[Bill])
async def list_bills():
	bills = await repository.bills.get_all()
	
	# Apply computed status to all bills
	bills_with_status = []
	for bill in bills:
		computed_status = compute_bill_status(bill)
		bill_data = bill.model_dump()
		bill_data['status'] = computed_status
		bills_with_status.append(Bill(**bill_data))
	
	return sorted(bills_with_status, key=lambda x: x.dueDate, reverse=True)

@router.post("/", response_model=Bill)
async def create_bill(payload: BillCreate):
	from datetime import datetime
	bill = Bill(
		id=f"bill_{int(__import__('time').time()*1000)}", 
		issueDate=datetime.utcnow().isoformat(), 
		status='Unpaid', 
		**payload.model_dump()
	)
	return await repository.bills.create(bill)