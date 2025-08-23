from fastapi import APIRouter
from typing import List
from ..schemas import Budget, BudgetsUpdateRequest
from .. import db

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.get("/", response_model=List[Budget])
def list_budgets():
	return list(db.budgets)

@router.put("/", response_model=List[Budget])
def update_budgets(payload: BudgetsUpdateRequest):
	db.budgets = payload.budgets
	return list(db.budgets)