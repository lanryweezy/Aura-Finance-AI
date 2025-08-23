from fastapi import APIRouter
from typing import List
from ..schemas import Estimate, EstimateCreate
from .. import db

router = APIRouter(prefix="/estimates", tags=["estimates"])

@router.get("/", response_model=List[Estimate])
def list_estimates():
	return list(db.estimates)

@router.post("/", response_model=Estimate)
def create_estimate(payload: EstimateCreate):
	est = Estimate(id=f"est_{int(__import__('time').time()*1000)}", issueDate=db._now_iso(), status='Draft', **payload.model_dump())
	db.estimates.insert(0, est)
	return est