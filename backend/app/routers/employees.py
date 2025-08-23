from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas import Employee, EmployeeCreate, EmployeeUpdate
from .. import db

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("/", response_model=List[Employee])
def list_employees():
	return sorted(db.employees, key=lambda e: e.name)

@router.post("/", response_model=Employee)
def create_employee(payload: EmployeeCreate):
	new_emp = Employee(id=f"emp_{int(__import__('time').time()*1000)}", **payload.model_dump())
	db.employees.append(new_emp)
	return new_emp

@router.put("/{employee_id}", response_model=Employee)
def update_employee(employee_id: str, payload: EmployeeUpdate):
    for idx, emp in enumerate(db.employees):
        if emp.id == employee_id:
            # Preserve the original ID and merge updates
            updated_data = payload.model_dump(exclude_unset=True)
            updated_data['id'] = emp.id  # Ensure ID is preserved
            updated = Employee(**{**emp.model_dump(), **updated_data})
            db.employees[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Employee not found")

@router.delete("/{employee_id}")
def delete_employee(employee_id: str):
	before = len(db.employees)
	db.employees = [e for e in db.employees if e.id != employee_id]
	if len(db.employees) == before:
		raise HTTPException(status_code=404, detail="Employee not found")
	return {"ok": True}