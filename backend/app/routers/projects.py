from fastapi import APIRouter
from typing import List
from ..schemas import Project, ProjectCreate
from .. import db

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", response_model=List[Project])
def list_projects():
	return list(db.projects)

@router.post("/", response_model=Project)
def create_project(payload: ProjectCreate):
	proj = Project(id=f"proj_{int(__import__('time').time()*1000)}", **payload.model_dump())
	db.projects.append(proj)
	return proj