from fastapi import APIRouter
from typing import List
from ..schemas import JournalEntry, JournalEntryCreate
from .. import db

router = APIRouter(prefix="/journal-entries", tags=["journal_entries"])

@router.get("/", response_model=List[JournalEntry])
def list_journal_entries():
	return list(db.journal_entries)

@router.post("/", response_model=JournalEntry)
def create_journal_entry(payload: JournalEntryCreate):
	entry = JournalEntry(id=f"je_{int(__import__('time').time()*1000)}", date=db._now_iso(), **payload.model_dump())
	db.journal_entries.insert(0, entry)
	return entry