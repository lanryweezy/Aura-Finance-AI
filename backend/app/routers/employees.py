from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas import Employee, EmployeeCreate, EmployeeUpdate
from ..repository import repository

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("/", response_model=List[Employee])
async def list_employees():
	employees = await repository.employees.get_all()
	return sorted(employees, key=lambda e: e.name)

@router.post("/", response_model=Employee)
async def create_employee(payload: EmployeeCreate):
	new_emp = Employee(id=f"emp_{int(__import__('time').time()*1000)}", **payload.model_dump())
	return await repository.employees.create(new_emp)

@router.put("/{employee_id}", response_model=Employee)
async def update_employee(employee_id: str, payload: EmployeeUpdate):
    updates = payload.model_dump(exclude_unset=True)
    updated = await repository.employees.update(employee_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return updated

@router.delete("/{employee_id}")
async def delete_employee(employee_id: str):
	success = await repository.employees.delete(employee_id)
	if not success:
		raise HTTPException(status_code=404, detail="Employee not found")
	return {"ok": True}