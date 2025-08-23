from fastapi import APIRouter
from typing import List
from ..schemas import PurchaseOrder, PurchaseOrderCreate
from .. import db

router = APIRouter(prefix="/purchase-orders", tags=["purchase_orders"])

@router.get("/", response_model=List[PurchaseOrder])
def list_pos():
	return list(db.purchase_orders)

@router.post("/", response_model=PurchaseOrder)
def create_po(payload: PurchaseOrderCreate):
	po = PurchaseOrder(id=f"po_{int(__import__('time').time()*1000)}", issueDate=db._now_iso(), status='Draft', **payload.model_dump())
	db.purchase_orders.insert(0, po)
	return po