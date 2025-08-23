from fastapi import APIRouter
from typing import List
from ..schemas import RawTransaction
from .. import db

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("/", response_model=List[RawTransaction])
def list_transactions():
	return list(db.transactions)